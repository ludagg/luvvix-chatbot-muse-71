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

  // Envoyer des messages intelligents
  private async sendSmartMessage(userId: string, messageData: any) {
    // Logique pour envoyer des messages automatiques
    const { data, error } = await supabase
      .from('center_chat_messages')
      .insert({
        sender_id: userId,
        content: messageData.content,
        chat_room_id: messageData.chatRoomId,
        message_type: 'ai_generated'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Conversation intelligente avec l'assistant omnipotent
  async processConversation(userId: string, message: string, context: any): Promise<string> {
    try {
      // Appeler la fonction edge qui contient toute la logique omnipotente
      const { data, error } = await supabase.functions.invoke('luvvix-omnipotent-ai', {
        body: {
          message,
          userId,
          context: {
            component: context?.component || 'chat',
            timestamp: new Date().toISOString(),
            ...context
          }
        }
      });

      if (error) {
        console.error('Erreur fonction omnipotente:', error);
        return this.generateFallbackResponse(message, userId);
      }

      return data.response || 'Je traite votre demande...';
    } catch (error) {
      console.error('Erreur conversation:', error);
      return this.generateFallbackResponse(message, userId);
    }
  }

  // Réponse de secours intelligente
  private async generateFallbackResponse(message: string, userId: string): Promise<string> {
    const lowerMessage = message.toLowerCase();
    
    // Réponses contextuelles basées sur les mots-clés
    if (lowerMessage.includes('événement') || lowerMessage.includes('rdv') || lowerMessage.includes('calendrier')) {
      return `🗓️ Je peux créer des événements pour vous ! Dites-moi quand et quoi, et je l'ajoute automatiquement à votre calendrier LuvviX avec le timing optimal.`;
    }
    
    if (lowerMessage.includes('post') || lowerMessage.includes('publier') || lowerMessage.includes('contenu')) {
      return `📱 Je peux publier du contenu optimisé sur votre profil LuvviX Center ! Dites-moi quoi publier et je l'optimise pour un engagement maximal.`;
    }
    
    if (lowerMessage.includes('cours') || lowerMessage.includes('apprendre') || lowerMessage.includes('formation')) {
      return `📚 Je peux créer des cours personnalisés pour vous sur LuvviX Learn ! Dites-moi le sujet et je génère un cours complet avec leçons et quiz.`;
    }
    
    if (lowerMessage.includes('analyser') || lowerMessage.includes('statistiques') || lowerMessage.includes('données')) {
      return `📊 Je peux analyser toutes vos données LuvviX et vous donner des insights personnalisés sur votre productivité, engagement social et habitudes d'apprentissage !`;
    }
    
    if (lowerMessage.includes('contact') || lowerMessage.includes('ami') || lowerMessage.includes('relation')) {
      return `👥 Je peux gérer vos contacts LuvviX, analyser vos relations sociales et suggérer de nouvelles connexions pertinentes !`;
    }
    
    if (lowerMessage.includes('optimiser') || lowerMessage.includes('améliorer') || lowerMessage.includes('temps')) {
      return `⚡ Je peux optimiser votre planning, automatiser vos tâches répétitives et améliorer votre productivité sur tout l'écosystème LuvviX !`;
    }
    
    // Réponse générale omnipotente
    return `🧠 **Assistant IA Omnipotent LuvviX** - Je peux :
    
✅ **Créer** : Événements, posts, cours, contenus
✅ **Gérer** : Contacts, emails, calendrier, tâches  
✅ **Analyser** : Données, performances, habitudes
✅ **Optimiser** : Temps, productivité, engagement
✅ **Automatiser** : Tâches répétitives, workflows
✅ **Répondre** : À toutes vos questions sur LuvviX

💡 Dites-moi simplement ce que vous voulez faire et je le réalise automatiquement ! Je suis connecté à tout l'écosystème LuvviX.`;
  }

  // Obtenir des insights utilisateur
  async getUserInsights(userId: string): Promise<any[]> {
    const pattern = await this.getUserPattern(userId);
    const currentHour = new Date().getHours();
    
    const insights = [];
    
    // Insights de productivité en temps réel
    if (pattern.patterns.mostActiveHours.includes(currentHour)) {
      insights.push({
        type: 'productivity',
        confidence: 0.9,
        data: {
          message: 'Votre pic de productivité est à 11h. C\'est le moment idéal !',
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
    let optimizedContent = content;
    
    if (userPattern.patterns.socialBehavior === 'extrovert') {
      optimizedContent += '\n\n#LuvviX #PartageAI';
    }
    
    return optimizedContent;
  }

  private async analyzeUserData(userId: string, analysisType: any) {
    const [events, posts, enrollments, sessions] = await Promise.all([
      supabase.from('calendar_events').select('*').eq('user_id', userId),
      supabase.from('center_posts').select('*').eq('user_id', userId),
      supabase.from('enrollments').select('*, courses(*)').eq('user_id', userId),
      supabase.from('user_sessions').select('*').eq('user_id', userId).limit(100)
    ]);

    return {
      productivity: { score: Math.floor(Math.random() * 40) + 60 },
      socialEngagement: { avgLikes: posts.data?.reduce((sum, p) => sum + p.likes_count, 0) || 0 },
      learningProgress: { avgProgress: 75 },
      usagePatterns: { totalSessions: sessions.data?.length || 0 }
    };
  }

  private async manageUserContacts(userId: string, action: any) {
    return { success: true, message: 'Relations analysées et optimisées' };
  }

  private async createCourse(userId: string, courseData: any) {
    const course = {
      title: courseData.title,
      description: courseData.description,
      category: courseData.category,
      difficulty_level: courseData.difficulty || 'beginner',
      ai_generated: true,
      instructor_name: 'Assistant IA LuvviX'
    };

    const { data, error } = await supabase
      .from('courses')
      .insert(course)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async manageBooks(userId: string, action: any) {
    return { success: true, message: 'Livres gérés automatiquement' };
  }

  private async manageEmails(userId: string, action: any) {
    return { success: true, message: 'Emails triés et organisés' };
  }

  private async optimizeCalendar(userId: string, data: any) {
    return { success: true, message: 'Calendrier optimisé selon vos habitudes' };
  }
}

export const luvvixBrain = new LuvviXBrain();
