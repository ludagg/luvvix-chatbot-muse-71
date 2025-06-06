
import { supabase } from '@/integrations/supabase/client';

export interface Assessment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  questions: Question[];
  total_questions: number;
  passing_score: number;
  time_limit_minutes: number;
  ai_generated: boolean;
}

export interface Question {
  id: string;
  question: string;
  options?: string[];
  correct_answer: number;
  explanation: string;
  category: string;
  difficulty: string;
  points: number;
  type: string;
}

export interface AssessmentAttempt {
  id: string;
  user_id: string;
  assessment_id: string;
  course_id: string;
  answers: any[];
  score: number;
  max_score: number;
  percentage: number;
  status: string;
  submitted_at: string;
  passed: boolean;
  ai_feedback?: any;
}

const assessmentService = {
  async generateAssessment(courseId: string, questionCount: number = 20) {
    try {
      console.log(`🎓 Génération d'évaluation pour le cours ${courseId} avec ${questionCount} questions`);
      
      const { data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      const { data: lessons } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('lesson_order');

      if (!course || !lessons) {
        throw new Error('Cours ou leçons non trouvés');
      }

      const { data: existingAssessment } = await supabase
        .from('course_assessments')
        .select('id')
        .eq('course_id', courseId)
        .maybeSingle();

      if (existingAssessment) {
        console.log('✅ Évaluation déjà existante');
        return existingAssessment;
      }

      const { data, error } = await supabase.functions.invoke('ai-quiz-generator', {
        body: { 
          course: {
            title: course.title,
            description: course.description,
            category: course.category,
            difficulty: course.difficulty_level,
            objectives: course.learning_objectives
          },
          lessons: lessons.map(l => ({
            title: l.title,
            content: l.content.substring(0, 1000)
          })),
          questionCount
        }
      });

      if (error) {
        console.error('❌ Erreur génération quiz IA:', error);
        throw error;
      }

      const { data: assessment, error: saveError } = await supabase
        .from('course_assessments')
        .insert({
          course_id: courseId,
          title: `Évaluation finale - ${course.title}`,
          description: 'Examen final pour valider la maîtrise du cours',
          questions: data.questions,
          total_questions: questionCount,
          passing_score: 70,
          time_limit_minutes: questionCount * 2,
          ai_generated: true
        })
        .select()
        .single();

      if (saveError) {
        console.error('❌ Erreur sauvegarde évaluation:', saveError);
        throw saveError;
      }

      console.log('✅ Évaluation générée et sauvegardée');
      return assessment;
    } catch (error) {
      console.error('❌ Erreur dans generateAssessment:', error);
      throw error;
    }
  },

  async getCourseAssessment(courseId: string) {
    try {
      const { data, error } = await supabase
        .from('course_assessments')
        .select('*')
        .eq('course_id', courseId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur récupération évaluation:', error);
      return null;
    }
  },

  async canTakeAssessment(userId: string, courseId: string) {
    try {
      const { data } = await supabase.rpc('can_take_assessment', {
        user_uuid: userId,
        course_uuid: courseId
      });
      return data;
    } catch (error) {
      console.error('❌ Erreur vérification éligibilité:', error);
      return true;
    }
  },

  async getUserAttempts(userId: string, courseId: string) {
    try {
      const { data, error } = await supabase
        .from('assessment_attempts')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération tentatives:', error);
      return [];
    }
  },

  async startAssessment(userId: string, assessmentId: string, courseId: string) {
    try {
      console.log('📝 Démarrage d\'évaluation:', { userId, assessmentId, courseId });
      return { 
        id: `attempt_${Date.now()}`,
        user_id: userId,
        assessment_id: assessmentId,
        course_id: courseId,
        answers: [],
        score: 0,
        max_score: 0,
        percentage: 0,
        status: 'in_progress',
        submitted_at: '',
        passed: false,
        startTime: new Date().toISOString() 
      };
    } catch (error) {
      console.error('❌ Erreur démarrage évaluation:', error);
      throw error;
    }
  },

  async saveAnswers(attemptId: string, answers: any[]) {
    try {
      console.log('💾 Sauvegarde réponses temporaire');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur sauvegarde réponses:', error);
      throw error;
    }
  },

  async submitAssessment(attemptId: string) {
    try {
      console.log('📝 Soumission d\'évaluation:', { attemptId });

      // Simuler une soumission d'évaluation
      const mockResult = {
        id: attemptId,
        user_id: 'mock_user',
        assessment_id: 'mock_assessment',
        course_id: 'mock_course',
        answers: [],
        score: 75,
        max_score: 100,
        percentage: 75,
        status: 'completed',
        submitted_at: new Date().toISOString(),
        passed: true,
        ai_feedback: {
          questions: [
            {
              score: 5,
              max_score: 5,
              feedback: "Excellente réponse !"
            }
          ]
        }
      };

      return mockResult;
    } catch (error) {
      console.error('❌ Erreur soumission évaluation:', error);
      throw error;
    }
  },

  calculateScore(answers: any[], questions: any[]) {
    let totalScore = 0;
    
    answers.forEach((answer, index) => {
      const question = questions[index];
      if (question && answer.selected_option === question.correct_answer) {
        totalScore += question.points || 5;
      }
    });
    
    return totalScore;
  },

  async getUserAssessmentAttempts(userId: string, courseId?: string) {
    try {
      let query = supabase
        .from('assessment_attempts')
        .select(`
          *,
          course_assessments (title, total_questions, passing_score),
          courses (title, category)
        `)
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération tentatives:', error);
      return [];
    }
  },

  async getBestScore(userId: string, courseId: string) {
    try {
      const { data, error } = await supabase
        .from('assessment_attempts')
        .select('percentage')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .order('percentage', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data?.percentage || null;
    } catch (error) {
      console.error('❌ Erreur récupération meilleur score:', error);
      return null;
    }
  }
};

export default assessmentService;
