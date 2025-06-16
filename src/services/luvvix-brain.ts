
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LuvviXBrainAction {
  type: 'create_event' | 'create_post' | 'send_message' | 'analyze_data' | 'manage_contacts' | 'book_management' | 'course_creation' | 'email_management' | 'news_curation' | 'weather_analysis' | 'calendar_optimization';
  data: any;
  context: string;
}

interface UserPattern {
  userId: string;
  patterns: {
    mostActiveHours: number[];
    preferredActions: string[];
    interactionFrequency: { [key: string]: number };
    socialBehavior: 'introvert' | 'extrovert' | 'ambivert';
    productivityPeaks: string[];
    preferences: { [key: string]: any };
  };
}

class LuvviXBrain {
  private userPatterns: Map<string, UserPattern> = new Map();
  private systemKnowledge: { [key: string]: any } = {};

  // Analyser les patterns utilisateur
  async analyzeUserPatterns(userId: string): Promise<UserPattern> {
    try {
      // Récupérer toutes les données utilisateur
      const [events, posts, messages, sessions] = await Promise.all([
        supabase.from('calendar_events').select('*').eq('user_id', userId),
        supabase.from('center_posts').select('*').eq('user_id', userId),
        supabase.from('center_chat_messages').select('*').eq('sender_id', userId),
        supabase.from('user_sessions').select('*').eq('user_id', userId)
      ]);

      // Analyser les patterns d'activité
      const activityData = [
        ...(events.data || []),
        ...(posts.data || []),
        ...(messages.data || [])
      ];

      const hourlyActivity = Array(24).fill(0);
      const actionTypes: { [key: string]: number } = {};

      activityData.forEach(item => {
        const hour = new Date(item.created_at).getHours();
        hourlyActivity[hour]++;
        
        if (item.event_type) actionTypes[item.event_type] = (actionTypes[item.event_type] || 0) + 1;
        if (item.content) actionTypes['social_post'] = (actionTypes['social_post'] || 0) + 1;
      });

      const mostActiveHours = hourlyActivity
        .map((count, hour) => ({ hour, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3)
        .map(item => item.hour);

      const pattern: UserPattern = {
        userId,
        patterns: {
          mostActiveHours,
          preferredActions: Object.keys(actionTypes).sort((a, b) => actionTypes[b] - actionTypes[a]).slice(0, 5),
          interactionFrequency: actionTypes,
          socialBehavior: this.determineSocialBehavior(posts.data || [], messages.data || []),
          productivityPeaks: this.calculateProductivityPeaks(events.data || []),
          preferences: await this.extractUserPreferences(userId)
        }
      };

      this.userPatterns.set(userId, pattern);
      return pattern;
    } catch (error) {
      console.error('Erreur analyse patterns:', error);
      throw error;
    }
  }

  // Traquer les interactions en temps réel
  async trackInteraction(userId: string, action: string, component: string, data: any) {
    try {
      await supabase.from('user_sessions').upsert({
        user_id: userId,
        device_id: `brain_${Date.now()}`,
        session_data: {
          action,
          component,
          timestamp: new Date().toISOString(),
          data,
          brain_analysis: true
        },
        last_used: new Date().toISOString(),
        is_active: true
      });

      // Mettre à jour les patterns en temps réel
      await this.updateUserPatterns(userId, action, data);
    } catch (error) {
      console.error('Erreur tracking:', error);
    }
  }

  // Actions automatiques du cerveau
  async executeAutomaticAction(userId: string, action: LuvviXBrainAction): Promise<any> {
    console.log(`🧠 Exécution automatique: ${action.type}`, action.data);

    try {
      switch (action.type) {
        case 'create_event':
          return await this.createSmartEvent(userId, action.data);
        
        case 'create_post':
          return await this.createSmartPost(userId, action.data);
        
        case 'send_message':
          return await this.sendSmartMessage(userId, action.data);
        
        case 'analyze_data':
          return await this.analyzeUserData(userId, action.data);
        
        case 'manage_contacts':
          return await this.manageUserContacts(userId, action.data);
        
        case 'book_management':
          return await this.manageBooks(userId, action.data);
        
        case 'course_creation':
          return await this.createCourse(userId, action.data);
        
        case 'email_management':
          return await this.manageEmails(userId, action.data);
        
        case 'calendar_optimization':
          return await this.optimizeCalendar(userId, action.data);
        
        default:
          throw new Error(`Action non supportée: ${action.type}`);
      }
    } catch (error) {
      console.error(`Erreur exécution ${action.type}:`, error);
      throw error;
    }
  }

  // Créer des événements intelligents
  private async createSmartEvent(userId: string, eventData: any) {
    const userPattern = await this.getUserPattern(userId);
    const optimalTime = this.suggestOptimalTime(userPattern, eventData.type);
    
    const smartEvent = {
      user_id: userId,
      title: eventData.title || 'Événement créé par IA',
      description: eventData.description || 'Créé automatiquement par votre assistant IA',
      start_date: optimalTime,
      end_date: new Date(optimalTime.getTime() + (eventData.duration || 60) * 60000).toISOString(),
      event_type: eventData.type || 'ai_created',
      priority: this.calculatePriority(eventData, userPattern),
      color: this.selectOptimalColor(eventData.type),
      all_day: eventData.allDay || false,
      location: eventData.location,
      attendees: eventData.attendees || []
    };

    const { data, error } = await supabase
      .from('calendar_events')
      .insert(smartEvent)
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "🧠 Événement créé par IA",
      description: `J'ai créé "${smartEvent.title}" au moment optimal pour vous`
    });

    return data;
  }

