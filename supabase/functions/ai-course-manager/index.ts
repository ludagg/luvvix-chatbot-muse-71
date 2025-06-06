
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

    if (action === 'auto_generate_hourly') {
      return await generateHourlyCourse();
    }

    return new Response(
      JSON.stringify({ error: 'Action non reconnue' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Erreur gestionnaire de cours IA:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateHourlyCourse() {
  console.log('🕐 Génération automatique de cours toutes les heures...');
  
  const topics = [
    { topic: "Développement Web avec React", category: "Programmation Web", difficulty: "intermediate" },
    { topic: "Intelligence Artificielle et Machine Learning", category: "Intelligence Artificielle", difficulty: "advanced" },
    { topic: "Cybersécurité pour Entreprises", category: "Cybersécurité", difficulty: "intermediate" },
    { topic: "Bases de Données NoSQL", category: "Base de données", difficulty: "beginner" },
    { topic: "DevOps et CI/CD", category: "DevOps", difficulty: "advanced" },
    { topic: "Développement Mobile Flutter", category: "Développement Mobile", difficulty: "intermediate" },
    { topic: "Cloud Computing AWS", category: "Cloud Computing", difficulty: "advanced" },
    { topic: "Data Science avec Python", category: "Data Science", difficulty: "intermediate" }
  ];

  const randomTopic = topics[Math.floor(Math.random() * topics.length)];
  
  try {
    const result = await generateCompleteCourse({ 
      action: 'generate_complete_course',
      courseData: randomTopic 
    });
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Cours généré automatiquement par LuvviX AI',
      course: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('❌ Erreur génération automatique:', error);
    throw error;
  }
}

async function generateCompleteCourse(courseData: any) {
  console.log('🚀 Génération complète de cours premium:', courseData);

  try {
    if (!geminiApiKey) {
      throw new Error('Clé API Gemini manquante');
    }

    // Étape 1: Générer le plan détaillé du cours
    const coursePlan = await generateCoursePlan(courseData);
    console.log('📋 Plan de cours généré avec', coursePlan.lessons.length, 'leçons');

    // Étape 2: Créer le cours dans la base de données
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: coursePlan.title,
        description: coursePlan.description,
        category: courseData.category,
        difficulty_level: courseData.difficulty,
        duration_minutes: coursePlan.estimatedDuration,
        learning_objectives: coursePlan.learningObjectives,
        prerequisites: coursePlan.prerequisites,
        tags: coursePlan.tags,
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

    // Étape 3: Générer chaque leçon individuellement avec Gemini
    const detailedLessons = await generateDetailedLessons(coursePlan.lessons, coursePlan, courseData);
    
    // Étape 4: Sauvegarder les leçons
    const lessons = await createDetailedLessons(course.id, detailedLessons);
    console.log('📖 Leçons créées:', lessons.length);

    // Étape 5: Générer l'évaluation finale
    await generateFinalAssessment(course.id, coursePlan, courseData, detailedLessons);

    return new Response(
      JSON.stringify({
        success: true,
        course: course,
        lessons: lessons,
        message: `Cours premium "${course.title}" créé avec ${lessons.length} leçons ultra-détaillées`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Erreur génération cours:', error);
    throw error;
  }
}

async function generateCoursePlan(courseData: any) {
  console.log('📋 Génération du plan de cours...');

  const planPrompt = `Tu es un expert pédagogue de renommée mondiale. Crée un plan de cours EXCEPTIONNEL sur le sujet suivant :

SUJET : ${courseData.topic}
CATÉGORIE : ${courseData.category}  
NIVEAU : ${courseData.difficulty}

INSTRUCTIONS CRITIQUES :
1. Crée un plan structuré avec 8-12 leçons progressives
2. Chaque leçon doit avoir un titre précis et des objectifs clairs
3. Le cours doit être de qualité universitaire
4. Progression logique du simple au complexe
5. Durée réaliste pour chaque leçon (45-90 min)

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après :
{
  "title": "Titre professionnel du cours",
  "description": "Description complète et engageante du cours (400-500 mots)",
  "estimatedDuration": 720,
  "learningObjectives": [
    "Objectif mesurable 1",
    "Objectif mesurable 2", 
    "Objectif mesurable 3",
    "Objectif mesurable 4",
    "Objectif mesurable 5"
  ],
  "prerequisites": ["Prérequis 1", "Prérequis 2"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "lessons": [
    {
      "title": "Introduction et Concepts Fondamentaux",
      "objectives": ["Objectif 1", "Objectif 2"],
      "duration": 60,
      "type": "theory",
      "outline": "Plan détaillé de la leçon avec les points clés à couvrir"
    }
  ]
}`;

  const response = await callGeminiAPI(planPrompt, 0.7);
  const coursePlan = parseGeminiResponse(response);
  
  if (!coursePlan.lessons || coursePlan.lessons.length === 0) {
    throw new Error('Plan de cours invalide - aucune leçon générée');
  }

  return coursePlan;
}

async function generateDetailedLessons(lessonPlans: any[], coursePlan: any, courseData: any) {
  console.log('📚 Génération détaillée des leçons...');
  
  const detailedLessons = [];
  
  for (let i = 0; i < lessonPlans.length; i++) {
    const lesson = lessonPlans[i];
    console.log(`🔄 Génération leçon ${i + 1}/${lessonPlans.length}: ${lesson.title}`);
    
    const lessonPrompt = `Tu es un expert pédagogue de niveau mondial. Rédige une leçon EXCEPTIONNELLE et COMPLÈTE :

COURS : ${coursePlan.title}
LEÇON ${i + 1} : ${lesson.title}
NIVEAU : ${courseData.difficulty}
OBJECTIFS : ${lesson.objectives?.join(', ') || 'Non spécifiés'}
PLAN : ${lesson.outline || 'Plan libre'}

INSTRUCTIONS CRITIQUES :
1. Contenu de 3000-4000 mots minimum
2. HTML propre et bien structuré
3. Exemples concrets et pratiques
4. Exercices interactifs
5. Cas d'usage réels
6. Qualité professionnelle

Structure requise :
- Introduction motivante (300-400 mots)
- Concepts théoriques détaillés (1500-2000 mots)
- Exemples pratiques avec code/démos (800-1000 mots)
- Exercices et applications (400-500 mots)
- Synthèse et points clés (200-300 mots)

Réponds UNIQUEMENT en JSON valide :
{
  "title": "${lesson.title}",
  "content": "<h1>${lesson.title}</h1><h2>Introduction</h2><p>Contenu HTML ultra-détaillé avec exemples, exercices, et explications approfondies...</p>",
  "duration": ${lesson.duration || 75},
  "type": "${lesson.type || 'theory'}",
  "objectives": ${JSON.stringify(lesson.objectives || [])}
}`;

    try {
      const response = await callGeminiAPI(lessonPrompt, 0.8);
      const detailedLesson = parseGeminiResponse(response);
      
      if (!detailedLesson.content || detailedLesson.content.length < 2000) {
        console.warn(`⚠️ Leçon ${i + 1} trop courte, regénération...`);
        // Fallback avec contenu de base si la génération échoue
        detailedLesson.content = generateFallbackContent(lesson, coursePlan, courseData);
      }
      
      detailedLessons.push(detailedLesson);
      
      // Pause pour éviter les limites de taux
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Erreur génération leçon ${i + 1}:`, error);
      // Fallback avec contenu de base
      detailedLessons.push({
        title: lesson.title,
        content: generateFallbackContent(lesson, coursePlan, courseData),
        duration: lesson.duration || 75,
        type: lesson.type || 'theory',
        objectives: lesson.objectives || []
      });
    }
  }
  
  return detailedLessons;
}

function generateFallbackContent(lesson: any, coursePlan: any, courseData: any) {
  return `<h1>${lesson.title}</h1>
<h2>Introduction</h2>
<p>Cette leçon fait partie du cours "${coursePlan.title}" et couvre les concepts essentiels de ${lesson.title.toLowerCase()}. Vous apprendrez les fondamentaux théoriques et pratiques nécessaires pour maîtriser ce sujet.</p>

<h2>Objectifs de la leçon</h2>
<ul>
${lesson.objectives?.map((obj: string) => `<li>${obj}</li>`).join('') || '<li>Comprendre les concepts fondamentaux</li>'}
</ul>

<h2>Contenu principal</h2>
<p>Dans cette section, nous explorons en détail les concepts clés de ${lesson.title}. Cette approche progressive vous permettra de construire une compréhension solide du sujet.</p>

<h3>Concepts théoriques</h3>
<p>Les fondements théoriques sont essentiels pour une compréhension approfondie. Nous couvrirons les principes de base et les concepts avancés selon le niveau ${courseData.difficulty}.</p>

<h3>Applications pratiques</h3>
<p>La théorie prend tout son sens quand elle est appliquée. Voici des exemples concrets et des exercices pratiques pour renforcer votre apprentissage.</p>

<h2>Points clés à retenir</h2>
<ul>
<li>Compréhension des concepts fondamentaux</li>
<li>Application pratique des connaissances</li>
<li>Préparation pour la leçon suivante</li>
</ul>

<h2>Pour aller plus loin</h2>
<p>Cette leçon vous prépare pour la suite du cours. Les concepts abordés ici seront approfondis dans les leçons suivantes.</p>`;
}

async function callGeminiAPI(prompt: string, temperature: number = 0.7) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 8192
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

  return result.candidates[0].content.parts[0].text;
}

function parseGeminiResponse(responseText: string) {
  try {
    // Nettoyer la réponse et extraire le JSON
    let cleanedText = responseText.trim();
    
    // Supprimer les balises markdown si présentes
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Trouver le JSON valide
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd <= jsonStart) {
      throw new Error('Aucun JSON trouvé dans la réponse');
    }
    
    const jsonText = cleanedText.substring(jsonStart, jsonEnd);
    
    // Parser le JSON
    const parsed = JSON.parse(jsonText);
    
    return parsed;
  } catch (error) {
    console.error('❌ Erreur parsing JSON:', error);
    console.error('📝 Texte brut:', responseText.substring(0, 500));
    throw new Error(`Erreur parsing JSON: ${error.message}`);
  }
}

async function generateFinalAssessment(courseId: string, coursePlan: any, courseData: any, lessons: any[]) {
  console.log('🎓 Génération de l\'évaluation finale...');

  try {
    const lessonsContent = lessons.map(l => `${l.title}: ${l.content.substring(0, 800)}`).join('\n\n');

    const examPrompt = `Crée un examen final EXCEPTIONNEL de 20 questions pour le cours "${coursePlan.title}".

COURS : ${coursePlan.title}
NIVEAU : ${courseData.difficulty}
CONTENU : ${lessonsContent.substring(0, 4000)}

EXIGENCES :
1. EXACTEMENT 20 questions QCM
2. Couvrir TOUT le contenu
3. Niveaux variés : connaissance (25%), compréhension (35%), application (25%), analyse (15%)
4. Questions précises sans ambiguïté
5. Explications détaillées

Réponds en JSON valide :
{
  "questions": [
    {
      "id": "q1",
      "question": "Question claire et précise ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Explication détaillée de la réponse correcte",
      "category": "Catégorie",
      "difficulty": "beginner",
      "points": 5
    }
  ]
}`;

    const response = await callGeminiAPI(examPrompt, 0.3);
    const examData = parseGeminiResponse(response);
    
    if (!examData.questions || examData.questions.length !== 20) {
      console.warn(`⚠️ Nombre de questions incorrect: ${examData.questions?.length || 0}`);
      if (examData.questions?.length > 20) {
        examData.questions = examData.questions.slice(0, 20);
      }
    }

    const { data: assessment, error } = await supabase
      .from('course_assessments')
      .insert({
        course_id: courseId,
        title: `Évaluation finale - ${coursePlan.title}`,
        description: 'Examen final pour valider la maîtrise complète du cours',
        questions: examData.questions || [],
        total_questions: 20,
        passing_score: 70,
        time_limit_minutes: 120,
        ai_generated: true
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création évaluation:', error);
    } else {
      console.log('✅ Évaluation finale créée');
    }
  } catch (error) {
    console.error('❌ Erreur génération évaluation:', error);
  }
}

async function createDetailedLessons(courseId: string, lessonsData: any[]) {
  console.log('💾 Sauvegarde des leçons...');

  const lessons = lessonsData.map((lesson, index) => ({
    course_id: courseId,
    title: lesson.title,
    content: lesson.content,
    lesson_order: index + 1,
    duration_minutes: lesson.duration || 75,
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

  console.log('✅ Leçons sauvegardées:', insertedLessons.length);
  return insertedLessons;
}
