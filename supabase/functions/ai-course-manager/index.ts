
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
    const { action, courseData, userId, category, difficulty } = await req.json();

    console.log('Action demandée:', action);

    if (action === 'generate_course') {
      // Générer un cours complet avec Gemini
      const prompt = `Tu es LuvviX AI, un expert pédagogique autonome. Génère un cours complet sur le sujet "${courseData.topic}" pour le niveau "${difficulty}" dans la catégorie "${category}".

Structure JSON requise:
{
  "title": "Titre du cours",
  "description": "Description complète et engageante",
  "category": "${category}",
  "difficulty_level": "${difficulty}",
  "duration_minutes": 120,
  "learning_objectives": ["Objectif 1", "Objectif 2", "Objectif 3"],
  "prerequisites": ["Prérequis 1", "Prérequis 2"],
  "tags": ["tag1", "tag2", "tag3"],
  "lessons": [
    {
      "title": "Leçon 1: Introduction",
      "content": "Contenu détaillé de la leçon avec explications, exemples, et exercices pratiques",
      "lesson_order": 1,
      "duration_minutes": 30,
      "lesson_type": "theory",
      "quiz": {
        "title": "Quiz Leçon 1",
        "questions": [
          {
            "question": "Question 1?",
            "type": "multiple_choice",
            "options": ["A", "B", "C", "D"],
            "correct_answer": "A",
            "explanation": "Explication de la réponse"
          }
        ]
      }
    }
  ]
}

Assure-toi que le contenu soit:
- Pédagogique et progressif
- Adapté au niveau spécifié
- Riche en exemples pratiques
- Incluant 4-6 leçons minimum
- Avec quiz après chaque leçon`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 4000 }
        }),
      });

      const geminiData = await response.json();
      const generatedText = geminiData.candidates[0].content.parts[0].text;
      
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Format JSON invalide');
      
      const courseContent = JSON.parse(jsonMatch[0]);

      // Créer le cours dans la base de données
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: courseContent.title,
          description: courseContent.description,
          category: courseContent.category,
          difficulty_level: courseContent.difficulty_level,
          duration_minutes: courseContent.duration_minutes,
          learning_objectives: courseContent.learning_objectives,
          prerequisites: courseContent.prerequisites,
          tags: courseContent.tags,
          ai_generated: true,
          status: 'active'
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // Créer les leçons et quiz
      for (const lesson of courseContent.lessons) {
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            course_id: course.id,
            title: lesson.title,
            content: lesson.content,
            lesson_order: lesson.lesson_order,
            duration_minutes: lesson.duration_minutes,
            lesson_type: lesson.lesson_type
          })
          .select()
          .single();

        if (lessonError) throw lessonError;

        // Créer le quiz associé
        if (lesson.quiz) {
          await supabase
            .from('quizzes')
            .insert({
              lesson_id: lessonData.id,
              title: lesson.quiz.title,
              questions: lesson.quiz.questions,
              passing_score: 70
            });
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        course: course,
        message: 'Cours généré avec succès par LuvviX AI'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'auto_update_courses') {
      // Analyser et mettre à jour automatiquement les cours
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('ai_generated', true)
        .eq('status', 'active');

      for (const course of courses || []) {
        // Analyser les performances du cours
        const { data: analytics } = await supabase
          .from('learning_analytics')
          .select('*')
          .eq('course_id', course.id);

        if (analytics && analytics.length > 50) {
          // Si le cours a assez de données, l'analyser
          const prompt = `Analyse ce cours "${course.title}" basé sur les données d'usage. 
          
Données analytics: ${JSON.stringify(analytics.slice(0, 20))}

Détermine si le cours nécessite:
- Mise à jour du contenu
- Ajustement de difficulté
- Nouvelles leçons
- Restructuration

Réponds en JSON:
{
  "needs_update": true/false,
  "reasoning": "Explication détaillée",
  "modifications": ["type1", "type2"],
  "confidence_score": 0.8
}`;

          const analysisResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3 }
            }),
          });

          const analysisData = await analysisResponse.json();
          const analysisText = analysisData.candidates[0].content.parts[0].text;
          
          try {
            const analysisResult = JSON.parse(analysisText.match(/\{[\s\S]*\}/)[0]);
            
            if (analysisResult.needs_update) {
              // Enregistrer la suggestion de modification
              await supabase
                .from('ai_course_modifications')
                .insert({
                  course_id: course.id,
                  modification_type: 'content_update',
                  new_data: analysisResult,
                  reasoning: analysisResult.reasoning,
                  ai_confidence_score: analysisResult.confidence_score
                });
            }
          } catch (e) {
            console.error('Erreur analyse cours:', e);
          }
        }
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Analyse automatique des cours terminée'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'generate_adaptive_path') {
      // Générer un parcours adaptatif pour l'utilisateur
      const { data: userEnrollments } = await supabase
        .from('enrollments')
        .select('*, courses(*)')
        .eq('user_id', userId);

      const { data: quizResults } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId);

      const prompt = `Tu es LuvviX AI. Crée un parcours d'apprentissage personnalisé pour cet utilisateur.

Inscriptions actuelles: ${JSON.stringify(userEnrollments)}
Résultats quiz: ${JSON.stringify(quizResults)}

Génère un parcours adaptatif en JSON:
{
  "name": "Nom du parcours personnalisé",
  "description": "Description du parcours",
  "recommended_courses": ["course_id1", "course_id2"],
  "difficulty_progression": "beginner -> intermediate -> advanced",
  "estimated_duration_weeks": 12,
  "personalization_reasons": ["raison1", "raison2"]
}`;

      const pathResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      const pathData = await pathResponse.json();
      const pathText = pathData.candidates[0].content.parts[0].text;
      const pathResult = JSON.parse(pathText.match(/\{[\s\S]*\}/)[0]);

      // Sauvegarder le parcours
      const { data: learningPath } = await supabase
        .from('learning_paths')
        .insert({
          user_id: userId,
          name: pathResult.name,
          description: pathResult.description,
          course_sequence: pathResult.recommended_courses,
          ai_personalization: pathResult
        })
        .select()
        .single();

      return new Response(JSON.stringify({ 
        success: true, 
        learning_path: learningPath
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Action non reconnue');

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
