
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { course, lessons, questionCount = 10 } = await req.json();
    console.log('🧩 Génération de quiz pour:', course.title, 'avec', questionCount, 'questions');

    // Forcer à 10 questions maximum
    const finalQuestionCount = Math.min(questionCount, 10);
    
    const quiz = await generateQuizWithGemini(course, lessons, finalQuestionCount);

    return new Response(
      JSON.stringify(quiz),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Erreur génération quiz:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateQuizWithGemini(course: any, lessons: any[], questionCount: number) {
  console.log('🧠 Génération de quiz intelligent avec Gemini 1.5 Flash...');

  const lessonsContent = lessons.map(l => `${l.title}: ${l.content}`).join('\n\n');

  const prompt = `Tu es un expert en évaluation pédagogique. Crée un quiz d'examen final de EXACTEMENT ${questionCount} questions à choix multiples pour évaluer la maîtrise de ce cours :

COURS : ${course.title}
DESCRIPTION : ${course.description}
CATÉGORIE : ${course.category}
NIVEAU : ${course.difficulty}
OBJECTIFS : ${course.objectives?.join(', ')}

CONTENU DES LEÇONS :
${lessonsContent.substring(0, 4000)}

INSTRUCTIONS IMPORTANTES :
1. Crée EXACTEMENT ${questionCount} questions QCM de qualité professionnelle
2. Couvre TOUT le contenu du cours de manière équilibrée
3. Varie les niveaux : connaissance (30%), compréhension (40%), application (30%)
4. 4 choix de réponse par question, avec UNE seule bonne réponse
5. Inclus des explications détaillées pour chaque réponse
6. Répartis les questions sur tous les sujets abordés
7. Assure-toi que les questions sont précises et sans ambiguïté
8. Chaque question vaut 10 points (total: ${questionCount * 10} points)

Réponds UNIQUEMENT au format JSON suivant :
{
  "questions": [
    {
      "id": "q1",
      "question": "Question précise et claire ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Explication détaillée de pourquoi cette réponse est correcte et les autres incorrectes",
      "category": "Catégorie du sujet",
      "difficulty": "beginner/intermediate/advanced",
      "points": 10,
      "type": "multiple_choice"
    }
  ]
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 4096
      }
    })
  });

  const result = await response.json();
  
  if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Réponse invalide de Gemini 1.5 Flash');
  }

  const generatedText = result.candidates[0].content.parts[0].text;

  // Extraire le JSON de la réponse
  const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Impossible d\'extraire le JSON du quiz');
  }

  const quizData = JSON.parse(jsonMatch[0]);
  
  // Vérifier qu'on a le bon nombre de questions
  if (quizData.questions.length !== questionCount) {
    console.warn(`⚠️ Nombre de questions incorrect: ${quizData.questions.length}, attendu: ${questionCount}`);
    
    // Ajuster le nombre de questions
    if (quizData.questions.length > questionCount) {
      quizData.questions = quizData.questions.slice(0, questionCount);
    } else {
      throw new Error(`Pas assez de questions générées: ${quizData.questions.length}/${questionCount}`);
    }
  }
  
  console.log('✅ Quiz généré avec Gemini 1.5 Flash:', quizData.questions.length, 'questions');

  return quizData;
}