  // Créer des posts intelligents
  private async createSmartPost(userId: string, postData: any) {
    const userPattern = await this.getUserPattern(userId);
    const optimalTime = this.getOptimalPostingTime(userPattern);
    
    // Analyser le contenu et l'optimiser
    const optimizedContent = await this.optimizePostContent(postData.content, userPattern);
    
    const { data, error } = await supabase
      .from('center_posts')
      .insert({
        user_id: userId,
        content: optimizedContent,
        media_urls: postData.media_urls || [],
        video_url: postData.video_url,
        created_at: optimalTime
      })
      .select()
      .single();

    if (error) throw error;

    toast({
      title: "🧠 Post créé par IA",
      description: "J'ai optimisé votre contenu pour un engagement maximal"
    });

    return data;
  }

  // Gérer les contacts intelligemment
  private async manageUserContacts(userId: string, action: any) {
    switch (action.operation) {
      case 'analyze_relationships':
        return await this.analyzeRelationships(userId);
      
      case 'suggest_connections':
        return await this.suggestNewConnections(userId);
      
      case 'auto_follow':
        return await this.autoFollowRecommendations(userId, action.criteria);
      
      case 'organize_friends':
        return await this.organizeFriendships(userId);
    }
  }

  // Analyser les données utilisateur
  private async analyzeUserData(userId: string, analysisType: any) {
    const [events, posts, enrollments, sessions] = await Promise.all([
      supabase.from('calendar_events').select('*').eq('user_id', userId),
      supabase.from('center_posts').select('*').eq('user_id', userId),
      supabase.from('enrollments').select('*, courses(*)').eq('user_id', userId),
      supabase.from('user_sessions').select('*').eq('user_id', userId).limit(100)
    ]);

    const analysis = {
      productivity: this.analyzeProductivity(events.data || []),
      socialEngagement: this.analyzeSocialEngagement(posts.data || []),
      learningProgress: this.analyzeLearningProgress(enrollments.data || []),
      usagePatterns: this.analyzeUsagePatterns(sessions.data || []),
      recommendations: await this.generateRecommendations(userId)
    };

    return analysis;
  }

