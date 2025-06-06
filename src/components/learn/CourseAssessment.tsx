
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Clock, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle, 
  Trophy,
  FileText,
  Timer,
  Brain
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import assessmentService, { Assessment, AssessmentAttempt, Question } from "@/services/assessment-service";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface CourseAssessmentProps {
  courseId: string;
  courseName: string;
  onAssessmentComplete?: (score: number) => void;
}

const CourseAssessment = ({ courseId, courseName, onAssessmentComplete }: CourseAssessmentProps) => {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<AssessmentAttempt | null>(null);
  const [canTakeExam, setCanTakeExam] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // État de l'examen
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examCompleted, setExamCompleted] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<AssessmentAttempt | null>(null);

  useEffect(() => {
    if (user) {
      loadAssessmentData();
    }
  }, [user, courseId]);

  // Timer pour l'examen
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (examStarted && timeRemaining > 0 && !examCompleted) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [examStarted, timeRemaining, examCompleted]);

  const loadAssessmentData = async () => {
    try {
      setIsLoading(true);
      
      // Vérifier si l'utilisateur peut passer l'examen
      const canTake = await assessmentService.canTakeAssessment(user.id, courseId);
      setCanTakeExam(canTake);

      // Charger l'examen existant ou en créer un
      let assessmentData = await assessmentService.getCourseAssessment(courseId);
      
      if (!assessmentData) {
        // Générer un nouvel examen
        setIsGenerating(true);
        assessmentData = await assessmentService.generateAssessment(courseId, 40);
        setIsGenerating(false);
      }

      setAssessment(assessmentData);

      // Récupérer les tentatives précédentes
      const attempts = await assessmentService.getUserAttempts(user.id, courseId);
      if (attempts.length > 0) {
        setLastAttempt(attempts[0]);
      }

    } catch (error) {
      console.error('Erreur chargement examen:', error);
      toast.error('Erreur lors du chargement de l\'examen');
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const startExam = async () => {
    try {
      if (!assessment) return;

      const attempt = await assessmentService.startAssessment(user.id, assessment.id, courseId);
      setCurrentAttempt(attempt);
      setAnswers(new Array(assessment.questions.length).fill(null));
      setTimeRemaining(assessment.time_limit_minutes * 60);
      setExamStarted(true);
      setCurrentQuestion(0);
      
      toast.success('Examen démarré ! Bonne chance !');
    } catch (error: any) {
      console.error('Erreur démarrage examen:', error);
      toast.error(error.message || 'Erreur lors du démarrage de l\'examen');
    }
  };

  const handleAnswer = (questionIndex: number, answer: any) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answer;
    setAnswers(newAnswers);

    // Sauvegarder automatiquement
    if (currentAttempt) {
      assessmentService.saveAnswers(currentAttempt.id, newAnswers);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < (assessment?.questions.length || 0) - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleTimeUp = async () => {
    toast.warning('Temps écoulé ! L\'examen va être soumis automatiquement.');
    await submitExam();
  };

  const submitExam = async () => {
    try {
      if (!currentAttempt) return;

      setIsSubmitting(true);
      const gradedAttempt = await assessmentService.submitAssessment(currentAttempt.id);
      
      setExamCompleted(true);
      setLastAttempt(gradedAttempt);
      
      if (onAssessmentComplete && gradedAttempt.percentage) {
        onAssessmentComplete(gradedAttempt.percentage);
      }

      toast.success('Examen soumis et corrigé automatiquement !');
    } catch (error) {
      console.error('Erreur soumission examen:', error);
      toast.error('Erreur lors de la soumission de l\'examen');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!assessment) return 0;
    return ((currentQuestion + 1) / assessment.questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return answers.filter(answer => answer !== null && answer !== undefined).length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement de l'examen...</p>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <Card className="p-8 text-center">
        <Brain className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
        <h3 className="text-xl font-semibold mb-2">Génération de l'examen en cours...</h3>
        <p className="text-gray-600 mb-4">L'IA crée un examen personnalisé pour ce cours</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full w-3/4 animate-pulse"></div>
        </div>
      </Card>
    );
  }

  if (!assessment) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun examen disponible</h3>
        <p className="text-gray-500">L'examen pour ce cours n'a pas pu être généré</p>
      </Card>
    );
  }

  // Interface principale de l'examen
  if (examStarted && !examCompleted) {
    const question = assessment.questions[currentQuestion];
    
    return (
      <div className="space-y-6">
        {/* Header avec timer et progression */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Trophy className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold">{assessment.title}</h3>
                  <p className="text-sm text-gray-600">Question {currentQuestion + 1} sur {assessment.questions.length}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <Timer className="h-5 w-5" />
                  <span className="font-mono font-semibold">
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <Badge variant="outline">
                  {getAnsweredCount()}/{assessment.questions.length} répondues
                </Badge>
              </div>
            </div>
            
            <Progress value={getProgressPercentage()} className="h-2" />
          </CardContent>
        </Card>

        {/* Question actuelle */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">
                  Question {currentQuestion + 1}
                  <Badge className="ml-2" variant={question.difficulty === 'hard' ? 'destructive' : question.difficulty === 'medium' ? 'default' : 'secondary'}>
                    {question.difficulty}
                  </Badge>
                  <Badge className="ml-2" variant="outline">
                    {question.points} points
                  </Badge>
                </CardTitle>
                <Badge variant="outline">{question.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg leading-relaxed">{question.question}</p>
              
              {question.type === 'mcq' && question.options && (
                <RadioGroup
                  value={answers[currentQuestion]?.selected?.toString()}
                  onValueChange={(value) => handleAnswer(currentQuestion, { selected: parseInt(value) })}
                >
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mt-1" />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              
              {question.type === 'open' && (
                <div className="space-y-3">
                  <Label htmlFor="open-answer">Votre réponse :</Label>
                  <Textarea
                    id="open-answer"
                    value={answers[currentQuestion]?.text || ''}
                    onChange={(e) => handleAnswer(currentQuestion, { text: e.target.value })}
                    placeholder="Rédigez votre réponse ici... (minimum 50 mots recommandé)"
                    className="min-h-32"
                  />
                  <p className="text-sm text-gray-500">
                    Mots: {(answers[currentQuestion]?.text || '').split(/\s+/).filter(word => word.length > 0).length}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
              >
                Question précédente
              </Button>
              
              <div className="flex gap-3">
                {currentQuestion === assessment.questions.length - 1 ? (
                  <Button
                    onClick={submitExam}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? 'Soumission...' : 'Terminer l\'examen'}
                  </Button>
                ) : (
                  <Button onClick={nextQuestion}>
                    Question suivante
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Interface de résultats
  if (examCompleted && lastAttempt) {
    const passed = (lastAttempt.percentage || 0) >= assessment.passing_score;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className={`border-0 shadow-lg ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
          <CardContent className="p-8 text-center">
            {passed ? (
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            ) : (
              <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            )}
            
            <h3 className="text-2xl font-bold mb-2">
              {passed ? 'Félicitations !' : 'Examen non réussi'}
            </h3>
            
            <p className="text-lg mb-4">
              Votre score : {lastAttempt.score}/{lastAttempt.max_score} ({lastAttempt.percentage?.toFixed(1)}%)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{lastAttempt.score}</div>
                <div className="text-sm text-gray-600">Points obtenus</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{lastAttempt.max_score}</div>
                <div className="text-sm text-gray-600">Points maximum</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{assessment.passing_score}%</div>
                <div className="text-sm text-gray-600">Score requis</div>
              </div>
            </div>
            
            {passed && (
              <div className="mt-6">
                <Badge className="bg-green-600 text-white px-6 py-2">
                  Cours terminé avec succès !
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
        
        {lastAttempt.ai_feedback && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Feedback détaillé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lastAttempt.ai_feedback.questions?.map((feedback: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Question {index + 1}</span>
                      <Badge variant="outline">
                        {feedback.score}/{feedback.max_score} points
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{feedback.feedback}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    );
  }

  // Interface d'accueil
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Examen Final - {courseName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{assessment.total_questions}</div>
              <div className="text-sm text-blue-600">Questions</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">{assessment.time_limit_minutes}</div>
              <div className="text-sm text-purple-600">Minutes</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{assessment.passing_score}%</div>
              <div className="text-sm text-green-600">Score requis</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Timer className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">1x</div>
              <div className="text-sm text-orange-600">Par semaine</div>
            </div>
          </div>
          
          {assessment.description && (
            <Alert>
              <AlertDescription>{assessment.description}</AlertDescription>
            </Alert>
          )}
          
          {lastAttempt && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Dernière tentative</h4>
              <div className="flex items-center justify-between">
                <span>Score obtenu : {lastAttempt.percentage?.toFixed(1)}%</span>
                <Badge variant={lastAttempt.percentage && lastAttempt.percentage >= assessment.passing_score ? 'default' : 'destructive'}>
                  {lastAttempt.percentage && lastAttempt.percentage >= assessment.passing_score ? 'Réussi' : 'Échec'}
                </Badge>
              </div>
            </div>
          )}
          
          {!canTakeExam && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Vous avez déjà passé l'examen cette semaine. Vous pourrez repasser l'examen la semaine prochaine.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-3">
            <Button
              onClick={startExam}
              disabled={!canTakeExam}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {lastAttempt ? 'Repasser l\'examen' : 'Commencer l\'examen'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseAssessment;
