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
  final_quiz_id?: string;
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
    try {
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
      if (error) {
        console.error('Erreur récupération cours:', error);
        throw error;
      }
      
      console.log('📚 Cours récupérés:', data?.length || 0, 'cours trouvés');
      return data || [];
    } catch (error) {
      console.error('Erreur getCourses:', error);
      return [];
    }
  },

  async getCourse(courseId: string) {
    try {
      console.log('🔍 Récupération cours ID:', courseId);
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        console.error('❌ Erreur récupération cours:', error);
        throw error;
      }
      
      console.log('✅ Cours récupéré:', data?.title);
      return data;
    } catch (error) {
      console.error('❌ Erreur dans getCourse:', error);
      throw error;
    }
  },

  async getCourseLessons(courseId: string) {
    try {
      console.log('🔍 Récupération des leçons pour le cours:', courseId);
      
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('lesson_order');

      if (lessonsError) {
        console.error('❌ Erreur récupération leçons:', lessonsError);
        throw lessonsError;
      }
      
      console.log('📖 Leçons récupérées:', lessons?.length || 0, 'leçons');
      
      return lessons || [];
    } catch (error) {
      console.error('❌ Erreur dans getCourseLessons:', error);
      return [];
    }
  },

  async generateFinalQuiz(courseId: string, questionCount: number = 50) {
    try {
      console.log(`🧩 Génération du quiz final avec ${questionCount} questions pour le cours:`, courseId);
      
      // Utiliser le nouveau service d'évaluation au lieu de l'ancien système
      const assessmentService = await import('./assessment-service');
      const assessment = await assessmentService.default.generateAssessment(courseId, questionCount);
      
      console.log('✅ Évaluation complète créée avec succès');
      return assessment;
    } catch (error) {
      console.error('❌ Erreur dans generateFinalQuiz:', error);
      throw error;
    }
  },

  async generateIntelligentQuiz(course: Course, lessons: Lesson[], questionCount: number) {
    try {
      console.log('🧠 Génération intelligente du quiz avec l\'IA...');
      
      // Préparer le contenu des leçons pour l'IA
      const lessonsContent = lessons.map(lesson => ({
        title: lesson.title,
        content: lesson.content.substring(0, 1000) // Limiter pour l'IA
      }));

      const { data, error } = await supabase.functions.invoke('ai-quiz-generator', {
        body: { 
          course: {
            title: course.title,
            description: course.description,
            category: course.category,
            difficulty: course.difficulty_level,
            objectives: course.learning_objectives
          },
          lessons: lessonsContent,
          questionCount: questionCount
        }
      });

      if (error) {
        console.error('❌ Erreur génération quiz IA:', error);
        throw error;
      }
      
      console.log('✅ Quiz généré par l\'IA');
      return data;
    } catch (error) {
      console.error('❌ Erreur dans generateIntelligentQuiz:', error);
      // Fallback vers la génération basique
      return this.generateBasicQuiz(course, questionCount);
    }
  },

  generateBasicQuiz(course: Course, questionCount: number) {
    console.log('📝 Génération basique du quiz...');
    
    const categories = [
      'Concepts fondamentaux',
      'Applications pratiques', 
      'Meilleures pratiques',
      'Résolution de problèmes',
      'Analyse et synthèse'
    ];

    const questions = [];
    const questionsPerCategory = Math.floor(questionCount / categories.length);
    
    categories.forEach((category, categoryIndex) => {
      const questionsInCategory = categoryIndex === categories.length - 1 
        ? questionCount - questions.length 
        : questionsPerCategory;

      for (let i = 0; i < questionsInCategory; i++) {
        questions.push({
          id: `q_${questions.length + 1}`,
          question: `Question ${questions.length + 1}: ${category} - Dans le contexte de ${course.title}, quel est l'élément le plus important concernant ${category.toLowerCase()}?`,
          options: [
            `L'aspect principal de ${category.toLowerCase()} dans ${course.title}`,
            `Une approche alternative de ${category.toLowerCase()}`,
            `Un élément secondaire à considérer`,
            `Une considération moins importante`
          ],
          correct_answer: 0,
          explanation: `Dans le contexte de ${course.title}, ${category.toLowerCase()} est effectivement l'aspect le plus crucial à maîtriser pour une compréhension complète du sujet.`,
          category: category,
          difficulty: course.difficulty_level,
          points: 2
        });
      }
    });

    return { questions };
  },

  async enrollInCourse(courseId: string, userId: string) {
    try {
      console.log('🎯 Tentative d\'inscription:', { courseId, userId });
      
      // Vérifier si l'utilisateur est déjà inscrit
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Erreur vérification inscription:', checkError);
        throw checkError;
      }

      if (existingEnrollment) {
        console.log('⚠️ Utilisateur déjà inscrit');
        throw new Error('Vous êtes déjà inscrit à ce cours');
      }

      // Créer la nouvelle inscription
      const { data, error } = await supabase
        .from('enrollments')
        .insert({
          user_id: userId,
          course_id: courseId,
          progress_percentage: 0,
          enrolled_at: new Date().toISOString(),
          ai_recommendations: {}
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur inscription:', error);
        if (error.code === '23505') {
          throw new Error('Vous êtes déjà inscrit à ce cours');
        }
        throw error;
      }

      console.log('✅ Inscription réussie:', data);
      await this.trackActivity(userId, courseId, 'course_enrollment');
      
      // Générer automatiquement l'évaluation pour le cours si elle n'existe pas
      try {
        const assessmentService = await import('./assessment-service');
        const existingAssessment = await assessmentService.default.getCourseAssessment(courseId);
        
        if (!existingAssessment) {
          console.log('🎓 Génération automatique de l\'évaluation...');
          await assessmentService.default.generateAssessment(courseId, 40);
        }
      } catch (assessmentError) {
        console.warn('⚠️ Erreur génération évaluation automatique:', assessmentError);
        // Ne pas empêcher l'inscription si l'évaluation échoue
      }
      
      return data;
    } catch (error) {
      console.error('❌ Erreur dans enrollInCourse:', error);
      throw error;
    }
  },

  async getUserEnrollments(userId: string) {
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', userId)
        .order('enrolled_at', { ascending: false });

      if (error) {
        console.error('Erreur récupération inscriptions:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Erreur getUserEnrollments:', error);
      return [];
    }
  },

  async updateProgress(enrollmentId: string, progressPercentage: number, currentLessonId?: string) {
    const updateData: any = { 
      progress_percentage: progressPercentage,
      updated_at: new Date().toISOString()
    };
    
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

    if (error) {
      console.error('Erreur mise à jour progression:', error);
      throw error;
    }
    return data;
  },

  async submitQuizResult(userId: string, quizId: string, score: number, answers: any[], attemptNumber: number = 1) {
    const { data, error } = await supabase
      .from('quiz_results')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        score: score,
        answers: answers,
        attempt_number: attemptNumber,
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur soumission quiz:', error);
      throw error;
    }

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
    if (error) {
      console.error('Erreur récupération résultats quiz:', error);
      throw error;
    }
    return data || [];
  },

  async getUserCertificates(userId: string) {
    const { data, error } = await supabase
      .from('certificates')
      .select(`
        *,
        courses (title, category)
      `)
      .eq('user_id', userId)
      .order('issued_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération certificats:', error);
      throw error;
    }
    return data || [];
  },

  async generateCertificate(userId: string, courseId: string) {
    try {
      // Récupérer le score du quiz final
      const { data: course } = await supabase
        .from('courses')
        .select('*, final_quiz_id')
        .eq('id', courseId)
        .single();

      let finalScore = 75; // Score par défaut
      let mention = 'Assez Bien';

      if (course.final_quiz_id) {
        const quizResults = await this.getUserQuizResults(userId, course.final_quiz_id);
        if (quizResults.length > 0) {
          finalScore = Math.max(...quizResults.map(r => r.score));
        }
      }

      // Déterminer la mention
      if (finalScore >= 16) mention = 'Très Bien';
      else if (finalScore >= 14) mention = 'Bien';
      else if (finalScore >= 12) mention = 'Assez Bien';
      else if (finalScore >= 10) mention = 'Passable';
      else mention = 'Insuffisant';

      // Récupérer le profil utilisateur
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      const certificateData = {
        student_name: userProfile?.full_name || 'Étudiant',
        course_title: course.title,
        course_category: course.category,
        score: finalScore,
        mention: mention,
        issued_date: new Date().toISOString(),
        signed_by: 'Ludovic Aggaï',
        signed_title: 'Fondateur & Directeur, LuvviX Learn'
      };

      const { data, error } = await supabase
        .from('certificates')
        .insert({
          user_id: userId,
          course_id: courseId,
          certificate_data: certificateData,
          issued_at: new Date().toISOString(),
          verification_code: `LUV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur génération certificat:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur generateCertificate:', error);
      throw error;
    }
  },

  async trackActivity(userId: string, courseId: string | null, actionType: string, sessionData: any = {}) {
    try {
      const { error } = await supabase
        .from('learning_analytics')
        .insert({
          user_id: userId,
          course_id: courseId,
          action_type: actionType,
          session_data: sessionData,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Erreur tracking:', error);
      }
    } catch (error) {
      console.error('Erreur dans trackActivity:', error);
    }
  },

  async getUserAnalytics(userId: string) {
    const { data, error } = await supabase
      .from('learning_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Erreur récupération analytics:', error);
      throw error;
    }
    return data || [];
  },

  async generateCourse(topic: string, category: string, difficulty: string) {
    try {
      console.log('🚀 Début de génération de cours avec Gemini:', { topic, category, difficulty });
      
      const { data, error } = await supabase.functions.invoke('ai-course-manager', {
        body: { 
          action: 'generate_complete_course',
          courseData: { 
            topic,
            category,
            difficulty,
            include_lessons: true,
            include_quizzes: false // Pas de quiz dans les leçons
          }
        }
      });

      if (error) {
        console.error('❌ Erreur génération cours:', error);
        throw error;
      }
      
      console.log('✅ Cours généré avec succès:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur dans generateCourse:', error);
      throw error;
    }
  },

  async getLessonQuiz(lessonId: string) {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (error) {
        console.error('Erreur récupération quiz:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Erreur getLessonQuiz:', error);
      return null;
    }
  },

  async chatWithAI(userId: string, message: string, type: string = "general") {
    try {
      console.log('🤖 Chat avec IA:', { userId, message, type });
      
      const { data, error } = await supabase.functions.invoke('ai-learning-assistant', {
        body: { 
          userId,
          message,
          type,
          context: 'learning_assistant'
        }
      });

      if (error) {
        console.error('❌ Erreur chat IA:', error);
        throw error;
      }
      
      console.log('✅ Réponse IA reçue');
      return data;
    } catch (error) {
      console.error('❌ Erreur dans chatWithAI:', error);
      throw error;
    }
  },

  async createLessonsForCourse(courseId: string, lessonsData: any[]) {
    try {
      console.log('📖 Création de leçons pour le cours:', courseId);
      
      const lessons = lessonsData.map((lesson, index) => ({
        course_id: courseId,
        title: lesson.title,
        content: lesson.content,
        lesson_order: index + 1,
        duration_minutes: lesson.duration || 30,
        lesson_type: lesson.type || 'theory'
      }));

      const { data, error } = await supabase
        .from('lessons')
        .insert(lessons)
        .select();

      if (error) {
        console.error('❌ Erreur création leçons:', error);
        throw error;
      }

      console.log('✅ Leçons créées:', data.length);
      return data;
    } catch (error) {
      console.error('❌ Erreur dans createLessonsForCourse:', error);
      throw error;
    }
  },

  async getUserLearningPaths(userId: string) {
    try {
      console.log('🛤️ Récupération des parcours d\'apprentissage:', userId);
      
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur récupération parcours:', error);
        throw error;
      }
      
      console.log('✅ Parcours récupérés:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Erreur dans getUserLearningPaths:', error);
      return [];
    }
  },

  async generateAdaptivePath(userId: string) {
    try {
      console.log('🎯 Génération de parcours adaptatif pour:', userId);
      
      // Récupérer les données utilisateur pour personnaliser
      const [enrollments, analytics] = await Promise.all([
        this.getUserEnrollments(userId),
        this.getUserAnalytics(userId)
      ]);

      // Créer un parcours adaptatif basique
      const pathData = {
        user_id: userId,
        name: 'Parcours Personnalisé IA',
        description: 'Parcours d\'apprentissage généré automatiquement par LuvviX AI',
        course_sequence: [],
        ai_personalization: {
          generated_at: new Date().toISOString(),
          user_preferences: {},
          difficulty_level: 'intermediate',
          focus_areas: ['practical', 'theory']
        }
      };

      const { data, error } = await supabase
        .from('learning_paths')
        .insert(pathData)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur génération parcours adaptatif:', error);
        throw error;
      }

      console.log('✅ Parcours adaptatif généré');
      return data;
    } catch (error) {
      console.error('❌ Erreur dans generateAdaptivePath:', error);
      throw error;
    }
  },

  // Nouvelle méthode pour vérifier si un cours est terminé
  async isCourseCompleted(userId: string, courseId: string): Promise<boolean> {
    try {
      const assessmentService = await import('./assessment-service');
      const bestScore = await assessmentService.default.getBestScore(userId, courseId);
      
      return bestScore !== null && bestScore >= 70;
    } catch (error) {
      console.error('Erreur vérification completion cours:', error);
      return false;
    }
  },

  // Nouvelle méthode pour obtenir les cours terminés
  async getCompletedCourses(userId: string) {
    try {
      const enrollments = await this.getUserEnrollments(userId);
      const completedCourses = [];

      for (const enrollment of enrollments) {
        const isCompleted = await this.isCourseCompleted(userId, enrollment.course_id);
        if (isCompleted) {
          completedCourses.push({
            ...enrollment,
            completed: true
          });
        }
      }

      return completedCourses;
    } catch (error) {
      console.error('Erreur récupération cours terminés:', error);
      return [];
    }
  }
};

export default luvvixLearnService;