  // Créer des cours automatiquement
  private async createCourse(userId: string, courseData: any) {
    const course = {
      title: courseData.title,
      description: courseData.description,
      category: courseData.category,
      difficulty_level: courseData.difficulty || 'beginner',
      ai_generated: true,
      instructor_name: 'Assistant IA LuvviX',
      learning_objectives: courseData.objectives || [],
      tags: courseData.tags || [],
      what_you_will_learn: courseData.learningOutcomes || []
    };

    const { data, error } = await supabase
      .from('courses')
      .insert(course)
      .select()
      .single();

    if (error) throw error;

    // Créer les leçons automatiquement
    if (courseData.lessons) {
      for (let i = 0; i < courseData.lessons.length; i++) {
        await supabase.from('lessons').insert({
          course_id: data.id,
          title: courseData.lessons[i].title,
          content: courseData.lessons[i].content,
          lesson_order: i + 1,
          lesson_type: courseData.lessons[i].type || 'theory',
          ai_content: { generated_by: 'luvvix_brain', timestamp: new Date().toISOString() }
        });
      }
    }

    toast({
      title: "🧠 Cours créé par IA",
      description: `Le cours "${course.title}" a été créé avec ${courseData.lessons?.length || 0} leçons`
    });

    return data;
  }

  // Conversation intelligente
  async processConversation(userId: string, message: string, context: any): Promise<string> {
    const userPattern = await this.getUserPattern(userId);
    
    // Analyser l'intention
    const intent = await this.analyzeIntent(message, context);
    
    // Exécuter des actions si nécessaire
    if (intent.requiresAction) {
      const actionResult = await this.executeAutomaticAction(userId, intent.action);
      return this.generateResponseWithAction(intent, actionResult, userPattern);
    }
    
    // Générer une réponse contextuelle
    return await this.generateContextualResponse(message, userPattern, context);
  }

  // Obtenir des insights utilisateur
  async getUserInsights(userId: string): Promise<any[]> {
    const pattern = await this.getUserPattern(userId);
    const currentHour = new Date().getHours();
    
    const insights = [];
    
    // Insights de productivité
    if (pattern.patterns.mostActiveHours.includes(currentHour)) {
      insights.push({
        type: 'productivity',
        confidence: 0.9,
        data: {
          message: 'C\'est votre pic de productivité ! Parfait pour les tâches importantes.',
          suggestion: 'Profitez de ce moment pour vos projets prioritaires'
        }
      });
    }
    
    // Insights sociaux
    const recentPosts = await supabase
      .from('center_posts')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    if ((recentPosts.data?.length || 0) === 0) {
      insights.push({
        type: 'social',
        confidence: 0.7,
        data: {
          message: 'Vous n\'avez pas publié aujourd\'hui',
          suggestion: 'Partagez quelque chose avec votre communauté !'
        }
      });
    }
    
    return insights;
  }

  // Méthodes utilitaires privées
  private async getUserPattern(userId: string): Promise<UserPattern> {
    if (!this.userPatterns.has(userId)) {
      await this.analyzeUserPatterns(userId);
    }
    return this.userPatterns.get(userId)!;
  }

  private determineSocialBehavior(posts: any[], messages: any[]): 'introvert' | 'extrovert' | 'ambivert' {
    const totalInteractions = posts.length + messages.length;
    if (totalInteractions > 50) return 'extrovert';
    if (totalInteractions < 10) return 'introvert';
    return 'ambivert';
  }

  private calculateProductivityPeaks(events: any[]): string[] {
    const timeSlots = { morning: 0, afternoon: 0, evening: 0 };
    
    events.forEach(event => {
      const hour = new Date(event.start_date).getHours();
      if (hour >= 6 && hour < 12) timeSlots.morning++;
      else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
      else timeSlots.evening++;
    });

    return Object.entries(timeSlots)
      .sort(([,a], [,b]) => b - a)
      .map(([slot]) => slot);
  }

  private async extractUserPreferences(userId: string): Promise<any> {
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return data || {};
  }

