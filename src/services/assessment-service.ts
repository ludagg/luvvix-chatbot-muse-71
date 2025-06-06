
import { supabase } from '@/integrations/supabase/client';

export interface Assessment {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  total_questions: number;
  passing_score: number;
  time_limit_minutes: number;
  question_types: any;
  questions: Question[];
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  type: 'mcq' | 'open';
  question: string;
  options?: string[];
  correct_answer?: number | string;
  points: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface AssessmentAttempt {
  id: string;
  user_id: string;
  assessment_id: string;
  course_id: string;
  answers: any[];
  score?: number;
  max_score?: number;
  percentage?: number;
  ai_feedback: any;
  started_at: string;
  submitted_at?: string;
  graded_at?: string;
  status: 'in_progress' | 'submitted' | 'graded';
  attempt_number: number;
}

export const assessmentService = {
  // Vérifier si un utilisateur peut passer un examen
  async canTakeAssessment(userId: string, courseId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('can_take_assessment', {
        user_uuid: userId,
        course_uuid: courseId
      });

      if (error) {
        console.error('Erreur vérification permission examen:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Erreur dans canTakeAssessment:', error);
      return false;
    }
  },

  // Générer un examen pour un cours
  async generateAssessment(courseId: string, questionCount: number = 40): Promise<Assessment> {
    try {
      console.log('🎓 Génération d\'examen pour le cours:', courseId);

      // Récupérer le cours et ses leçons
      const [courseResponse, lessonsResponse] = await Promise.all([
        supabase.from('courses').select('*').eq('id', courseId).single(),
        supabase.from('lessons').select('*').eq('course_id', courseId).order('lesson_order')
      ]);

      if (courseResponse.error) throw courseResponse.error;
      if (lessonsResponse.error) throw lessonsResponse.error;

      const course = courseResponse.data;
      const lessons = lessonsResponse.data || [];

      // Générer les questions avec l'IA
      const questions = await this.generateQuestionsWithAI(course, lessons, questionCount);

      // Créer l'évaluation
      const assessmentData = {
        course_id: courseId,
        title: `Examen Final - ${course.title}`,
        description: `Évaluation complète du cours ${course.title} comprenant ${questionCount} questions`,
        total_questions: questions.length,
        passing_score: 70,
        time_limit_minutes: Math.max(60, Math.floor(questions.length * 1.5)),
        question_types: { mcq: true, open: true },
        questions: questions,
        ai_generated: true
      };

      const { data: assessment, error: assessmentError } = await supabase
        .from('course_assessments')
        .insert(assessmentData)
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      console.log('✅ Examen généré avec succès:', assessment.id);
      return assessment;
    } catch (error) {
      console.error('❌ Erreur génération examen:', error);
      throw error;
    }
  },

  // Générer questions avec IA
  async generateQuestionsWithAI(course: any, lessons: any[], questionCount: number): Promise<Question[]> {
    try {
      console.log('🧠 Génération de questions avec IA...');

      const { data, error } = await supabase.functions.invoke('ai-quiz-generator', {
        body: {
          course: {
            title: course.title,
            description: course.description,
            category: course.category,
            difficulty: course.difficulty_level,
            objectives: course.learning_objectives
          },
          lessons: lessons.map(lesson => ({
            title: lesson.title,
            content: lesson.content.substring(0, 2000)
          })),
          questionCount: questionCount,
          questionTypes: ['mcq', 'open'],
          comprehensive: true
        }
      });

      if (error) throw error;

      return data.questions || [];
    } catch (error) {
      console.error('❌ Erreur génération questions IA:', error);
      return this.generateFallbackQuestions(course, questionCount);
    }
  },

  // Questions de secours si l'IA échoue
  generateFallbackQuestions(course: any, questionCount: number): Question[] {
    const questions: Question[] = [];
    const topics = [
      'Concepts fondamentaux',
      'Applications pratiques',
      'Théorie avancée',
      'Cas d\'usage',
      'Meilleures pratiques'
    ];

    const mcqCount = Math.floor(questionCount * 0.7);
    const openCount = questionCount - mcqCount;

    // Générer des QCM
    for (let i = 0; i < mcqCount; i++) {
      const topic = topics[i % topics.length];
      questions.push({
        id: `mcq_${i + 1}`,
        type: 'mcq',
        question: `Question ${i + 1}: Dans le contexte de ${course.title}, quelle est la meilleure approche concernant ${topic.toLowerCase()}?`,
        options: [
          `Approche recommandée pour ${topic.toLowerCase()}`,
          `Alternative viable mais moins optimale`,
          `Méthode traditionnelle standard`,
          `Solution peu recommandée`
        ],
        correct_answer: 0,
        points: 2,
        explanation: `La première option représente l'approche la plus recommandée en ${course.title}.`,
        difficulty: 'medium',
        category: topic
      });
    }

    // Générer des questions ouvertes
    for (let i = 0; i < openCount; i++) {
      const topic = topics[i % topics.length];
      questions.push({
        id: `open_${i + 1}`,
        type: 'open',
        question: `Expliquez en détail comment ${topic.toLowerCase()} s'applique dans ${course.title} et donnez un exemple concret.`,
        points: 5,
        difficulty: 'hard',
        category: topic
      });
    }

    return questions;
  },

  // Récupérer l'examen d'un cours
  async getCourseAssessment(courseId: string): Promise<Assessment | null> {
    try {
      const { data, error } = await supabase
        .from('course_assessments')
        .select('*')
        .eq('course_id', courseId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération examen:', error);
      return null;
    }
  },

  // Démarrer une tentative d'examen
  async startAssessment(userId: string, assessmentId: string, courseId: string): Promise<AssessmentAttempt> {
    try {
      console.log('🚀 Démarrage de l\'examen:', { userId, assessmentId, courseId });

      // Vérifier si l'utilisateur peut passer l'examen
      const canTake = await this.canTakeAssessment(userId, courseId);
      if (!canTake) {
        throw new Error('Vous avez déjà passé l\'examen cette semaine. Veuillez attendre la semaine prochaine.');
      }

      // Enregistrer la tentative
      await supabase.rpc('record_assessment_attempt', {
        user_uuid: userId,
        course_uuid: courseId
      });

      // Compter les tentatives précédentes
      const { data: previousAttempts } = await supabase
        .from('assessment_attempts')
        .select('attempt_number')
        .eq('user_id', userId)
        .eq('assessment_id', assessmentId)
        .order('attempt_number', { ascending: false })
        .limit(1);

      const attemptNumber = previousAttempts?.length > 0 ? previousAttempts[0].attempt_number + 1 : 1;

      // Créer la nouvelle tentative
      const { data: attempt, error } = await supabase
        .from('assessment_attempts')
        .insert({
          user_id: userId,
          assessment_id: assessmentId,
          course_id: courseId,
          answers: [],
          status: 'in_progress',
          attempt_number: attemptNumber
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Tentative d\'examen démarrée');
      return attempt;
    } catch (error) {
      console.error('❌ Erreur démarrage examen:', error);
      throw error;
    }
  },

  // Sauvegarder les réponses
  async saveAnswers(attemptId: string, answers: any[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('assessment_attempts')
        .update({ answers })
        .eq('id', attemptId);

      if (error) throw error;
      console.log('💾 Réponses sauvegardées');
    } catch (error) {
      console.error('❌ Erreur sauvegarde réponses:', error);
      throw error;
    }
  },

  // Soumettre l'examen
  async submitAssessment(attemptId: string): Promise<AssessmentAttempt> {
    try {
      console.log('📤 Soumission de l\'examen:', attemptId);

      // Marquer comme soumis
      const { data: attempt, error } = await supabase
        .from('assessment_attempts')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;

      // Déclencher la correction automatique
      await this.gradeAssessment(attemptId);

      console.log('✅ Examen soumis et corrigé');
      return attempt;
    } catch (error) {
      console.error('❌ Erreur soumission examen:', error);
      throw error;
    }
  },

  // Corriger automatiquement l'examen
  async gradeAssessment(attemptId: string): Promise<void> {
    try {
      console.log('🎯 Correction automatique de l\'examen:', attemptId);

      // Récupérer la tentative et l'examen
      const { data: attempt, error: attemptError } = await supabase
        .from('assessment_attempts')
        .select('*, course_assessments(*)')
        .eq('id', attemptId)
        .single();

      if (attemptError) throw attemptError;

      const assessment = attempt.course_assessments;
      const answers = attempt.answers || [];
      let totalScore = 0;
      let maxScore = 0;
      const feedback: any = { questions: [] };

      // Corriger chaque question
      for (let i = 0; i < assessment.questions.length; i++) {
        const question = assessment.questions[i];
        const userAnswer = answers[i];
        maxScore += question.points;

        let questionScore = 0;
        let questionFeedback = '';

        if (question.type === 'mcq') {
          if (userAnswer?.selected === question.correct_answer) {
            questionScore = question.points;
            questionFeedback = 'Réponse correcte ! ' + (question.explanation || '');
          } else {
            questionFeedback = `Réponse incorrecte. La bonne réponse était: ${question.options[question.correct_answer]}. ${question.explanation || ''}`;
          }
        } else if (question.type === 'open') {
          // Pour les questions ouvertes, utiliser l'IA pour évaluer
          questionScore = await this.gradeOpenQuestion(question, userAnswer?.text || '');
          questionFeedback = await this.generateOpenQuestionFeedback(question, userAnswer?.text || '', questionScore);
        }

        totalScore += questionScore;
        feedback.questions.push({
          question_id: question.id,
          score: questionScore,
          max_score: question.points,
          feedback: questionFeedback
        });
      }

      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

      // Mettre à jour la tentative avec les résultats
      const { error: updateError } = await supabase
        .from('assessment_attempts')
        .update({
          score: totalScore,
          max_score: maxScore,
          percentage: percentage,
          ai_feedback: feedback,
          status: 'graded',
          graded_at: new Date().toISOString()
        })
        .eq('id', attemptId);

      if (updateError) throw updateError;

      console.log('✅ Correction terminée:', { totalScore, maxScore, percentage });
    } catch (error) {
      console.error('❌ Erreur correction examen:', error);
      throw error;
    }
  },

  // Évaluer une question ouverte avec l'IA
  async gradeOpenQuestion(question: Question, userAnswer: string): Promise<number> {
    try {
      if (!userAnswer.trim()) return 0;

      const { data, error } = await supabase.functions.invoke('ai-learning-assistant', {
        body: {
          action: 'grade_open_question',
          question: question.question,
          expected_points: question.points,
          user_answer: userAnswer,
          context: question.category
        }
      });

      if (error) throw error;

      return Math.min(data.score || 0, question.points);
    } catch (error) {
      console.error('Erreur évaluation question ouverte:', error);
      // Score par défaut basé sur la longueur de la réponse
      const wordCount = userAnswer.trim().split(/\s+/).length;
      if (wordCount >= 50) return Math.floor(question.points * 0.7);
      if (wordCount >= 20) return Math.floor(question.points * 0.5);
      if (wordCount >= 10) return Math.floor(question.points * 0.3);
      return 0;
    }
  },

  // Générer un feedback pour une question ouverte
  async generateOpenQuestionFeedback(question: Question, userAnswer: string, score: number): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-learning-assistant', {
        body: {
          action: 'generate_feedback',
          question: question.question,
          user_answer: userAnswer,
          score: score,
          max_score: question.points
        }
      });

      if (error) throw error;

      return data.feedback || 'Réponse évaluée automatiquement.';
    } catch (error) {
      console.error('Erreur génération feedback:', error);
      return `Votre réponse a obtenu ${score}/${question.points} points.`;
    }
  },

  // Récupérer les tentatives d'un utilisateur
  async getUserAttempts(userId: string, courseId?: string): Promise<AssessmentAttempt[]> {
    try {
      let query = supabase
        .from('assessment_attempts')
        .select('*, course_assessments(title)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (courseId) {
        query = query.eq('course_id', courseId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erreur récupération tentatives:', error);
      return [];
    }
  },

  // Récupérer le meilleur score d'un utilisateur pour un cours
  async getBestScore(userId: string, courseId: string): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('assessment_attempts')
        .select('percentage')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('status', 'graded')
        .order('percentage', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data?.percentage || null;
    } catch (error) {
      console.error('Erreur récupération meilleur score:', error);
      return null;
    }
  }
};

export default assessmentService;
