
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Target,
  ArrowLeft,
  ArrowRight,
  Trophy,
  AlertCircle,
  Plus,
  Award,
  Download,
  PlayCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import luvvixLearnService from "@/services/luvvix-learn-service";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface CourseViewerProps {
  courseId: string;
  onBack: () => void;
}

const CourseViewer = ({ courseId, onBack }: CourseViewerProps) => {
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [finalQuiz, setFinalQuiz] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [showDiploma, setShowDiploma] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Chargement des données du cours:', courseId);
      
      const [courseData, lessonsData, enrollmentData] = await Promise.all([
        luvvixLearnService.getCourse(courseId),
        luvvixLearnService.getCourseLessons(courseId),
        user ? luvvixLearnService.getUserEnrollments(user.id) : Promise.resolve([])
      ]);

      console.log('📚 Cours récupéré:', courseData);
      console.log('📖 Leçons récupérées:', lessonsData);

      setCourse(courseData);
      setLessons(lessonsData || []);
      
      const userEnrollment = enrollmentData.find(e => e.course_id === courseId);
      setEnrollment(userEnrollment);

      // Charger le quiz final s'il existe
      if (courseData?.final_quiz_id) {
        const finalQuizData = await luvvixLearnService.getLessonQuiz(courseData.final_quiz_id);
        setFinalQuiz(finalQuizData);
      }

      // Charger le certificat si le cours est terminé
      if (userEnrollment?.progress_percentage >= 100) {
        const certificates = await luvvixLearnService.getUserCertificates(user.id);
        const courseCertificate = certificates.find(cert => cert.course_id === courseId);
        setCertificate(courseCertificate);
      }

      if (userEnrollment && userEnrollment.current_lesson_id && lessonsData.length > 0) {
        const lessonIndex = lessonsData.findIndex(l => l.id === userEnrollment.current_lesson_id);
        if (lessonIndex !== -1) {
          setCurrentLessonIndex(lessonIndex);
        }
      }

    } catch (error) {
      console.error('❌ Erreur chargement données cours:', error);
      toast.error('Erreur lors du chargement du cours');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      await updateProgress();
    } else {
      // Dernière leçon terminée, passer au quiz final
      if (!finalQuiz) {
        await generateFinalQuiz();
      } else {
        setQuizMode(true);
      }
    }
  };

  const updateProgress = async () => {
    if (!enrollment || !user) return;

    try {
      const currentProgress = Math.round(((currentLessonIndex + 1) / lessons.length) * 100);
      
      await luvvixLearnService.updateProgress(
        enrollment.id, 
        currentProgress, 
        lessons[currentLessonIndex]?.id
      );
      
      setEnrollment(prev => ({
        ...prev,
        progress_percentage: currentProgress,
        current_lesson_id: lessons[currentLessonIndex]?.id
      }));

      await luvvixLearnService.trackActivity(
        user.id, 
        courseId, 
        'lesson_progress', 
        { lesson_id: lessons[currentLessonIndex]?.id, progress: currentProgress }
      );
    } catch (error) {
      console.error('❌ Erreur mise à jour progression:', error);
    }
  };

  const generateFinalQuiz = async () => {
    try {
      setGeneratingQuiz(true);
      
      const quizData = await luvvixLearnService.generateFinalQuiz(courseId, 50);
      setFinalQuiz(quizData);
      
      toast.success('Quiz final généré avec 50 questions !');
      setQuizMode(true);
    } catch (error) {
      console.error('❌ Erreur génération quiz final:', error);
      toast.error('Erreur lors de la génération du quiz final');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleQuizAnswer = (selectedOption: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = selectedOption;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < finalQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    try {
      // Calculer le score
      let correctAnswers = 0;
      finalQuiz.questions.forEach((question, index) => {
        if (userAnswers[index] === question.correct_answer) {
          correctAnswers++;
        }
      });

      const score = Math.round((correctAnswers / finalQuiz.questions.length) * 20); // Score sur 20
      setFinalScore(score);

      // Enregistrer le résultat
      await luvvixLearnService.submitQuizResult(
        user.id,
        finalQuiz.id,
        score,
        userAnswers
      );

      // Marquer le cours comme terminé
      await luvvixLearnService.updateProgress(enrollment.id, 100);

      // Générer le certificat
      const newCertificate = await luvvixLearnService.generateCertificate(user.id, courseId);
      setCertificate(newCertificate);

      setQuizCompleted(true);
      toast.success(`🎉 Quiz terminé ! Score: ${score}/20`);
    } catch (error) {
      console.error('❌ Erreur finalisation quiz:', error);
      toast.error('Erreur lors de la finalisation du quiz');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Cours introuvable</h3>
        <Button onClick={onBack}>Retour</Button>
      </div>
    );
  }

  if (showDiploma && certificate) {
    return <DiplomaView certificate={certificate} course={course} onBack={() => setShowDiploma(false)} />;
  }

  if (quizMode && finalQuiz) {
    return (
      <QuizView 
        quiz={finalQuiz}
        currentQuestionIndex={currentQuestionIndex}
        userAnswers={userAnswers}
        onAnswer={handleQuizAnswer}
        onNext={handleNextQuestion}
        onBack={() => setQuizMode(false)}
        completed={quizCompleted}
        score={finalScore}
        onViewDiploma={() => setShowDiploma(true)}
      />
    );
  }

  const currentLesson = lessons[currentLessonIndex];
  const progressPercentage = lessons.length > 0 ? Math.round(((currentLessonIndex + 1) / lessons.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour au catalogue
        </Button>
        {certificate && (
          <Button onClick={() => setShowDiploma(true)} className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Voir le diplôme
          </Button>
        )}
      </div>

      {/* Course Info */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
            
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline">{course.category}</Badge>
              <Badge variant="outline" className="capitalize">{course.difficulty_level}</Badge>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                {Math.floor(course.duration_minutes / 60)}h {course.duration_minutes % 60}min
              </div>
            </div>

            {enrollment && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progression</span>
                  <span className="font-medium">{enrollment.progress_percentage}%</span>
                </div>
                <Progress value={enrollment.progress_percentage} className="h-2" />
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{lessons.length}</div>
            <div className="text-sm text-gray-500">Leçons disponibles</div>
          </div>
        </div>
      </Card>

      {/* No Lessons State */}
      {lessons.length === 0 && (
        <Card className="p-8 text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Aucune leçon disponible</h3>
          <p className="text-gray-600 mb-6">Ce cours n'a pas encore de leçons.</p>
        </Card>
      )}

      {/* Lesson Content */}
      {lessons.length > 0 && currentLesson && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Lesson List */}
          <Card className="lg:col-span-1 p-4">
            <h3 className="font-semibold mb-4">Plan du cours</h3>
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    index === currentLessonIndex 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentLessonIndex(index)}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    index < currentLessonIndex 
                      ? 'bg-green-500 text-white' 
                      : index === currentLessonIndex 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index < currentLessonIndex ? <CheckCircle className="h-3 w-3" /> : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{lesson.title}</div>
                    <div className="text-xs text-gray-500">{lesson.duration_minutes} min</div>
                  </div>
                </div>
              ))}
              
              {/* Final Quiz */}
              {!finalQuiz && (
                <div className="p-3 border-2 border-dashed border-gray-200 rounded-lg text-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={generateFinalQuiz}
                    disabled={generatingQuiz}
                    className="w-full"
                  >
                    {generatingQuiz ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                        Génération...
                      </>
                    ) : (
                      <>
                        <Trophy className="h-4 w-4 mr-2" />
                        Générer Quiz Final
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              {finalQuiz && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Quiz Final</div>
                    <div className="text-xs text-gray-500">50 questions</div>
                  </div>
                  <Button size="sm" onClick={() => setQuizMode(true)}>
                    <PlayCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Lesson Content */}
          <Card className="lg:col-span-3 p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
                <Badge variant="outline" className="capitalize">{currentLesson.lesson_type}</Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {currentLesson.duration_minutes} minutes
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Leçon {currentLessonIndex + 1} sur {lessons.length}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progression du cours</span>
                  <span className="font-medium">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>

            {/* Lesson Content Display with Rich Formatting */}
            <div className="prose prose-lg max-w-none mb-8">
              <div 
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: currentLesson.content
                }}
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentLessonIndex(Math.max(0, currentLessonIndex - 1))}
                disabled={currentLessonIndex === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Précédent
              </Button>

              <div className="text-sm text-gray-500">
                {currentLessonIndex + 1} / {lessons.length}
              </div>

              <Button
                onClick={handleContinue}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {currentLessonIndex === lessons.length - 1 ? (
                  finalQuiz ? (
                    <>
                      <Trophy className="h-4 w-4" />
                      Quiz Final
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Générer Quiz
                    </>
                  )
                ) : (
                  <>
                    Continuer
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Quiz Component
const QuizView = ({ quiz, currentQuestionIndex, userAnswers, onAnswer, onNext, onBack, completed, score, onViewDiploma }) => {
  const currentQuestion = quiz.questions[currentQuestionIndex];

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto text-center p-8">
        <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4">Quiz terminé !</h2>
        <div className="text-6xl font-bold text-blue-600 mb-2">{score}/20</div>
        <p className="text-lg text-gray-600 mb-8">
          Félicitations ! Vous avez terminé le quiz final.
        </p>
        <Button onClick={onViewDiploma} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <Award className="h-5 w-5 mr-2" />
          Voir votre diplôme
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au cours
        </Button>
        <div className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1} sur {quiz.questions.length}
        </div>
      </div>

      <Card className="p-8">
        <div className="mb-6">
          <Progress value={(currentQuestionIndex / quiz.questions.length) * 100} className="h-2 mb-4" />
          <h2 className="text-2xl font-bold mb-4">{currentQuestion.question}</h2>
        </div>

        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswer(index)}
              className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                userAnswers[currentQuestionIndex] === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
              {option}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={onNext}
            disabled={userAnswers[currentQuestionIndex] === undefined}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            {currentQuestionIndex === quiz.questions.length - 1 ? 'Terminer' : 'Suivant'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Diploma Component
const DiplomaView = ({ certificate, course, onBack }) => {
  const downloadDiploma = () => {
    window.print();
  };

  const mention = certificate.certificate_data.mention || 'Passable';
  const score = certificate.certificate_data.score || 70;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Button onClick={downloadDiploma}>
          <Download className="h-4 w-4 mr-2" />
          Télécharger
        </Button>
      </div>

      <div className="bg-white border-4 border-yellow-400 p-12 text-center shadow-2xl">
        <div className="border-2 border-gray-300 p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">DIPLÔME DE CERTIFICATION</h1>
          
          <div className="mb-8">
            <div className="text-lg text-gray-600 mb-4">Nous certifions par la présente que</div>
            <div className="text-3xl font-bold text-blue-600 mb-4">
              {certificate.certificate_data.student_name}
            </div>
            <div className="text-lg text-gray-600">a complété avec succès le cours</div>
          </div>

          <div className="mb-8">
            <div className="text-2xl font-bold text-gray-800 mb-2">{course.title}</div>
            <div className="text-lg text-gray-600 mb-4">{course.category}</div>
            <div className="text-lg text-gray-600">
              avec un score de <span className="font-bold text-green-600">{score}/20</span>
            </div>
            <div className="text-xl font-semibold text-yellow-600 mt-2">
              Mention: {mention}
            </div>
          </div>

          <div className="flex justify-between items-end mt-12">
            <div>
              <div className="border-t-2 border-gray-400 w-48 pt-2">
                <div className="font-semibold">Date de certification</div>
                <div className="text-sm text-gray-600">
                  {new Date(certificate.issued_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Award className="h-12 w-12 text-blue-600" />
              </div>
              <div className="text-sm font-semibold">LuvviX Learn</div>
            </div>
            
            <div>
              <div className="border-t-2 border-gray-400 w-48 pt-2">
                <div className="font-semibold">Ludovic Aggaï</div>
                <div className="text-sm text-gray-600">Fondateur & Directeur</div>
                <div className="text-sm text-gray-600">LuvviX Learn</div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-xs text-gray-500">
            Code de vérification: {certificate.verification_code}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
