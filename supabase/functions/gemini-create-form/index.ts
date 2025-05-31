
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { description, userId } = await req.json();
    
    if (!description || !userId) {
      throw new Error('Description et userId requis');
    }

    console.log('Génération de formulaire avec Gemini pour:', description);

    // Appel à l'API Gemini pour générer le formulaire
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Tu es un expert en création de formulaires. Crée un formulaire complet basé sur cette description: "${description}".

Retourne UNIQUEMENT un JSON valide avec cette structure exacte:
{
  "title": "Titre du formulaire",
  "description": "Description détaillée",
  "settings": {
    "requiresAuth": false,
    "collectEmail": true,
    "maxResponses": null,
    "closesAt": null,
    "confirmationMessage": "Merci pour votre réponse !",
    "theme": "default",
    "allowMultipleResponses": false
  },
  "questions": [
    {
      "question_text": "Texte de la question",
      "question_type": "text|textarea|multipleChoice|checkboxes|dropdown|email|number|date|phone|url",
      "description": "Description optionnelle",
      "required": true,
      "options": {
        "choices": ["Option 1", "Option 2"] // uniquement pour multipleChoice, checkboxes, dropdown
      }
    }
  ]
}

Crée au moins 3-8 questions pertinentes selon la description. Utilise différents types de questions appropriés.`
          }]
        }]
      }),
    });

    const geminiData = await response.json();
    
    if (!geminiData.candidates || !geminiData.candidates[0]) {
      throw new Error('Réponse Gemini invalide');
    }

    const generatedText = geminiData.candidates[0].content.parts[0].text;
    console.log('Réponse Gemini:', generatedText);
    
    // Parser le JSON généré par Gemini
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Format JSON non trouvé dans la réponse');
    }
    
    const formData = JSON.parse(jsonMatch[0]);
    
    // Créer le formulaire dans Supabase
    const { data: form, error: formError } = await supabase
      .from('forms')
      .insert({
        user_id: userId,
        title: formData.title,
        description: formData.description,
        settings: formData.settings,
        published: true
      })
      .select()
      .single();

    if (formError) throw formError;

    // Créer les questions
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      const { error: questionError } = await supabase
        .from('form_questions')
        .insert({
          form_id: form.id,
          question_text: question.question_text,
          question_type: question.question_type,
          description: question.description || null,
          required: question.required,
          options: question.options || {},
          position: i + 1
        });

      if (questionError) throw questionError;
    }

    console.log('Formulaire créé avec succès:', form.id);

    return new Response(JSON.stringify({ 
      success: true, 
      formId: form.id,
      form: form
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur création formulaire IA:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
