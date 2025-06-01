
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Target,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Brain
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import luvvixLearnService from "@/services/luvvix-learn-service";
import { toast } from "sonner";

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
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const [courseData, lessonsData, enrollmentData] = await Promise.all([
        luvvixLearnService.getCourse(courseId),
        luvvixLearnService.getCourseLessons(courseId),
        user ? luvvixLearnService.getUserEnrollments(user.id) : Promise.resolve([])
      ]);

      setCourse(courseData);
      setLessons(lessonsData);
      
      const userEnrollment = enrollmentData.find(e => e.course_id === courseId);
      setEnrollment(userEnrollment);

      if (userEnrollment && userEnrollment.current_lesson_id) {
        const lessonIndex = lessonsData.findIndex(l => l.id === userEnrollment.current_lesson_id);
        if (lessonIndex !== -1) {
          setCurrentLessonIndex(lessonIndex);
        }
      }

      // Charger les résultats de quiz
      if (user) {
        const results = await luvvixLearnService.getUserQuizResults(user.id);
        setQuizResults(results);
      }
    } catch (error) {
      console.error('Erreur chargement cours:', error);
      toast.error('Erreur lors du chargement du cours');
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour vous inscrire');
      return;
    }

    try {
      await luvvixLearnService.enrollInCourse(courseId, user.id);
      toast.success('Inscription réussie !');
      loadCourseData();
    } catch (error) {
      toast.error('Erreur lors de l\'inscription');
    }
  };

  const loadLessonQuiz = async (lessonId: string) => {
    try {
      const quiz = await luvvixLearnService.getLessonQuiz(lessonId);
      setCurrentQuiz(quiz);
    } catch (error) {
      console.error('Erreur chargement quiz:', error);
    }
  };

  const markLessonComplete = async () => {
    if (!enrollment || !user) return;

    const newProgress = Math.floor(((currentLessonIndex + 1) / lessons.length) * 100);
    
    try {
      await luvvixLearnService.updateProgress(
        enrollment.id, 
        newProgress,
        lessons[currentLessonIndex]?.id
      );
      
      await luvvixLearnService.trackActivity(
        user.id,
        courseId,
        'lesson_completed',
        { lesson_id: lessons[currentLessonIndex]?.id }
      );

      // Générer certificat si cours terminé
      if (newProgress >= 100) {
        try {
          await luvvixLearnService.generateCertificate(user.id, courseId);
          toast.success('🎉 Félicitations ! Vous avez obtenu votre certificat !');
        } catch (error) {
          console.error('Erreur génération certificat:', error);
        }
      }

      loadCourseData();
      toast.success('Leçon terminée !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const nextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      setCurrentQuiz(null);
    }
  };

  const previousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      setCurrentQuiz(null);
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
    return <div>Cours non trouvé</div>;
  }

  const currentLesson = lessons[currentLessonIndex];
  const progress = enrollment ? enrollment.progress_percentage : 0;

  return (
    <div className="space-y-6">
      {/* Header du cours */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux cours
          </Button>
          
          {course.ai_generated && (
            <Badge className="bg-purple-100 text-purple-800">
              <Brain className="h-3 w-3 mr-1" />
              Généré par LuvviX AI
            </Badge>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {Math.floor(course.duration_minutes / 60)}h {course.duration_minutes % 60}min
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {lessons.length} leçons
          </div>
          <Badge variant="outline">
            {course.difficulty_level === 'beginner' ? 'Débutant' :
             course.difficulty_level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
          </Badge>
        </div>

        {enrollment ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression du cours</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        ) : (
          <Button onClick={enrollInCourse} size="lg" className="mt-4">
            S'inscrire au cours
          </Button>
        )}
      </Card>

      {enrollment && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Liste des leçons */}
          <Card className="lg:col-span-1 p-4">
            <h3 className="font-semibold mb-4">Plan du cours</h3>
            <div className="space-y-2">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    index === currentLessonIndex
                      ? 'bg-blue-100 border border-blue-200'
                      : index < currentLessonIndex
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setCurrentLessonIndex(index)}
                >
                  <div className="flex items-center gap-2">
                    {index < currentLessonIndex ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : index === currentLessonIndex ? (
                      <Play className="h-4 w-4 text-blue-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-gray-300" />
                    )}
                    <span className="text-sm font-medium">
                      {index + 1}. {lesson.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {lesson.duration_minutes} min • {lesson.lesson_type}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Contenu principal */}
          <Card className="lg:col-span-3 p-6">
            {currentLesson && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
                  <Badge>
                    Leçon {currentLessonIndex + 1} sur {lessons.length}
                  </Badge>
                </div>

                <div className="prose max-w-none mb-6">
                  <div dangerouslySetInnerHTML={{ __html: currentLesson.content.replace(/\n/g, '<br>') }} />
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={previousLesson}
                    disabled={currentLessonIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Leçon précédente
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => loadLessonQuiz(currentLesson.id)}
                    >
                      Quiz de la leçon
                    </Button>
                    
                    <Button onClick={markLessonComplete}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marquer comme terminée
                    </Button>
                  </div>

                  <Button
                    onClick={nextLesson}
                    disabled={currentLessonIndex === lessons.length - 1}
                  >
                    Leçon suivante
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default CourseViewer;
