
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, courseData } = await req.json();
    console.log('🎯 Action demandée:', action);

    if (action === 'generate_complete_course') {
      return await generateCompleteCourse(courseData);
    }

    return new Response(
      JSON.stringify({ error: 'Action non reconnue' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateCompleteCourse(courseData: any) {
  console.log('🚀 Génération d\'un cours complet:', courseData);

  try {
    let courseStructure;
    
    // Vérifier que Gemini est disponible
    if (!geminiApiKey) {
      throw new Error('Clé API Gemini manquante - impossible de générer des leçons de qualité');
    }

    // Générer TOUJOURS avec Gemini (pas de fallback)
    try {
      courseStructure = await generateCourseWithGemini(courseData);
      console.log('📚 Structure du cours générée avec Gemini:', courseStructure.title);
    } catch (geminiError) {
      console.error('❌ Erreur Gemini critique:', geminiError.message);
      throw new Error(`Impossible de générer le cours avec Gemini: ${geminiError.message}`);
    }

    // Créer le cours dans la base de données
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: courseStructure.title,
        description: courseStructure.description,
        category: courseData.category,
        difficulty_level: courseData.difficulty,
        duration_minutes: courseStructure.estimatedDuration,
        learning_objectives: courseStructure.learningObjectives,
        prerequisites: courseStructure.prerequisites,
        tags: courseStructure.tags,
        ai_generated: true,
        status: 'active'
      })
      .select()
      .single();

    if (courseError) {
      console.error('❌ Erreur création cours:', courseError);
      throw courseError;
    }

    console.log('✅ Cours créé:', course.title);

    // Créer les leçons détaillées
    const lessons = await createDetailedLessons(course.id, courseStructure.lessons);
    console.log('📖 Leçons créées:', lessons.length);

    // Générer l'examen final avec 20 questions maximum
    await generateFinalAssessment(course.id, courseStructure, courseData);

    return new Response(
      JSON.stringify({
        success: true,
        course: course,
        lessons: lessons,
        message: `Cours "${course.title}" créé avec ${lessons.length} leçons complètes et un examen final de 20 questions`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Erreur génération cours:', error);
    throw error;
  }
}

async function generateCourseWithGemini(courseData: any) {
  console.log('🧠 Génération avec Gemini...');

  const prompt = `Tu es un expert pédagogue et créateur de contenu éducatif professionnel. Crée un cours EXCEPTIONNEL et COMPLET sur le sujet suivant :

SUJET : ${courseData.topic}
CATÉGORIE : ${courseData.category}
NIVEAU : ${courseData.difficulty}

INSTRUCTIONS CRITIQUES :
1. Crée un cours de TRÈS HAUTE QUALITÉ avec 8-12 leçons substantielles
2. Chaque leçon doit contenir 2000-3000 mots de contenu riche et informatif
3. Utilise un HTML propre et bien formaté avec : <h1>, <h2>, <h3>, <p>, <strong>, <em>, <ul>, <li>, <code>, <pre>, <blockquote>
4. Inclus des exemples CONCRETS, des cas pratiques et des exercices
5. Structure le contenu de manière progressive et logique
6. Crée du contenu ORIGINAL et ENGAGEANT, pas du texte générique
7. Adapte le niveau de complexité au niveau spécifié : ${courseData.difficulty}
8. Pour les sujets techniques, inclus du code et des exemples pratiques
9. Pour les sujets théoriques, utilise des études de cas et des applications réelles
10. Chaque leçon doit être complète et autonome

STRUCTURE ATTENDUE pour chaque leçon :
- Introduction claire et motivante du sujet (200-300 mots)
- Concepts fondamentaux expliqués en détail (800-1000 mots)
- Exemples pratiques détaillés avec explications (500-700 mots)
- Exercices ou applications concrètes (300-400 mots)
- Résumé des points clés et révision (200-300 mots)
- Transition vers la leçon suivante (100 mots)

QUALITÉ REQUISE :
- Contenu professionnel et expert
- Explications claires et progressives
- Exemples réels et pertinents
- Exercices pratiques stimulants
- Structure logique et cohérente

Réponds UNIQUEMENT avec ce JSON (sans texte avant ou après) :
{
  "title": "Titre accrocheur et professionnel du cours",
  "description": "Description détaillée et motivante (400-500 mots)",
  "estimatedDuration": 720,
  "learningObjectives": [
    "Objectif précis et mesurable 1",
    "Objectif précis et mesurable 2",
    "Objectif précis et mesurable 3",
    "Objectif précis et mesurable 4",
    "Objectif précis et mesurable 5"
  ],
  "prerequisites": ["Prérequis 1", "Prérequis 2"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "lessons": [
    {
      "title": "Titre engageant de la leçon",
      "content": "<h1>Titre de la leçon</h1><h2>Introduction</h2><p>Contenu riche et détaillé d'au moins 2000 mots avec exemples concrets, cas pratiques, exercices et explications approfondies...</p><h2>Concepts fondamentaux</h2><p>Explication très détaillée...</p><h3>Exemple pratique détaillé</h3><pre><code>Code ou exemple concret avec explications</code></pre><h2>Application pratique</h2><p>Exercices détaillés et cas d'usage...</p><h2>Points clés à retenir</h2><ul><li>Point important 1</li><li>Point important 2</li></ul><h2>Pour aller plus loin</h2><p>Ressources et approfondissements...</p>",
      "duration": 90,
      "type": "theory",
      "objectives": ["Objectif spécifique 1", "Objectif spécifique 2"]
    }
  ]
}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 8192
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur API Gemini: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  console.log('📝 Réponse de Gemini reçue');
  
  if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error('Réponse invalide de Gemini - pas de contenu généré');
  }

  const generatedText = result.candidates[0].content.parts[0].text;
  
  // Extraire le JSON de la réponse
  const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const courseStructure = JSON.parse(jsonMatch[0]);
      
      // Vérifier que les leçons ont du contenu substantiel
      if (!courseStructure.lessons || courseStructure.lessons.length === 0) {
        throw new Error('Aucune leçon générée par Gemini');
      }
      
      for (const lesson of courseStructure.lessons) {
        if (!lesson.content || lesson.content.length < 1000) {
          throw new Error(`Leçon "${lesson.title}" trop courte - contenu insuffisant`);
        }
      }
      
      console.log('✅ Structure parsée avec succès:', courseStructure.title);
      console.log('📊 Nombre de leçons:', courseStructure.lessons.length);
      console.log('📏 Longueur moyenne des leçons:', Math.round(courseStructure.lessons.reduce((sum, l) => sum + l.content.length, 0) / courseStructure.lessons.length));
      
      return courseStructure;
    } catch (parseError) {
      console.error('⚠️ Erreur parsing JSON:', parseError.message);
      throw new Error('Impossible de parser la réponse JSON de Gemini');
    }
  }

  throw new Error('Aucun JSON valide trouvé dans la réponse Gemini');
}

async function generateFinalAssessment(courseId: string, courseStructure: any, courseData: any) {
  console.log('📝 Génération de l\'examen final...');

  if (!geminiApiKey) {
    console.warn('⚠️ Pas de clé Gemini pour l\'examen final');
    return;
  }

  try {
    const lessonsContent = courseStructure.lessons.map(l => `${l.title}: ${l.content.substring(0, 1000)}`).join('\n\n');

    const examPrompt = `Tu es un expert en évaluation pédagogique. Crée un examen final de EXACTEMENT 20 questions à choix multiples pour évaluer la maîtrise de ce cours :

COURS : ${courseStructure.title}
DESCRIPTION : ${courseStructure.description}
CATÉGORIE : ${courseData.category}
NIVEAU : ${courseData.difficulty}

CONTENU DES LEÇONS (extraits) :
${lessonsContent.substring(0, 4000)}

INSTRUCTIONS IMPORTANTES :
1. Crée EXACTEMENT 20 questions QCM de haute qualité
2. Couvre TOUT le contenu du cours de manière équilibrée
3. Varie les niveaux : connaissance (25%), compréhension (35%), application (25%), analyse (15%)
4. 4 choix de réponse par question, avec UNE seule bonne réponse
5. Inclus des explications détaillées pour chaque réponse
6. Questions précises et sans ambiguïté
7. Répartition équitable sur toutes les leçons

Réponds au format JSON suivant :
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
      "points": 5
    }
  ]
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: examPrompt }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 8192
        }
      })
    });

    if (!response.ok) {
      console.warn('⚠️ Erreur génération examen:', response.status);
      return;
    }

    const result = await response.json();
    
    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.warn('⚠️ Pas de contenu pour l\'examen');
      return;
    }

    const examText = result.candidates[0].content.parts[0].text;
    const examMatch = examText.match(/\{[\s\S]*\}/);
    
    if (examMatch) {
      try {
        const examData = JSON.parse(examMatch[0]);
        
        // Vérifier qu'on a exactement 20 questions
        if (examData.questions && examData.questions.length !== 20) {
          console.warn(`⚠️ Nombre de questions incorrect: ${examData.questions.length}, attendu: 20`);
          // Tronquer ou compléter pour avoir exactement 20 questions
          if (examData.questions.length > 20) {
            examData.questions = examData.questions.slice(0, 20);
          }
        }

        // Créer l'évaluation dans la base de données
        const { data: assessment, error: assessmentError } = await supabase
          .from('course_assessments')
          .insert({
            course_id: courseId,
            title: `Examen final - ${courseStructure.title}`,
            description: 'Évaluation finale pour valider la maîtrise du cours',
            questions: examData.questions,
            total_questions: 20,
            passing_score: 70,
            time_limit_minutes: 90,
            ai_generated: true
          })
          .select()
          .single();

        if (assessmentError) {
          console.error('❌ Erreur création examen:', assessmentError);
        } else {
          console.log('✅ Examen final créé avec 20 questions');
        }
      } catch (parseError) {
        console.error('❌ Erreur parsing examen:', parseError.message);
      }
    }
  } catch (error) {
    console.error('❌ Erreur génération examen final:', error);
  }
}

async function createDetailedLessons(courseId: string, lessonsData: any[]) {
  console.log('📖 Création des leçons détaillées...');

  const lessons = lessonsData.map((lesson, index) => ({
    course_id: courseId,
    title: lesson.title,
    content: lesson.content,
    lesson_order: index + 1,
    duration_minutes: lesson.duration || 90,
    lesson_type: lesson.type || 'theory'
  }));

  const { data: insertedLessons, error } = await supabase
    .from('lessons')
    .insert(lessons)
    .select();

  if (error) {
    console.error('❌ Erreur insertion leçons:', error);
    throw error;
  }

  console.log('✅ Leçons insérées:', insertedLessons.length);
  return insertedLessons;
}
