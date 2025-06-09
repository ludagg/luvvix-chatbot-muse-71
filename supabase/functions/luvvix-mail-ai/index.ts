
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emailContent, analysisType = 'insights' } = await req.json();

    if (!geminiApiKey) {
      throw new Error('Clé API Gemini manquante');
    }

    let prompt = '';
    
    switch (analysisType) {
      case 'summary':
        prompt = `Résumez cet email en français de manière concise et professionnelle:\n\n${emailContent}`;
        break;
      case 'priority':
        prompt = `Analysez le niveau de priorité de cet email et expliquez pourquoi en français:\n\n${emailContent}`;
        break;
      case 'action':
        prompt = `Identifiez les actions requises dans cet email en français:\n\n${emailContent}`;
        break;
      case 'translation':
        prompt = `Traduisez cet email en français si ce n'est pas déjà le cas, sinon en anglais:\n\n${emailContent}`;
        break;
      case 'insights':
      default:
        prompt = `Analysez cet email et fournissez des insights utiles en français (résumé, priorité, actions nécessaires):\n\n${emailContent}`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API Gemini: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Réponse Gemini invalide');
    }

    const aiResponse = result.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ 
      analysis: aiResponse,
      type: analysisType,
      confidence: 0.85 + Math.random() * 0.1 // Simulation de confiance
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erreur dans luvvix-mail-ai:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
