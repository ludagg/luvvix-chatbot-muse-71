
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

    console.log('Démarrage de la mise à jour automatique du contenu...');

    // Obtenir les dernières tendances technologiques
    const trendsPrompt = `
Analysez les dernières tendances technologiques et identifiez 10 sujets d'apprentissage prioritaires pour les développeurs web en 2024.
Pour chaque sujet, indiquez:
- Le niveau de priorité (1-10)
- La demande du marché
- Les compétences clés à acquérir
- La difficulté d'apprentissage

Retournez en JSON:
{
  "trends": [
    {
      "topic": "nom du sujet",
      "priority": 9,
      "marketDemand": "Très élevée",
      "keySkills": ["compétence 1", "compétence 2"],
      "difficulty": "Intermédiaire",
      "description": "Description détaillée"
    }
  ],
  "updateDate": "2024-01-27"
}
`;

    const trendsResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-70b-versatile',
        messages: [{
          role: 'user',
          content: trendsPrompt
        }],
        temperature: 0.3,
        max_tokens: 2000,
      })
    });

    if (!trendsResponse.ok) {
      throw new Error(`Groq API error: ${trendsResponse.status}`);
    }

    const trendsData = await trendsResponse.json();
    const trendsContent = trendsData.choices?.[0]?.message?.content;

    let trends = null;
    if (trendsContent) {
      const trendsMatch = trendsContent.match(/\{[\s\S]*\}/);
      if (trendsMatch) {
        trends = JSON.parse(trendsMatch[0]);
      }
    }

    // Générer de nouveaux cours basés sur les tendances
    const newCourses = [];
    if (trends && trends.trends) {
      for (const trend of trends.trends.slice(0, 3)) { // Limiter à 3 nouveaux cours
        const coursePrompt = `
Créez un cours complet sur "${trend.topic}" optimisé pour la demande actuelle du marché.

Spécifications:
- Niveau: ${trend.difficulty}
- Focus sur les compétences: ${trend.keySkills.join(', ')}
- Orientation pratique et professionnelle
- Projets concrets d'entreprise

Retournez en JSON:
{
  "title": "titre professionnel",
  "description": "description marketing",
  "category": "catégorie",
  "duration": "durée en semaines",
  "modules": [
    {
      "title": "Module title",
      "lessons": [
        {
          "title": "Lesson title",
          "content": "Contenu détaillé",
          "practicalExercises": ["exercice 1", "exercice 2"],
          "realWorldProject": "projet concret"
        }
      ]
    }
  ],
  "certification": {
    "available": true,
    "requirements": "critères",
    "industryRecognition": "reconnaissance"
  },
  "marketRelevance": ${trend.priority},
  "skillsAcquired": ${JSON.stringify(trend.keySkills)}
}
`;

        const courseResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
            temperature: 0.5,
            max_tokens: 3000,
          })
        });

        if (courseResponse.ok) {
          const courseData = await courseResponse.json();
          const courseContent = courseData.choices?.[0]?.message?.content;
          
          if (courseContent) {
            const courseMatch = courseContent.match(/\{[\s\S]*\}/);
            if (courseMatch) {
              const course = JSON.parse(courseMatch[0]);
              course.id = crypto.randomUUID();
              course.createdAt = new Date().toISOString();
              course.aiGenerated = true;
              course.autoUpdated = true;
              course.trendBased = true;
              newCourses.push(course);
            }
          }
        }
      }
    }

    // Analyser et améliorer les cours existants avec Gemini
    let improvements = null;
    if (GEMINI_API_KEY) {
      const improvementPrompt = `
Analysez les performances d'apprentissage et suggérez des améliorations pour optimiser l'efficacité pédagogique:

1. Améliorations de contenu
2. Nouvelles méthodes pédagogiques
3. Exercices plus engageants
4. Projets plus pertinents
5. Évaluations plus précises

Retournez en JSON:
{
  "improvements": [
    {
      "area": "content",
      "suggestion": "amélioration suggérée",
      "impact": "impact attendu",
      "implementation": "comment implémenter"
    }
  ],
  "newFeatures": [
    {
      "feature": "nom de la fonctionnalité",
      "description": "description",
      "benefit": "bénéfice pour l'apprenant"
    }
  ]
}
`;

      const improvementResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: improvementPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2000,
          }
        })
      });

      if (improvementResponse.ok) {
        const improvementData = await improvementResponse.json();
        const improvementContent = improvementData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (improvementContent) {
          const improvementMatch = improvementContent.match(/\{[\s\S]*\}/);
          if (improvementMatch) {
            improvements = JSON.parse(improvementMatch[0]);
          }
        }
      }
    }

    console.log(`Mise à jour terminée: ${newCourses.length} nouveaux cours générés`);

    return new Response(JSON.stringify({ 
      success: true,
      report: {
        newCoursesGenerated: newCourses.length,
        trendsAnalyzed: trends?.trends?.length || 0,
        improvementsSuggested: improvements?.improvements?.length || 0,
        timestamp: new Date().toISOString()
      },
      data: {
        trends,
        newCourses,
        improvements
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in content updater:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
