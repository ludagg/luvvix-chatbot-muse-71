
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

    if (action === 'cleanup_invalid_courses') {
      return await cleanupInvalidCourses();
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

async function cleanupInvalidCourses() {
  console.log('🧹 Nettoyage des cours invalides...');
  
  try {
    // Supprimer les cours sans leçons valides
    const { data: coursesWithoutLessons } = await supabase
      .from('courses')
      .select(`
        id,
        title,
        lessons!inner(id)
      `)
      .having('count(lessons.id)', 'eq', 0);

    if (coursesWithoutLessons && coursesWithoutLessons.length > 0) {
      const courseIds = coursesWithoutLessons.map(c => c.id);
      
      await supabase
        .from('courses')
        .delete()
        .in('id', courseIds);
      
      console.log(`🗑️ Supprimé ${courseIds.length} cours sans leçons`);
    }

    // Créer un cours d'exemple complet
    const exampleCourse = await createExampleCourse();
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Nettoyage terminé et cours d\'exemple créé',
        exampleCourse
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
    throw error;
  }
}

async function createExampleCourse() {
  console.log('📚 Création du cours d\'exemple...');
  
  const courseData = {
    title: "JavaScript Moderne : ES6+ et Développement Web",
    description: "Maîtrisez JavaScript moderne avec ES6+, les fonctions asynchrones, et les meilleures pratiques du développement web. Ce cours complet vous guidera des concepts de base aux techniques avancées.",
    category: "Programmation Web",
    difficulty_level: "intermediate",
    duration_minutes: 600,
    learning_objectives: [
      "Maîtriser les nouvelles fonctionnalités ES6+",
      "Comprendre la programmation asynchrone",
      "Utiliser les modules JavaScript",
      "Optimiser les performances web",
      "Appliquer les meilleures pratiques"
    ],
    prerequisites: ["HTML", "CSS", "JavaScript de base"],
    tags: ["javascript", "es6", "web", "frontend", "programmation"],
    ai_generated: true,
    status: 'active'
  };

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .insert(courseData)
    .select()
    .single();

  if (courseError) {
    throw courseError;
  }

  // Créer les leçons
  const lessons = [
    {
      course_id: course.id,
      title: "Introduction à ES6+ et les nouvelles fonctionnalités",
      content: `<h1>Introduction à ES6+ et les nouvelles fonctionnalités</h1>
      
<h2>Qu'est-ce qu'ES6+ ?</h2>
<p>ECMAScript 6 (ES2015) et ses versions ultérieures ont révolutionné JavaScript. Ces nouvelles spécifications apportent une syntaxe moderne, plus claire et plus puissante.</p>

<h3>Les principales nouveautés ES6+</h3>
<ul>
  <li><strong>Let et Const</strong> : Nouvelles déclarations de variables</li>
  <li><strong>Arrow Functions</strong> : Syntaxe simplifiée des fonctions</li>
  <li><strong>Template Literals</strong> : Chaînes de caractères avancées</li>
  <li><strong>Destructuring</strong> : Extraction facilitée des données</li>
</ul>

<h3>Exemple pratique</h3>
<pre><code>
// ES5 (ancienne syntaxe)
var name = 'John';
var greeting = 'Hello ' + name + '!';

// ES6+ (nouvelle syntaxe)
const name = 'John';
const greeting = \`Hello \${name}!\`;
</code></pre>

<h2>Pourquoi adopter ES6+ ?</h2>
<p>Les avantages sont nombreux : code plus lisible, moins d'erreurs, meilleures performances, et compatibilité avec les frameworks modernes.</p>`,
      lesson_order: 1,
      duration_minutes: 60,
      lesson_type: 'theory'
    },
    {
      course_id: course.id,
      title: "Variables et Portée : Let, Const, et Var",
      content: `<h1>Variables et Portée : Let, Const, et Var</h1>

<h2>Les trois types de déclarations</h2>

<h3>Var - L'ancienne méthode</h3>
<pre><code>
var x = 1;
if (true) {
  var x = 2; // Même variable !
  console.log(x); // 2
}
console.log(x); // 2 - La variable a été modifiée
</code></pre>

<h3>Let - Portée de bloc</h3>
<pre><code>
let y = 1;
if (true) {
  let y = 2; // Variable différente dans ce bloc
  console.log(y); // 2
}
console.log(y); // 1 - Variable originale inchangée
</code></pre>

<h3>Const - Valeurs constantes</h3>
<pre><code>
const API_URL = 'https://api.example.com';
// API_URL = 'autre-url'; // Erreur !

const user = { name: 'John' };
user.name = 'Jane'; // OK - on modifie le contenu, pas la référence
</code></pre>

<h2>Bonnes pratiques</h2>
<ul>
  <li>Utilisez <code>const</code> par défaut</li>
  <li>Utilisez <code>let</code> quand vous devez réassigner</li>
  <li>Évitez <code>var</code> en ES6+</li>
</ul>`,
      lesson_order: 2,
      duration_minutes: 45,
      lesson_type: 'theory'
    },
    {
      course_id: course.id,
      title: "Fonctions Fléchées et Méthodes Avancées",
      content: `<h1>Fonctions Fléchées et Méthodes Avancées</h1>

<h2>Syntaxe des Arrow Functions</h2>

<h3>Transformation progressive</h3>
<pre><code>
// Fonction classique
function add(a, b) {
  return a + b;
}

// Arrow function longue
const add = (a, b) => {
  return a + b;
};

// Arrow function courte
const add = (a, b) => a + b;

// Un seul paramètre
const square = x => x * x;

// Aucun paramètre
const random = () => Math.random();
</code></pre>

<h2>Contexte 'this'</h2>
<p>Les arrow functions héritent du contexte 'this' de leur environnement :</p>

<pre><code>
class Timer {
  constructor() {
    this.seconds = 0;
  }
  
  start() {
    // Arrow function garde le 'this' de la classe
    setInterval(() => {
      this.seconds++;
      console.log(\`Secondes: \${this.seconds}\`);
    }, 1000);
  }
}
</code></pre>

<h2>Méthodes de tableau avancées</h2>
<pre><code>
const numbers = [1, 2, 3, 4, 5];

// Map - transformation
const doubled = numbers.map(n => n * 2);

// Filter - filtrage
const evens = numbers.filter(n => n % 2 === 0);

// Reduce - réduction
const sum = numbers.reduce((acc, n) => acc + n, 0);

// Chaînage des méthodes
const result = numbers
  .filter(n => n > 2)
  .map(n => n * 2)
  .reduce((acc, n) => acc + n, 0);
</code></pre>`,
      lesson_order: 3,
      duration_minutes: 75,
      lesson_type: 'theory'
    }
  ];

  const { data: insertedLessons, error: lessonsError } = await supabase
    .from('lessons')
    .insert(lessons)
    .select();

  if (lessonsError) {
    throw lessonsError;
  }

  console.log('✅ Cours d\'exemple créé avec succès');
  return { course, lessons: insertedLessons };
}

async function generateHourlyCourse() {
  console.log('🕐 Génération automatique de cours toutes les heures...');
  
  const topics = [
    { topic: "Python pour Data Science", category: "Data Science", difficulty: "intermediate" },
    { topic: "React.js Avancé", category: "Programmation Web", difficulty: "advanced" },
    { topic: "Cybersécurité Éthique", category: "Cybersécurité", difficulty: "intermediate" },
    { topic: "Intelligence Artificielle avec TensorFlow", category: "Intelligence Artificielle", difficulty: "advanced" },
    { topic: "Développement Mobile React Native", category: "Développement Mobile", difficulty: "intermediate" }
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

    const coursePlan = await generateCoursePlan(courseData);
    console.log('📋 Plan de cours généré avec', coursePlan.lessons.length, 'leçons');

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

    const detailedLessons = await generateDetailedLessons(coursePlan.lessons, coursePlan, courseData);
    const lessons = await createDetailedLessons(course.id, detailedLessons);
    console.log('📖 Leçons créées:', lessons.length);

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
        detailedLesson.content = generateFallbackContent(lesson, coursePlan, courseData);
      }
      
      detailedLessons.push(detailedLesson);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Erreur génération leçon ${i + 1}:`, error);
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
    let cleanedText = responseText.trim();
    
    // Supprimer les balises markdown
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Supprimer les commentaires JavaScript
    cleanedText = cleanedText.replace(/\/\/[^\n\r]*/g, '');
    cleanedText = cleanedText.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Nettoyer les caractères de contrôle problématiques
    cleanedText = cleanedText.replace(/[\x00-\x1F\x7F]/g, '');
    
    // Trouver le JSON valide
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd <= jsonStart) {
      throw new Error('Aucun JSON trouvé dans la réponse');
    }
    
    const jsonText = cleanedText.substring(jsonStart, jsonEnd);
    
    // Remplacer les échappements problématiques
    const sanitizedJson = jsonText
      .replace(/\\n/g, ' ')
      .replace(/\\t/g, ' ')
      .replace(/\\r/g, ' ')
      .replace(/\\\\/g, '\\')
      .replace(/\\"/g, '"');
    
    const parsed = JSON.parse(sanitizedJson);
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
    lesson_type: 'theory'
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