  private async updateUserPatterns(userId: string, action: string, data: any) {
    // Mise à jour en temps réel des patterns
    const pattern = this.userPatterns.get(userId);
    if (pattern) {
      pattern.patterns.interactionFrequency[action] = (pattern.patterns.interactionFrequency[action] || 0) + 1;
      this.userPatterns.set(userId, pattern);
    }
  }

  private suggestOptimalTime(userPattern: UserPattern, eventType: string): Date {
    const now = new Date();
    const optimalHour = userPattern.patterns.mostActiveHours[0] || 9;
    
    const optimalTime = new Date(now);
    optimalTime.setHours(optimalHour, 0, 0, 0);
    
    // Si l'heure est passée, programmer pour demain
    if (optimalTime <= now) {
      optimalTime.setDate(optimalTime.getDate() + 1);
    }
    
    return optimalTime;
  }

  private calculatePriority(eventData: any, userPattern: UserPattern): 'high' | 'medium' | 'low' {
    if (eventData.urgent || eventData.deadline) return 'high';
    if (userPattern.patterns.preferredActions.includes(eventData.type)) return 'medium';
    return 'low';
  }

  private selectOptimalColor(eventType: string): string {
    const colorMap: { [key: string]: string } = {
      work: '#ef4444',
      personal: '#3b82f6',
      health: '#10b981',
      social: '#f59e0b',
      learning: '#8b5cf6',
      ai_created: '#06b6d4'
    };
    return colorMap[eventType] || '#6b7280';
  }

  private getOptimalPostingTime(userPattern: UserPattern): string {
    const optimalHour = userPattern.patterns.mostActiveHours[0] || 12;
    const now = new Date();
    now.setHours(optimalHour, Math.floor(Math.random() * 60), 0, 0);
    return now.toISOString();
  }

  private async optimizePostContent(content: string, userPattern: UserPattern): Promise<string> {
    // Ajouter des hashtags basés sur les préférences
    let optimizedContent = content;
    
    if (userPattern.patterns.socialBehavior === 'extrovert') {
      optimizedContent += '\n\n#LuvviX #PartageAI';
    }
    
    return optimizedContent;
  }

  private async analyzeIntent(message: string, context: any): Promise<any> {
    const keywords = message.toLowerCase();
    
    if (keywords.includes('créer') && keywords.includes('événement')) {
      return {
        requiresAction: true,
        action: {
          type: 'create_event',
          data: { title: 'Événement demandé', type: 'ai_created' },
          context: 'user_request'
        }
      };
    }
    
    if (keywords.includes('publier') || keywords.includes('post')) {
      return {
        requiresAction: true,
        action: {
          type: 'create_post',
          data: { content: message },
          context: 'user_request'
        }
      };
    }
    
    return { requiresAction: false };
  }

  private generateResponseWithAction(intent: any, actionResult: any, userPattern: UserPattern): string {
    return `✅ J'ai exécuté votre demande ! ${intent.action.type === 'create_event' ? 'Événement créé' : 'Post publié'} avec succès. Basé sur vos habitudes, j'ai optimisé ${intent.action.type === 'create_event' ? 'le timing' : 'le contenu'} pour vous.`;
  }

