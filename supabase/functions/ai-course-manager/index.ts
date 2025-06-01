
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
    const { action, courseData, category, difficulty } = await req.json();

    if (action === 'generate_course') {
      // Générer un cours complet avec l'IA
      const prompt = `Tu es LuvviX AI, une IA pédagogique experte. Génère un cours complet sur "${courseData.topic}" dans la catégorie "${category}" niveau "${difficulty}".

Retourne un JSON structuré avec :
{
  "title": "Titre du cours",
  "description": "Description engageante",
  "duration_minutes": nombre_minutes,
  "learning_objectives": ["objectif1", "objectif2", "objectif3"],
  "prerequisites": ["prérequis1", "prérequis2"],
  "tags": ["tag1", "tag2", "tag3"],
  "lessons": [
    {
      "title": "Titre leçon 1",
      "content": "Contenu détaillé en markdown avec exemples",
      "lesson_order": 1,
      "duration_minutes": 15,
      "lesson_type": "theory"
    },
    {
      "title": "Quiz - Leçon 1",
      "content": "Questions de validation",
      "lesson_order": 2,
      "duration_minutes": 10,
      "lesson_type": "quiz",
      "quiz": {
        "title": "Quiz validation",
        "questions": [
          {
            "question": "Question 1?",
            "type": "multiple_choice",
            "options": ["A", "B", "C", "D"],
            "correct_answer": 0,
            "explanation": "Explication"
          }
        ]
      }
    }
  ]
}

Crée un cours de qualité avec au moins 5 leçons + quiz alternés. Niveau ${difficulty}.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.7,
            maxOutputTokens: 8000
          }
        }),
      });

      const geminiData = await response.json();
      const courseContent = JSON.parse(geminiData.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/)[0]);

      // Insérer le cours dans la base de données
      const { data: course } = await supabase
        .from('courses')
        .insert({
          title: courseContent.title,
          description: courseContent.description,
          category: category,
          difficulty_level: difficulty,
          duration_minutes: courseContent.duration_minutes,
          learning_objectives: courseContent.learning_objectives,
          prerequisites: courseContent.prerequisites,
          tags: courseContent.tags,
          ai_generated: true
        })
        .select()
        .single();

      // Insérer les leçons
      for (const lesson of courseContent.lessons) {
        const { data: lessonData } = await supabase
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

        // Si c'est un quiz, créer le quiz
        if (lesson.lesson_type === 'quiz' && lesson.quiz) {
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

    } else if (action === 'auto_update_courses') {
      // Auto-amélioration des cours existants
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('ai_generated', true)
        .order('ai_last_update', { ascending: true })
        .limit(5);

      for (const course of courses || []) {
        // Analyser les données d'engagement
        const { data: analytics } = await supabase
          .from('learning_analytics')
          .select('*')
          .eq('course_id', course.id)
          .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (analytics && analytics.length > 10) {
          const analysisPrompt = `Analyse ces données d'apprentissage pour le cours "${course.title}":
          ${JSON.stringify(analytics.slice(0, 20))}
          
          Suggère des améliorations pour optimiser l'engagement et la réussite.`;

          const analysisResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: analysisPrompt }] }],
              generationConfig: { temperature: 0.3 }
            }),
          });

          const analysisData = await analysisResponse.json();
          const suggestions = analysisData.candidates[0].content.parts[0].text;

          // Enregistrer les suggestions
          await supabase
            .from('ai_course_modifications')
            .insert({
              course_id: course.id,
              modification_type: 'content_update',
              new_data: { suggestions },
              reasoning: 'Analyse automatique des données d\'engagement'
            });

          // Marquer le cours comme analysé
          await supabase
            .from('courses')
            .update({ ai_last_update: new Date().toISOString() })
            .eq('id', course.id);
        }
      }

      return new Response(JSON.stringify({ 
        success: true,
        analyzed_courses: courses?.length || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'generate_adaptive_path') {
      const { userId } = await req.json();

      // Analyser le profil de l'utilisateur
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*, courses(*)')
        .eq('user_id', userId);

      const { data: analytics } = await supabase
        .from('learning_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(50);

      const pathPrompt = `Crée un parcours d'apprentissage personnalisé pour cet utilisateur:

Cours terminés: ${JSON.stringify(enrollments?.filter(e => e.completed_at))}
Activité récente: ${JSON.stringify(analytics?.slice(0, 10))}

Recommande 3-5 cours dans l'ordre optimal pour progresser. Retourne un JSON:
{
  "name": "Nom du parcours",
  "description": "Description personnalisée",
  "course_sequence": ["course_id1", "course_id2"],
  "reasoning": "Pourquoi ce parcours"
}`;

      const pathResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: pathPrompt }] }],
          generationConfig: { temperature: 0.6 }
        }),
      });

      const pathData = await pathResponse.json();
      const pathContent = JSON.parse(pathData.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/)[0]);

      // Sauvegarder le parcours
      const { data: learningPath } = await supabase
        .from('learning_paths')
        .insert({
          user_id: userId,
          name: pathContent.name,
          description: pathContent.description,
          course_sequence: pathContent.course_sequence,
          ai_personalization: { reasoning: pathContent.reasoning }
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

    return new Response(JSON.stringify({ error: 'Action non reconnue' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur gestionnaire de cours IA:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
