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

// Fonction pour extraire le JSON de la réponse Gemini
function extractJSON(text: string): any {
  console.log('🔍 Texte brut reçu:', text.substring(0, 200) + '...');
  
  // Nettoyer le texte
  const cleanText = text.trim();
  
  // Chercher les accolades ouvrantes et fermantes
  const firstBrace = cleanText.indexOf('{');
  const lastBrace = cleanText.lastIndexOf('}');
  
  if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
    throw new Error('Aucun JSON valide trouvé dans la réponse');
  }
  
  const jsonString = cleanText.substring(firstBrace, lastBrace + 1);
  console.log('📋 JSON extrait:', jsonString.substring(0, 200) + '...');
  
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('❌ Erreur parsing JSON:', error);
    console.error('📄 Contenu problématique:', jsonString.substring(0, 500));
    throw new Error('Format JSON invalide: ' + error.message);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, courseData, category, difficulty, userId } = await req.json();

    if (action === 'generate_course') {
      console.log('🎯 Génération d\'un nouveau cours:', courseData.topic);
      
      // Étape 1: Générer le plan du cours avec un prompt plus strict
      const planPrompt = `Tu es LuvviX AI, expert pédagogique. Crée un PLAN DÉTAILLÉ pour un cours sur "${courseData.topic}" (${category}, niveau ${difficulty}).

IMPORTANT: Réponds UNIQUEMENT avec un JSON valide, rien d'autre. Pas de texte avant ou après le JSON.

Format JSON requis:
{
  "title": "Titre du cours",
  "description": "Description en 2-3 phrases",
  "duration_minutes": 240,
  "learning_objectives": ["objectif 1", "objectif 2", "objectif 3"],
  "prerequisites": ["prérequis 1", "prérequis 2"],
  "tags": ["tag1", "tag2", "tag3"],
  "lessons_plan": [
    {
      "title": "Introduction aux concepts",
      "lesson_order": 1,
      "duration_minutes": 30,
      "lesson_type": "theory",
      "key_points": ["point 1", "point 2", "point 3"]
    },
    {
      "title": "Quiz - Validation des concepts",
      "lesson_order": 2,
      "duration_minutes": 15,
      "lesson_type": "quiz",
      "quiz_topics": ["sujet 1", "sujet 2"]
    }
  ]
}

Minimum 6 leçons alternant théorie/quiz. JSON uniquement !`;

      const planResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: planPrompt }] }],
          generationConfig: { 
            temperature: 0.7,
            maxOutputTokens: 2000
          }
        }),
      });

      if (!planResponse.ok) {
        throw new Error(`Erreur Gemini plan: ${planResponse.status}`);
      }

      const planData = await planResponse.json();
      console.log('📋 Plan généré par Gemini');
      
      let coursePlan;
      try {
        const rawText = planData.candidates[0].content.parts[0].text;
        coursePlan = extractJSON(rawText);
        
        // Validation de la structure
        if (!coursePlan.title || !coursePlan.lessons_plan || !Array.isArray(coursePlan.lessons_plan)) {
          throw new Error('Structure du plan invalide');
        }
        
        console.log('✅ Plan validé:', coursePlan.title);
      } catch (parseError) {
        console.error('❌ Erreur parsing plan:', parseError);
        throw new Error('Format de réponse invalide de Gemini: ' + parseError.message);
      }

      // Insérer le cours d'abord
      console.log('💾 Insertion du cours en base...');
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: coursePlan.title,
          description: coursePlan.description,
          category: category,
          difficulty_level: difficulty,
          duration_minutes: coursePlan.duration_minutes,
          learning_objectives: coursePlan.learning_objectives || [],
          prerequisites: coursePlan.prerequisites || [],
          tags: coursePlan.tags || [],
          ai_generated: true,
          status: 'active'
        })
        .select()
        .single();

      if (courseError) {
        console.error('❌ Erreur insertion cours:', courseError);
        throw courseError;
      }

      console.log('✅ Cours créé:', course.title);

      // Étape 2: Générer chaque leçon individuellement
      for (const lessonPlan of coursePlan.lessons_plan) {
        console.log(`📝 Génération leçon: ${lessonPlan.title}`);
        
        if (lessonPlan.lesson_type === 'theory') {
          // Générer le contenu théorique détaillé
          const contentPrompt = `Tu es LuvviX AI. Génère le CONTENU COMPLET pour la leçon "${lessonPlan.title}" du cours "${coursePlan.title}".

Points clés à couvrir: ${lessonPlan.key_points?.join(', ') || 'Contenu général'}

Crée un contenu de 1000+ mots en Markdown avec:
- Introduction engageante
- Explications détaillées avec exemples
- Analogies et cas pratiques
- Mise en forme markdown (titres, listes, code si pertinent)
- Résumé des points clés

Niveau: ${difficulty}. Sois pédagogique et précis. Réponds directement avec le contenu Markdown, sans introduction.`;

          try {
            const contentResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: contentPrompt }] }],
                generationConfig: { 
                  temperature: 0.8,
                  maxOutputTokens: 4000
                }
              }),
            });

            if (!contentResponse.ok) {
              console.error(`❌ Erreur génération contenu leçon ${lessonPlan.title}`);
              continue;
            }

            const contentData = await contentResponse.json();
            const lessonContent = contentData.candidates[0].content.parts[0].text;

            // Insérer la leçon
            const { data: lesson, error: lessonError } = await supabase
              .from('lessons')
              .insert({
                course_id: course.id,
                title: lessonPlan.title,
                content: lessonContent,
                lesson_order: lessonPlan.lesson_order,
                duration_minutes: lessonPlan.duration_minutes || 30,
                lesson_type: lessonPlan.lesson_type
              })
              .select()
              .single();

            if (lessonError) {
              console.error('❌ Erreur insertion leçon:', lessonError);
              continue;
            }

            console.log(`✅ Leçon créée: ${lesson.title}`);

          } catch (error) {
            console.error(`❌ Erreur génération leçon ${lessonPlan.title}:`, error);
            continue;
          }

        } else if (lessonPlan.lesson_type === 'quiz') {
          // Générer le quiz avec un prompt plus strict
          const quizPrompt = `Génère un quiz pour "${lessonPlan.title}" sur les sujets: ${lessonPlan.quiz_topics?.join(', ') || 'Validation des connaissances'}.

IMPORTANT: Réponds UNIQUEMENT avec un JSON valide, rien d'autre.

Format JSON requis:
{
  "questions": [
    {
      "question": "Question claire et précise?",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Explication pourquoi cette réponse est correcte"
    }
  ]
}

Génère exactement 5 questions de difficulté ${difficulty}. JSON uniquement !`;

          try {
            const quizResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: quizPrompt }] }],
                generationConfig: { 
                  temperature: 0.6,
                  maxOutputTokens: 2000
                }
              }),
            });

            if (!quizResponse.ok) {
              console.error(`❌ Erreur génération quiz ${lessonPlan.title}`);
              continue;
            }

            const quizData = await quizResponse.json();
            
            let quizContent;
            try {
              const rawQuizText = quizData.candidates[0].content.parts[0].text;
              quizContent = extractJSON(rawQuizText);
              
              // Validation
              if (!quizContent.questions || !Array.isArray(quizContent.questions) || quizContent.questions.length === 0) {
                throw new Error('Structure de quiz invalide');
              }
              
              console.log(`✅ Quiz validé: ${quizContent.questions.length} questions`);
            } catch (quizParseError) {
              console.error(`❌ Erreur parsing quiz ${lessonPlan.title}:`, quizParseError);
              continue;
            }

            // Insérer la leçon quiz
            const { data: lesson, error: lessonError } = await supabase
              .from('lessons')
              .insert({
                course_id: course.id,
                title: lessonPlan.title,
                content: 'Quiz de validation des connaissances',
                lesson_order: lessonPlan.lesson_order,
                duration_minutes: lessonPlan.duration_minutes || 15,
                lesson_type: lessonPlan.lesson_type
              })
              .select()
              .single();

            if (lessonError) {
              console.error('❌ Erreur insertion leçon quiz:', lessonError);
              continue;
            }

            // Insérer le quiz
            const { error: quizError } = await supabase
              .from('quizzes')
              .insert({
                lesson_id: lesson.id,
                title: lessonPlan.title,
                questions: quizContent.questions,
                passing_score: 70,
                max_attempts: 3
              });

            if (quizError) {
              console.error('❌ Erreur insertion quiz:', quizError);
            } else {
              console.log(`✅ Quiz créé: ${lesson.title}`);
            }

          } catch (error) {
            console.error(`❌ Erreur génération quiz ${lessonPlan.title}:`, error);
            continue;
          }
        }
      }

      console.log('🎉 Cours généré avec succès:', course.title);

      return new Response(JSON.stringify({ 
        success: true, 
        course: course,
        message: `Cours "${course.title}" généré avec succès par LuvviX AI`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'auto_generate_hourly') {
      // Génération automatique horaire
      const topics = [
        'Les bases de Python pour débutants',
        'Introduction aux réseaux informatiques',
        'Bases de données relationnelles avec SQL',
        'Intelligence Artificielle et Machine Learning',
        'Développement web avec React',
        'Cybersécurité fondamentale',
        'Programmation orientée objet',
        'Introduction au Cloud Computing',
        'Git et contrôle de version',
        'Algorithmes et structures de données',
        'JavaScript ES6+ et fonctionnalités modernes',
        'Design UX/UI pour développeurs',
        'Docker et conteneurisation',
        'APIs REST et GraphQL',
        'Testing et qualité logicielle'
      ];

      const categories = [
        'Informatique fondamentale',
        'Programmation Web',
        'Intelligence Artificielle',
        'Base de données',
        'Cybersécurité'
      ];

      const difficulties = ['beginner', 'intermediate', 'advanced'];

      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

      console.log('🤖 Génération automatique:', randomTopic);

      // Appel récursif pour générer le cours
      const autoGenRequest = new Request(req.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_course',
          courseData: { topic: randomTopic },
          category: randomCategory,
          difficulty: randomDifficulty
        })
      });

      return await serve(autoGenRequest);

    } else if (action === 'generate_adaptive_path') {
      const { userId } = await req.json();

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

IMPORTANT: Réponds UNIQUEMENT avec un JSON valide.

Format JSON requis:
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
      let pathContent;
      try {
        const rawPathText = pathData.candidates[0].content.parts[0].text;
        pathContent = extractJSON(rawPathText);
      } catch (error) {
        throw new Error('Erreur génération parcours adaptatif: ' + error.message);
      }

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
    console.error('❌ Erreur gestionnaire de cours IA:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erreur interne du serveur'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