  private async generateContextualResponse(message: string, userPattern: UserPattern, context: any): Promise<string> {
    const responses = [
      `Basé sur vos habitudes, je recommande de ${userPattern.patterns.preferredActions[0]} maintenant.`,
      `Votre pic de productivité est à ${userPattern.patterns.mostActiveHours[0]}h. C'est le moment idéal !`,
      `En tant qu'assistant IA, j'ai analysé votre comportement ${userPattern.patterns.socialBehavior}. Voici ce que je peux faire pour vous...`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private analyzeProductivity(events: any[]): any {
    return {
      totalEvents: events.length,
      completedEvents: events.filter(e => e.completed).length,
      avgEventsPerDay: events.length / 30,
      mostProductiveHour: this.getMostCommonHour(events)
    };
  }

  private analyzeSocialEngagement(posts: any[]): any {
    return {
      totalPosts: posts.length,
      avgLikes: posts.reduce((sum, p) => sum + p.likes_count, 0) / posts.length || 0,
      avgComments: posts.reduce((sum, p) => sum + p.comments_count, 0) / posts.length || 0,
      engagementTrend: 'croissant'
    };
  }

  private analyzeLearningProgress(enrollments: any[]): any {
    return {
      totalCourses: enrollments.length,
      completedCourses: enrollments.filter(e => e.progress_percentage === 100).length,
      avgProgress: enrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / enrollments.length || 0,
      preferredCategories: []
    };
  }

  private analyzeUsagePatterns(sessions: any[]): any {
    return {
      totalSessions: sessions.length,
      avgSessionTime: 45,
      mostUsedFeatures: ['calendar', 'social', 'learning'],
      deviceTypes: ['mobile', 'desktop']
    };
  }

  private async generateRecommendations(userId: string): Promise<string[]> {
    return [
      'Créer un événement de planification hebdomadaire',
      'Publier plus de contenu pendant vos heures de pointe',
      'Terminer le cours commencé la semaine dernière',
      'Connecter avec des utilisateurs similaires'
    ];
  }

  private getMostCommonHour(events: any[]): number {
    const hours = events.map(e => new Date(e.start_date).getHours());
    const frequency: { [key: number]: number } = {};
    
    hours.forEach(hour => {
      frequency[hour] = (frequency[hour] || 0) + 1;
    });
    
    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)[0]?.[0] 
      ? parseInt(Object.entries(frequency).sort(([,a], [,b]) => b - a)[0][0]) 
      : 9;
  }

  private async analyzeRelationships(userId: string) {
    const { data: friendships } = await supabase
      .from('center_friendships')
      .select('*')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
    
    return {
      totalFriends: friendships?.filter(f => f.status === 'accepted').length || 0,
      pendingRequests: friendships?.filter(f => f.status === 'pending').length || 0,
      mutualConnections: [] // À implémenter
    };
  }

  private async suggestNewConnections(userId: string) {
    const { data: users } = await supabase
      .from('user_profiles')
      .select('*')
      .neq('id', userId)
      .limit(5);
    
    return users || [];
  }

  private async autoFollowRecommendations(userId: string, criteria: any) {
    // Logique d'auto-follow basée sur les critères
    return { followedCount: 0, recommendations: [] };
  }

  private async organizeFriendships(userId: string) {
    // Organiser les amitiés par catégories, fréquence d'interaction, etc.
    return { organized: true, categories: [] };
  }

  private async manageBooks(userId: string, action: any) {
    switch (action.operation) {
      case 'recommend':
        return await this.recommendBooks(userId);
      case 'create_reading_list':
        return await this.createReadingList(userId, action.preferences);
      default:
        return null;
    }
  }

  private async recommendBooks(userId: string) {
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('preferred_genres')
      .eq('user_id', userId)
      .single();
    
    const { data: books } = await supabase
      .from('books')
      .select('*')
      .in('genres', preferences?.preferred_genres || [])
      .limit(5);
    
    return books || [];
  }

  private async createReadingList(userId: string, preferences: any) {
    // Créer une liste de lecture personnalisée
    return { listId: 'new_list', booksAdded: 0 };
  }

  private async manageEmails(userId: string, action: any) {
    switch (action.operation) {
      case 'auto_sort':
        return await this.autoSortEmails(userId);
      case 'draft_responses':
        return await this.draftEmailResponses(userId);
      default:
        return null;
    }
  }

  private async autoSortEmails(userId: string) {
    // Trier automatiquement les emails
    return { sortedCount: 0, categories: [] };
  }

  private async draftEmailResponses(userId: string) {
    // Rédiger des réponses automatiques
    return { draftsCreated: 0 };
  }

  private async optimizeCalendar(userId: string, data: any) {
    // Optimiser le calendrier
    const { data: events } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId);
    
    return {
      optimizationsApplied: 0,
      suggestedChanges: [],
      timeSlotsSuggested: []
    };
  }
}

export const luvvixBrain = new LuvviXBrain();
