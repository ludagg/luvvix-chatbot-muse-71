
import { supabase } from '@/integrations/supabase/client';

export interface AIRecommendation {
  id: string;
  user_id: string;
  recommendation_type: string;
  recommendation_data: any;
  priority: number;
  is_read: boolean;
  created_at: string;
  expires_at?: string;
}

export interface LearningSession {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id?: string;
  started_at: string;
  ended_at?: string;
  time_spent: number;
  actions_taken: any[];
  completion_status: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  course_id?: string;
  lesson_id?: string;
  conversation_data: any[];
  conversation_type: string;
  created_at: string;
  updated_at: string;
}

export const enhancedAIService = {
  // Gestion des sessions d'apprentissage
  async startLearningSession(userId: string, courseId: string, lessonId?: string) {
    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .insert({
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          started_at: new Date().toISOString(),
          completion_status: 'in_progress'
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Session d\'apprentissage démarrée');
      return data;
    } catch (error) {
      console.error('❌ Erreur démarrage session:', error);
      throw error;
    }
  },

  async endLearningSession(sessionId: string, timeSpent: number, actionsTaken: any[] = []) {
    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .update({
          ended_at: new Date().toISOString(),
          time_spent: timeSpent,
          actions_taken: actionsTaken,
          completion_status: 'completed'
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Session d\'apprentissage terminée');
      return data;
    } catch (error) {
      console.error('❌ Erreur fin session:', error);
      throw error;
    }
  },

  async getUserLearningAnalytics(userId: string) {
    try {
      const { data: sessions, error } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });

      if (error) throw error;

      // Calculer les statistiques
      const totalSessions = sessions.length;
      const totalTimeSpent = sessions.reduce((sum, s) => sum + (s.time_spent || 0), 0);
      const completedSessions = sessions.filter(s => s.completion_status === 'completed').length;
      const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

      return {
        totalSessions,
        totalTimeSpent,
        completedSessions,
        completionRate,
        averageSessionTime: totalSessions > 0 ? totalTimeSpent / totalSessions : 0,
        recentSessions: sessions.slice(0, 5)
      };
    } catch (error) {
      console.error('❌ Erreur analytics:', error);
      return {
        totalSessions: 0,
        totalTimeSpent: 0,
        completedSessions: 0,
        completionRate: 0,
        averageSessionTime: 0,
        recentSessions: []
      };
    }
  },

  // Gestion des conversations IA
  async createAIConversation(userId: string, courseId?: string, lessonId?: string, type: string = 'general') {
    try {
      const { data, error } = await supabase
        .from('ai_assistant_conversations')
        .insert({
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          conversation_type: type,
          conversation_data: []
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ Conversation IA créée');
      return data;
    } catch (error) {
      console.error('❌ Erreur création conversation:', error);
      throw error;
    }
  },

  async addMessageToConversation(conversationId: string, message: any) {
    try {
      // Récupérer la conversation actuelle
      const { data: conversation, error: fetchError } = await supabase
        .from('ai_assistant_conversations')
        .select('conversation_data')
        .eq('id', conversationId)
        .single();

      if (fetchError) throw fetchError;

      // Ajouter le nouveau message
      const updatedData = [...(conversation.conversation_data || []), message];

      const { data, error } = await supabase
        .from('ai_assistant_conversations')
        .update({
          conversation_data: updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('❌ Erreur ajout message:', error);
      throw error;
    }
  },

  async getUserConversations(userId: string) {
    try {
      const { data, error } = await supabase
        .from('ai_assistant_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération conversations:', error);
      return [];
    }
  },

  // Gestion des recommandations IA
  async generatePersonalizedRecommendations(userId: string) {
    try {
      console.log('🤖 Génération de recommandations personnalisées...');
      
      // Appeler la fonction PostgreSQL
      const { error } = await supabase
        .rpc('generate_user_recommendations', { target_user_id: userId });

      if (error) {
        console.warn('⚠️ Erreur génération automatique, fallback manuel');
        await this.generateFallbackRecommendations(userId);
      }

      console.log('✅ Recommandations générées');
    } catch (error) {
      console.error('❌ Erreur génération recommandations:', error);
      await this.generateFallbackRecommendations(userId);
    }
  },

  async generateFallbackRecommendations(userId: string) {
    try {
      // Récupérer les données utilisateur
      const [enrollments, analytics] = await Promise.all([
        this.getUserEnrollments(userId),
        this.getUserLearningAnalytics(userId)
      ]);

      const recommendations = [];

      // Recommandations basées sur l'activité
      if (analytics.completionRate < 50) {
        recommendations.push({
          user_id: userId,
          recommendation_type: 'motivation',
          recommendation_data: {
            type: 'encouragement',
            message: 'Vous avez commencé plusieurs cours ! Concentrez-vous sur un cours à la fois pour de meilleurs résultats.',
            action: 'focus_course'
          },
          priority: 3
        });
      }

      // Recommandation de nouveaux cours
      if (enrollments.filter(e => e.progress_percentage >= 80).length > 0) {
        recommendations.push({
          user_id: userId,
          recommendation_type: 'course_suggestion',
          recommendation_data: {
            type: 'advanced_course',
            message: 'Félicitations pour vos progrès ! Prêt pour un défi plus avancé ?',
            action: 'explore_advanced'
          },
          priority: 2
        });
      }

      // Insérer les recommandations
      if (recommendations.length > 0) {
        const { error } = await supabase
          .from('ai_recommendations')
          .insert(recommendations);

        if (error) throw error;
      }

      console.log('✅ Recommandations fallback générées');
    } catch (error) {
      console.error('❌ Erreur recommandations fallback:', error);
    }
  },

  async getUserRecommendations(userId: string) {
    try {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération recommandations:', error);
      return [];
    }
  },

  async markRecommendationAsRead(recommendationId: string) {
    try {
      const { error } = await supabase
        .from('ai_recommendations')
        .update({ is_read: true })
        .eq('id', recommendationId);

      if (error) throw error;
      
      console.log('✅ Recommandation marquée comme lue');
    } catch (error) {
      console.error('❌ Erreur marquage recommandation:', error);
    }
  },

  // Assistant intelligent pour la génération de cours
  async generateIntelligentCourse(topic: string, category: string, difficulty: string, userProfile?: any) {
    try {
      console.log('🧠 Génération de cours intelligent avec IA...');
      
      // Récupérer le template approprié
      const template = await this.getOptimalCourseTemplate(category, difficulty);
      
      // Personnaliser selon le profil utilisateur
      const personalizedData = userProfile ? this.personalizeForUser(userProfile) : {};

      const { data, error } = await supabase.functions.invoke('ai-course-manager', {
        body: { 
          action: 'generate_complete_course',
          courseData: { 
            topic,
            category,
            difficulty,
            template,
            personalization: personalizedData,
            enhanced: true
          }
        }
      });

      if (error) throw error;
      
      console.log('✅ Cours intelligent généré');
      return data;
    } catch (error) {
      console.error('❌ Erreur génération cours intelligent:', error);
      throw error;
    }
  },

  async getOptimalCourseTemplate(category: string, difficulty: string) {
    try {
      const { data, error } = await supabase
        .from('course_templates')
        .select('*')
        .eq('category', category)
        .eq('difficulty_level', difficulty)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      return data || this.getDefaultTemplate(difficulty);
    } catch (error) {
      console.error('❌ Erreur récupération template:', error);
      return this.getDefaultTemplate(difficulty);
    }
  },

  getDefaultTemplate(difficulty: string) {
    const templates = {
      'beginner': {
        lesson_count: 8,
        structure: [
          { type: 'introduction', weight: 0.2 },
          { type: 'theory', weight: 0.5 },
          { type: 'practice', weight: 0.3 }
        ]
      },
      'intermediate': {
        lesson_count: 12,
        structure: [
          { type: 'introduction', weight: 0.1 },
          { type: 'theory', weight: 0.4 },
          { type: 'practice', weight: 0.4 },
          { type: 'project', weight: 0.1 }
        ]
      },
      'advanced': {
        lesson_count: 15,
        structure: [
          { type: 'theory', weight: 0.3 },
          { type: 'practice', weight: 0.4 },
          { type: 'project', weight: 0.3 }
        ]
      }
    };

    return templates[difficulty] || templates['intermediate'];
  },

  personalizeForUser(userProfile: any) {
    return {
      preferredPace: userProfile.learning_pace || 'normal',
      interests: userProfile.interests || [],
      previousExperience: userProfile.experience_level || 'beginner',
      learningStyle: userProfile.learning_style || 'visual'
    };
  },

  // Helper method pour compatibilité
  async getUserEnrollments(userId: string) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération enrollments:', error);
      return [];
    }
  }
};

export default enhancedAIService;
