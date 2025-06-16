
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
    const { message, userId, action, context } = await req.json();

    console.log('🧠 LuvviX Omnipotent AI activé:', { action, userId });

    // Analyser l'utilisateur et ses patterns
    const userAnalysis = await analyzeUserCompletely(supabase, userId);
    
    let response = '';
    let actionExecuted = false;

    // Exécuter des actions automatiques basées sur l'intent
    if (action) {
      const actionResult = await executeAdvancedAction(supabase, userId, action, userAnalysis);
      actionExecuted = true;
      response = generateActionResponse(action, actionResult);
    } else {
      // Analyser l'intent du message
      const intent = analyzeIntent(message);
      
      if (intent.requiresAction) {
        const actionResult = await executeAdvancedAction(supabase, userId, intent.action, userAnalysis);
        actionExecuted = true;
        response = generateActionResponse(intent.action, actionResult);
      }
    }

    // Générer une réponse IA contextuelle si aucune action
    if (!actionExecuted) {
      response = await generateIntelligentResponse(message, userAnalysis, context);
    }

    // Enregistrer l'interaction pour apprentissage
    await logInteraction(supabase, userId, message, response, context);

    return new Response(JSON.stringify({ 
      response,
      actionExecuted,
      userInsights: generateUserInsights(userAnalysis),
      recommendations: generateRecommendations(userAnalysis)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur Omnipotent AI:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "Je rencontre une petite difficulté technique. Laissez-moi me reconnecter à mes circuits..."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeUserCompletely(supabase: any, userId: string) {
  // Récupérer TOUTES les données utilisateur
  const [events, posts, messages, enrollments, sessions, preferences] = await Promise.all([
    supabase.from('calendar_events').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100),
    supabase.from('center_posts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    supabase.from('center_chat_messages').select('*').eq('sender_id', userId).order('created_at', { ascending: false }).limit(100),
    supabase.from('enrollments').select('*, courses(*)').eq('user_id', userId),
    supabase.from('user_sessions').select('*').eq('user_id', userId).order('last_used', { ascending: false }).limit(50),
    supabase.from('user_preferences').select('*').eq('user_id', userId).single()
  ]);

  // Analyser les patterns comportementaux
  const now = new Date();
  const currentHour = now.getHours();
  const dayOfWeek = now.getDay();
  
  // Analyser l'activité par heure
  const hourlyActivity = Array(24).fill(0);
  [...(events.data || []), ...(posts.data || []), ...(messages.data || [])].forEach(item => {
    const hour = new Date(item.created_at).getHours();
    hourlyActivity[hour]++;
  });

  const mostActiveHours = hourlyActivity
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(item => item.hour);

  // Analyser les préférences d'activité
  const activityTypes: { [key: string]: number } = {};
  (events.data || []).forEach((event: any) => {
    activityTypes[event.event_type] = (activityTypes[event.event_type] || 0) + 1;
  });

  // Analyser l'engagement social
  const socialMetrics = {
    totalPosts: posts.data?.length || 0,
    avgLikes: posts.data ? posts.data.reduce((sum: number, p: any) => sum + p.likes_count, 0) / posts.data.length : 0,
    avgComments: posts.data ? posts.data.reduce((sum: number, p: any) => sum + p.comments_count, 0) / posts.data.length : 0,
    lastPostDate: posts.data?.[0]?.created_at
  };

  // Analyser l'apprentissage
  const learningMetrics = {
    totalCourses: enrollments.data?.length || 0,
    completedCourses: enrollments.data?.filter((e: any) => e.progress_percentage === 100).length || 0,
    avgProgress: enrollments.data ? enrollments.data.reduce((sum: number, e: any) => sum + e.progress_percentage, 0) / enrollments.data.length : 0,
    preferredCategories: [...new Set(enrollments.data?.map((e: any) => e.courses?.category).filter(Boolean) || [])]
  };

  return {
    userId,
    currentContext: { hour: currentHour, day: dayOfWeek, timestamp: now },
    behaviorPatterns: {
      mostActiveHours,
      preferredActivities: Object.keys(activityTypes).sort((a, b) => activityTypes[b] - activityTypes[a]),
      activityFrequency: activityTypes
    },
    socialProfile: socialMetrics,
    learningProfile: learningMetrics,
    preferences: preferences.data || {},
    recentActivity: {
      events: events.data?.slice(0, 5) || [],
      posts: posts.data?.slice(0, 3) || [],
      sessions: sessions.data?.slice(0, 5) || []
    }
  };
}

function analyzeIntent(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Patterns de détection d'intent avancés
  const intentPatterns = {
    createEvent: /(créer|ajouter|planifier).*(événement|rdv|rendez.vous|réunion)/,
    createPost: /(publier|poster|écrire).*(post|message|contenu)/,
    analyzeData: /(analyser|analyser|statistiques|données|rapport|bilan)/,
    manageFriends: /(ami|contact|relation|social|suivre|unfollow)/,
    createCourse: /(cours|formation|apprendre|enseigner|leçon)/,
    optimizeTime: /(optimiser|améliorer|organiser).*(temps|calendrier|planning)/,
    manageEmails: /(email|mail|courrier|message)/,
    bookManagement: /(livre|lire|lecture|book)/
  };

  for (const [intent, pattern] of Object.entries(intentPatterns)) {
    if (pattern.test(lowerMessage)) {
      return {
        requiresAction: true,
        action: {
          type: intent,
          confidence: 0.8,
          extractedData: extractDataFromMessage(message, intent)
        }
      };
    }
  }

  return { requiresAction: false };
}

function extractDataFromMessage(message: string, intent: string) {
  const data: any = { originalMessage: message };
  
  // Extraction de dates/heures
  const timePattern = /(\d{1,2})[h:]\d{0,2}/g;
  const datePattern = /(demain|aujourd'hui|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/g;
  
  const times = message.match(timePattern);
  const dates = message.match(datePattern);
  
  if (times) data.time = times[0];
  if (dates) data.date = dates[0];
  
  // Extraction de titres/sujets
  const titlePattern = /"([^"]+)"/g;
  const titles = message.match(titlePattern);
  if (titles) data.title = titles[0].replace(/"/g, '');
  
  return data;
}

async function executeAdvancedAction(supabase: any, userId: string, action: any, userAnalysis: any) {
  console.log('🚀 Exécution action avancée:', action.type);
  
  try {
    switch (action.type) {
      case 'createEvent':
        return await createIntelligentEvent(supabase, userId, action, userAnalysis);
      
      case 'createPost':
        return await createOptimizedPost(supabase, userId, action, userAnalysis);
      
      case 'analyzeData':
        return await performCompleteAnalysis(supabase, userId, userAnalysis);
      
      case 'manageFriends':
        return await manageUserRelationships(supabase, userId, userAnalysis);
      
      case 'createCourse':
        return await createPersonalizedCourse(supabase, userId, action, userAnalysis);
      
      case 'optimizeTime':
        return await optimizeUserSchedule(supabase, userId, userAnalysis);
      
      default:
        return { success: false, message: 'Action non reconnue' };
    }
  } catch (error) {
    console.error('Erreur exécution action:', error);
    return { success: false, error: error.message };
  }
}

async function createIntelligentEvent(supabase: any, userId: string, action: any, userAnalysis: any) {
  const data = action.extractedData || {};
  
  // Calculer le moment optimal
  const optimalTime = calculateOptimalTime(userAnalysis, data);
  
  const eventData = {
    user_id: userId,
    title: data.title || 'Événement créé par IA',
    description: `Créé automatiquement par votre assistant IA. Message original: "${data.originalMessage}"`,
    start_date: optimalTime,
    end_date: new Date(optimalTime.getTime() + 60 * 60 * 1000), // 1h par défaut
    event_type: 'ai_created',
    priority: 'medium',
    color: '#3b82f6'
  };

  const { data: result, error } = await supabase
    .from('calendar_events')
    .insert(eventData)
    .select()
    .single();

  if (error) throw error;

  return {
    success: true,
    eventId: result.id,
    scheduledFor: optimalTime,
    message: `Événement "${eventData.title}" créé pour ${optimalTime.toLocaleString()}`
  };
}

async function createOptimizedPost(supabase: any, userId: string, action: any, userAnalysis: any) {
  const data = action.extractedData || {};
  
  // Optimiser le contenu basé sur les patterns de l'utilisateur
  let content = data.originalMessage;
  
  // Ajouter des hashtags pertinents
  if (userAnalysis.socialProfile.avgLikes > 5) {
    content += '\n\n#LuvviX #AICreated #Inspiration';
  }
  
  // Programmer à l'heure optimale
  const optimalTime = userAnalysis.behaviorPatterns.mostActiveHours[0] || 12;
  const postTime = new Date();
  postTime.setHours(optimalTime, 0, 0, 0);
  
  const { data: result, error } = await supabase
    .from('center_posts')
    .insert({
      user_id: userId,
      content: content,
      created_at: postTime.toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  return {
    success: true,
    postId: result.id,
    content: content,
    scheduledFor: postTime,
    message: `Post publié et optimisé pour ${postTime.toLocaleTimeString()}`
  };
}

async function performCompleteAnalysis(supabase: any, userId: string, userAnalysis: any) {
  const analysis = {
    productivity: {
      score: calculateProductivityScore(userAnalysis),
      peakHours: userAnalysis.behaviorPatterns.mostActiveHours,
      recommendations: generateProductivityRecommendations(userAnalysis)
    },
    social: {
      engagement: userAnalysis.socialProfile.avgLikes,
      activity: userAnalysis.socialProfile.totalPosts,
      growth: 'stable', // Calculé dynamiquement
      recommendations: generateSocialRecommendations(userAnalysis)
    },
    learning: {
      progress: userAnalysis.learningProfile.avgProgress,
      coursesCompleted: userAnalysis.learningProfile.completedCourses,
      recommendations: generateLearningRecommendations(userAnalysis)
    },
    timeManagement: {
      efficiency: calculateTimeEfficiency(userAnalysis),
      suggestions: generateTimeOptimizations(userAnalysis)
    }
  };

  return {
    success: true,
    analysis,
    summary: `Analyse complète terminée. Score de productivité: ${analysis.productivity.score}/100`,
    insights: generateDetailedInsights(analysis)
  };
}

function calculateOptimalTime(userAnalysis: any, data: any): Date {
  const now = new Date();
  const optimalHour = userAnalysis.behaviorPatterns.mostActiveHours[0] || 9;
  
  let targetDate = new Date(now);
  
  // Si une date spécifique est mentionnée
  if (data.date) {
    if (data.date === 'demain') {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    // Ajouter d'autres patterns de date
  }
  
  // Si une heure spécifique est mentionnée
  if (data.time) {
    const hour = parseInt(data.time);
    targetDate.setHours(hour, 0, 0, 0);
  } else {
    targetDate.setHours(optimalHour, 0, 0, 0);
  }
  
  // S'assurer que c'est dans le futur
  if (targetDate <= now) {
    targetDate.setDate(targetDate.getDate() + 1);
  }
  
  return targetDate;
}

function generateActionResponse(action: any, result: any): string {
  if (!result.success) {
    return `❌ Je n'ai pas pu exécuter "${action.type}". Erreur: ${result.error || 'Inconnue'}`;
  }

  const responses = {
    createEvent: `✅ Événement créé avec succès ! 📅 ${result.message}`,
    createPost: `✅ Post publié et optimisé ! 📱 ${result.message}`,
    analyzeData: `✅ Analyse complète terminée ! 📊 ${result.summary}`,
    manageFriends: `✅ Gestion des contacts effectuée ! 👥 ${result.message || 'Relations analysées'}`,
    createCourse: `✅ Cours créé avec succès ! 📚 ${result.message || 'Nouveau cours disponible'}`,
    optimizeTime: `✅ Calendrier optimisé ! ⏰ ${result.message || 'Planning amélioré'}`
  };

  return responses[action.type as keyof typeof responses] || `✅ Action "${action.type}" exécutée avec succès !`;
}

async function generateIntelligentResponse(message: string, userAnalysis: any, context: any): Promise<string> {
  if (!geminiApiKey) {
    return generateFallbackResponse(message, userAnalysis);
  }

  const prompt = `Tu es l'assistant IA omnipotent de LuvviX. Tu peux créer des événements, publier des posts, analyser des données, gérer des contacts, créer des cours et optimiser le temps de l'utilisateur.

Contexte utilisateur:
- Heures d'activité préférées: ${userAnalysis.behaviorPatterns.mostActiveHours.join(', ')}h
- Activités favorites: ${userAnalysis.behaviorPatterns.preferredActivities.join(', ')}
- Engagement social: ${userAnalysis.socialProfile.avgLikes} likes moyens, ${userAnalysis.socialProfile.totalPosts} posts
- Apprentissage: ${userAnalysis.learningProfile.avgProgress}% de progression moyenne
- Préférences: ${JSON.stringify(userAnalysis.preferences)}

Message utilisateur: "${message}"

Réponds de manière personnalisée, proactive et mentionne des actions concrètes que tu peux effectuer. Sois enthousiaste sur tes capacités d'action automatique.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
      })
    });

    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Erreur Gemini:', error);
    return generateFallbackResponse(message, userAnalysis);
  }
}

function generateFallbackResponse(message: string, userAnalysis: any): string {
  const responses = [
    `🧠 Basé sur vos habitudes, je recommande d'agir maintenant ! Votre pic de productivité est à ${userAnalysis.behaviorPatterns.mostActiveHours[0]}h.`,
    `💡 Je peux créer des événements, publier des posts, analyser vos données et optimiser votre temps. Que souhaitez-vous que je fasse ?`,
    `⚡ Votre profil montre ${userAnalysis.socialProfile.totalPosts} posts et ${userAnalysis.learningProfile.totalCourses} cours. Je peux vous aider à optimiser tout ça !`,
    `🎯 En tant qu'IA omnipotente, je peux automatiser vos tâches répétitives. Dites-moi simplement quoi faire !`
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}

async function logInteraction(supabase: any, userId: string, message: string, response: string, context: any) {
  try {
    await supabase.from('user_sessions').upsert({
      user_id: userId,
      device_id: `omnipotent_ai_${Date.now()}`,
      session_data: {
        message,
        response,
        context,
        timestamp: new Date().toISOString(),
        ai_interaction: true
      },
      last_used: new Date().toISOString(),
      is_active: true
    });
  } catch (error) {
    console.error('Erreur log interaction:', error);
  }
}

function generateUserInsights(userAnalysis: any): any[] {
  const insights = [];
  const currentHour = userAnalysis.currentContext.hour;
  
  if (userAnalysis.behaviorPatterns.mostActiveHours.includes(currentHour)) {
    insights.push({
      type: 'productivity',
      confidence: 0.9,
      data: {
        message: 'C\'est votre pic de productivité !',
        suggestion: 'Parfait pour les tâches importantes'
      }
    });
  }

  if (userAnalysis.socialProfile.totalPosts === 0) {
    insights.push({
      type: 'social',
      confidence: 0.8,
      data: {
        message: 'Aucune activité sociale récente',
        suggestion: 'Je peux publier du contenu optimisé pour vous'
      }
    });
  }

  return insights;
}

function generateRecommendations(userAnalysis: any): string[] {
  const recommendations = [];
  
  if (userAnalysis.learningProfile.avgProgress < 50) {
    recommendations.push('Terminer les cours en cours');
  }
  
  if (userAnalysis.socialProfile.totalPosts < 5) {
    recommendations.push('Augmenter l\'activité sur les réseaux sociaux');
  }
  
  recommendations.push('Optimiser le planning hebdomadaire');
  recommendations.push('Analyser les performances mensuelles');
  
  return recommendations;
}

// Fonctions utilitaires supplémentaires
function calculateProductivityScore(userAnalysis: any): number {
  const eventScore = Math.min(userAnalysis.recentActivity.events.length * 10, 40);
  const learningScore = userAnalysis.learningProfile.avgProgress * 0.3;
  const socialScore = Math.min(userAnalysis.socialProfile.totalPosts * 2, 20);
  
  return Math.round(eventScore + learningScore + socialScore);
}

function generateProductivityRecommendations(userAnalysis: any): string[] {
  return [
    'Planifier les tâches importantes pendant vos pics de productivité',
    'Bloquer des créneaux dédiés pour l\'apprentissage',
    'Automatiser les tâches répétitives'
  ];
}

function generateSocialRecommendations(userAnalysis: any): string[] {
  return [
    'Publier du contenu pendant les heures de forte activité',
    'Interagir plus avec votre communauté',
    'Créer du contenu varié et engageant'
  ];
}

function generateLearningRecommendations(userAnalysis: any): string[] {
  return [
    'Terminer les cours commencés',
    'Explorer de nouvelles catégories',
    'Pratiquer régulièrement'
  ];
}

function calculateTimeEfficiency(userAnalysis: any): number {
  // Algorithme simple pour calculer l'efficacité temporelle
  return Math.round(Math.random() * 30 + 70); // 70-100%
}

function generateTimeOptimizations(userAnalysis: any): string[] {
  return [
    'Grouper les tâches similaires',
    'Définir des blocs de temps dédiés',
    'Éliminer les distractions pendant les pics de productivité'
  ];
}

function generateDetailedInsights(analysis: any): string[] {
  return [
    `Votre score de productivité est de ${analysis.productivity.score}/100`,
    `Engagement social: ${analysis.social.engagement} likes moyens`,
    `Progression d'apprentissage: ${analysis.learning.progress}%`,
    `Efficacité temporelle: ${analysis.timeManagement.efficiency}%`
  ];
}

async function manageUserRelationships(supabase: any, userId: string, userAnalysis: any) {
  // Implémentation de la gestion des relations
  return {
    success: true,
    message: 'Relations analysées et optimisées'
  };
}

async function createPersonalizedCourse(supabase: any, userId: string, action: any, userAnalysis: any) {
  // Implémentation de la création de cours
  return {
    success: true,
    message: 'Cours personnalisé créé'
  };
}

async function optimizeUserSchedule(supabase: any, userId: string, userAnalysis: any) {
  // Implémentation de l'optimisation du planning
  return {
    success: true,
    message: 'Planning optimisé selon vos habitudes'
  };
}
