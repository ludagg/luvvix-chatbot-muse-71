
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GROQ_API_KEY = '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';
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    const { topic, difficulty, duration, type } = await req.json();

    // Générer le contenu du cours avec Groq
    const coursePrompt = `
Créez un cours complet et professionnel sur "${topic}" avec les spécifications suivantes:
- Niveau: ${difficulty}
- Durée: ${duration}
- Type: ${type}

Le cours doit inclure:
1. Un titre accrocheur et professionnel
2. Une description détaillée et engageante
3. Les objectifs d'apprentissage clairs
4. Un plan de cours structuré avec modules et leçons
5. Des exercices pratiques pour chaque module
6. Des projets concrets à réaliser
7. Des critères d'évaluation précis
8. Des ressources supplémentaires

Retournez le résultat en JSON avec cette structure:
{
  "title": "titre du cours",
  "description": "description complète",
  "objectives": ["objectif 1", "objectif 2", ...],
  "modules": [
    {
      "title": "Module 1",
      "description": "description du module",
      "lessons": [
        {
          "title": "Leçon 1.1",
          "content": "contenu détaillé",
          "duration": "durée estimée",
          "exercises": ["exercice 1", "exercice 2"]
        }
      ],
      "project": "projet pratique du module"
    }
  ],
  "assessment": {
    "type": "type d'évaluation",
    "criteria": ["critère 1", "critère 2"],
    "passingScore": 80
  },
  "resources": ["ressource 1", "ressource 2"],
  "estimatedHours": nombre_heures,
  "difficulty": "${difficulty}",
  "category": "catégorie appropriée"
}

Soyez très détaillé et professionnel. Le contenu doit être de qualité industrielle.
`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-70b-versatile',
        messages: [{
          role: 'user',
          content: coursePrompt
        }],
        temperature: 0.7,
        max_tokens: 4000,
      })
    });

    if (!groqResponse.ok) {
      throw new Error(`Groq API error: ${groqResponse.status}`);
    }

    const groqData = await groqResponse.json();
    const courseContent = groqData.choices?.[0]?.message?.content;

    if (!courseContent) {
      throw new Error('No course content generated');
    }

    // Extraire le JSON de la réponse
    const jsonMatch = courseContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const course = JSON.parse(jsonMatch[0]);

    // Générer des questions d'examen avec Gemini
    if (GEMINI_API_KEY) {
      const examPrompt = `
Créez 20 questions d'examen pour le cours "${course.title}" de niveau ${difficulty}.
Les questions doivent couvrir tous les modules et être variées (QCM, vrai/faux, questions courtes).

Format JSON:
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correct": "A",
      "explanation": "Explication de la réponse"
    },
    {
      "type": "true_false",
      "question": "Question text",
      "correct": true,
      "explanation": "Explication"
    },
    {
      "type": "short_answer",
      "question": "Question text",
      "answer": "Réponse attendue",
      "keywords": ["mot-clé1", "mot-clé2"]
    }
  ]
}
`;

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: examPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.5,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 3000,
          }
        })
      });

      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        const examContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (examContent) {
          const examMatch = examContent.match(/\{[\s\S]*\}/);
          if (examMatch) {
            const examData = JSON.parse(examMatch[0]);
            course.exam = examData;
          }
        }
      }
    }

    // Ajouter des métadonnées
    course.id = crypto.randomUUID();
    course.createdAt = new Date().toISOString();
    course.aiGenerated = true;
    course.status = 'draft';
    course.version = '1.0';

    return new Response(JSON.stringify({ 
      success: true, 
      course 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating course:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
