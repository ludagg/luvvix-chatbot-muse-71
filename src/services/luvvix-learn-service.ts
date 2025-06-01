
import { supabase } from '@/integrations/supabase/client';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  learning_objectives: string[];
  prerequisites: string[];
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  ai_generated: boolean;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  lesson_order: number;
  duration_minutes: number;
  lesson_type: 'theory' | 'practice' | 'quiz' | 'project';
}

export interface Quiz {
  id: string;
  lesson_id: string;
  title: string;
  questions: any[];
  passing_score: number;
  max_attempts: number;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at?: string;
  progress_percentage: number;
  current_lesson_id?: string;
  ai_recommendations: any;
}

export const luvvixLearnService = {
  // Gestion des cours
  async getCourses(category?: string, difficulty?: string) {
    let query = supabase
      .from('courses')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (category && category !== 'Tous') {
      query = query.eq('category', category);
    }

    if (difficulty && difficulty !== 'Tous') {
      query = query.eq('difficulty_level', difficulty);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getCourse(courseId: string) {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) throw error;
    return data;
  },

  async getCourseLessons(courseId: string) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('lesson_order');

    if (error) throw error;
    return data;
  },

  async getLessonQuiz(lessonId: string) {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Gestion des inscriptions
  async enrollInCourse(courseId: string, userId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        progress_percentage: 0
      })
      .select()
      .single();

    if (error) throw error;

    // Enregistrer l'activité
    await this.trackActivity(userId, courseId, 'course_enrollment');
    
    return data;
  },

  async getUserEnrollments(userId: string) {
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        courses (*)
      `)
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateProgress(enrollmentId: string, progressPercentage: number, currentLessonId?: string) {
    const updateData: any = { progress_percentage: progressPercentage };
    if (currentLessonId) {
      updateData.current_lesson_id = currentLessonId;
    }
    if (progressPercentage >= 100) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('enrollments')
      .update(updateData)
      .eq('id', enrollmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Gestion des quiz
  async submitQuizResult(userId: string, quizId: string, score: number, answers: any[], attemptNumber: number = 1) {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        score: score,
        answers: answers,
        attempt_number: attemptNumber
      })
      .select()
      .single();

    if (error) throw error;

    // Enregistrer l'activité
    await this.trackActivity(userId, null, 'quiz_completion', { quiz_id: quizId, score });

    return data;
  },

  async getUserQuizResults(userId: string, quizId?: string) {
    let query = supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId);

    if (quizId) {
      query = query.eq('quiz_id', quizId);
    }

    const { data, error } = await query.order('completed_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Certificats
  async getUserCertificates(userId: string) {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        courses (title, category)
      `)
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async generateCertificate(userId: string, courseId: string) {
    const { data, error } = await supabase.functions.invoke('ai-certificate-generator', {
      body: { userId, courseId }
    });

    if (error) throw error;
    return data;
  },

  // Parcours d'apprentissage
  async getUserLearningPaths(userId: string) {
    const { data, error } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async generateAdaptivePath(userId: string) {
    const { data, error } = await supabase.functions.invoke('ai-course-manager', {
      body: { 
        action: 'generate_adaptive_path',
        userId 
      }
    });

    if (error) throw error;
    return data;
  },

  // Analytics et suivi
  async trackActivity(userId: string, courseId: string | null, actionType: string, sessionData: any = {}) {
    const { error } = await supabase
      .from('learning_analytics')
      .insert({
        user_id: userId,
        course_id: courseId,
        action_type: actionType,
        session_data: sessionData
      });

    if (error) console.error('Erreur tracking:', error);
  },

  async getUserAnalytics(userId: string) {
    const { data, error } = await supabase
      .from('learning_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  },

  // IA Assistant
  async chatWithAI(userId: string, message: string, context?: string) {
    const { data, error } = await supabase.functions.invoke('ai-learning-assistant', {
      body: { 
        message,
        userId,
        context
      }
    });

    if (error) throw error;
    return data;
  },

  // Génération de cours
  async generateCourse(topic: string, category: string, difficulty: string) {
    const { data, error } = await supabase.functions.invoke('ai-course-manager', {
      body: { 
        action: 'generate_course',
        courseData: { topic },
        category,
        difficulty
      }
    });

    if (error) throw error;
    return data;
  },

  // Auto-amélioration des cours
  async triggerCourseAnalysis() {
    const { data, error } = await supabase.functions.invoke('ai-course-manager', {
      body: { action: 'auto_update_courses' }
    });

    if (error) throw error;
    return data;
  }
};

export default luvvixLearnService;
