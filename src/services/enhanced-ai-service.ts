
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  analytics: any;
  learning_pace: string;
  interests: string[];
  experience_level: string;
}

interface CourseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty_level: string;
  template_structure: any;
}

const enhancedAIService = {
  async generateIntelligentCourse(
    topic: string, 
    category: string, 
    difficulty: string, 
    userProfile: UserProfile
  ) {
    try {
      console.log('🧠 Génération de cours intelligent pour:', topic);
      
      const { data, error } = await supabase.functions.invoke('ai-course-manager', {
        body: { 
          action: 'generate_complete_course',
          courseData: { 
            topic,
            category,
            difficulty,
            userProfile,
            enhanced: true
          }
        }
      });

      if (error) {
        console.error('❌ Erreur génération cours intelligent:', error);
        throw error;
      }
      
      console.log('✅ Cours intelligent généré');
      return data;
    } catch (error) {
      console.error('❌ Erreur dans generateIntelligentCourse:', error);
      throw error;
    }
  },

  async getUserLearningAnalytics(userId: string) {
    try {
      const { data: analytics, error } = await supabase
        .from('learning_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Erreur récupération analytics:', error);
        return null;
      }

      const totalSessions = analytics.filter(a => a.action_type === 'session_start').length;
      const completedCourses = analytics.filter(a => a.action_type === 'course_completion').length;
      const averageSessionTime = this.calculateAverageSessionTime(analytics);
      const completionRate = totalSessions > 0 ? (completedCourses / totalSessions) * 100 : 0;

      return {
        totalSessions,
        completedCourses,
        averageSessionTime,
        completionRate,
        preferredCategories: this.extractPreferredCategories(analytics),
        studyPatterns: this.analyzeStudyPatterns(analytics)
      };
    } catch (error) {
      console.error('❌ Erreur dans getUserLearningAnalytics:', error);
      return null;
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
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération recommandations:', error);
      return [];
    }
  },

  async generatePersonalizedRecommendations(userId: string) {
    try {
      const analytics = await this.getUserLearningAnalytics(userId);
      if (!analytics) return [];

      const recommendations = [];
      
      if (analytics.completionRate < 50) {
        recommendations.push({
          type: 'motivation',
          title: 'Restez motivé !',
          message: 'Continuez vos efforts, vous êtes sur la bonne voie !',
          priority: 2
        });
      }

      if (analytics.preferredCategories.length > 0) {
        recommendations.push({
          type: 'course_suggestion',
          title: 'Nouveaux cours disponibles',
          message: `Découvrez nos derniers cours en ${analytics.preferredCategories[0]}`,
          priority: 1
        });
      }

      for (const rec of recommendations) {
        await supabase
          .from('ai_recommendations')
          .insert({
            user_id: userId,
            recommendation_type: rec.type,
            recommendation_data: rec,
            priority: rec.priority
          });
      }

      return recommendations;
    } catch (error) {
      console.error('❌ Erreur génération recommandations:', error);
      return [];
    }
  },

  async getUserConversations(userId: string) {
    try {
      const { data, error } = await supabase
        .from('ai_assistant_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération conversations:', error);
      return [];
    }
  },

  async createAIConversation(userId: string, courseId?: string, lessonId?: string) {
    try {
      const { data, error } = await supabase
        .from('ai_assistant_conversations')
        .insert({
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          conversation_data: [],
          conversation_type: 'learning_assistance'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Erreur création conversation:', error);
      throw error;
    }
  },

  async addMessageToConversation(conversationId: string, message: any) {
    try {
      const { data: conversation } = await supabase
        .from('ai_assistant_conversations')
        .select('conversation_data')
        .eq('id', conversationId)
        .single();

      if (!conversation) throw new Error('Conversation non trouvée');

      const updatedData = [...(conversation.conversation_data || []), message];

      const { error } = await supabase
        .from('ai_assistant_conversations')
        .update({
          conversation_data: updatedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) throw error;
      return updatedData;
    } catch (error) {
      console.error('❌ Erreur ajout message:', error);
      throw error;
    }
  },

  async markRecommendationAsRead(recommendationId: string) {
    try {
      const { error } = await supabase
        .from('ai_recommendations')
        .update({ is_read: true })
        .eq('id', recommendationId);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Erreur marquage recommandation:', error);
    }
  },

  calculateAverageSessionTime(analytics: any[]) {
    const sessions = analytics.filter(a => a.session_data?.duration);
    if (sessions.length === 0) return 45;
    
    const totalTime = sessions.reduce((sum, session) => sum + (session.session_data.duration || 0), 0);
    return Math.round(totalTime / sessions.length);
  },

  extractPreferredCategories(analytics: any[]) {
    const categories = analytics
      .filter(a => a.session_data?.category)
      .map(a => a.session_data.category);
    
    const categoryCounts = categories.reduce((counts, category) => {
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {});

    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([category]) => category);
  },

  analyzeStudyPatterns(analytics: any[]) {
    const sessions = analytics.filter(a => a.action_type === 'session_start');
    
    if (sessions.length === 0) {
      return {
        preferredTime: 'morning',
        averageFrequency: 'weekly',
        consistency: 'moderate'
      };
    }

    const hours = sessions.map(s => new Date(s.timestamp).getHours());
    const averageHour = hours.reduce((sum, hour) => sum + hour, 0) / hours.length;
    
    let preferredTime = 'morning';
    if (averageHour >= 12 && averageHour < 18) preferredTime = 'afternoon';
    else if (averageHour >= 18) preferredTime = 'evening';

    return {
      preferredTime,
      averageFrequency: sessions.length > 10 ? 'daily' : sessions.length > 3 ? 'weekly' : 'monthly',
      consistency: sessions.length > 15 ? 'high' : sessions.length > 5 ? 'moderate' : 'low'
    };
  },

  async getOptimalCourseTemplate(category: string, difficulty: string): Promise<CourseTemplate | null> {
    try {
      const { data: template, error } = await supabase
        .from('course_templates')
        .select('*')
        .eq('category', category)
        .eq('difficulty_level', difficulty)
        .eq('is_active', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erreur récupération template:', error);
        return null;
      }

      if (!template) {
        return {
          id: 'default',
          name: `Template ${difficulty} pour ${category}`,
          description: `Template optimisé pour les cours de ${category} niveau ${difficulty}`,
          category,
          difficulty_level: difficulty,
          template_structure: {
            lessons_count: difficulty === 'beginner' ? 8 : difficulty === 'intermediate' ? 10 : 12,
            lesson_duration: difficulty === 'beginner' ? 45 : difficulty === 'intermediate' ? 60 : 75,
            assessment_questions: 20,
            practical_exercises: true,
            case_studies: difficulty !== 'beginner'
          }
        };
      }

      return template;
    } catch (error) {
      console.error('❌ Erreur dans getOptimalCourseTemplate:', error);
      return null;
    }
  },

  async trackLearningProgress(userId: string, courseId: string, action: string, data: any = {}) {
    try {
      await supabase
        .from('learning_analytics')
        .insert({
          user_id: userId,
          course_id: courseId,
          action_type: action,
          session_data: data,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('❌ Erreur tracking:', error);
    }
  }
};

export default enhancedAIService;
