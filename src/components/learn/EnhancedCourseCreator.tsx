
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Wand2, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Target,
  Zap,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import luvvixLearnService from "@/services/luvvix-learn-service";
import { useAuth } from "@/hooks/useAuth";

interface CreationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const EnhancedCourseCreator = ({ onCourseCreated }: { onCourseCreated?: () => void }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [courseData, setCourseData] = useState({
    topic: '',
    category: '',
    difficulty: '',
    description: '',
    duration: 'medium'
  });

  const categories = [
    "Informatique fondamentale",
    "Programmation Web", 
    "Intelligence Artificielle",
    "Base de données",
    "Cybersécurité",
    "Réseaux",
    "Développement Mobile",
    "DevOps",
    "Data Science",
    "Cloud Computing"
  ];

  const difficulties = [
    { value: 'beginner', label: 'Débutant', color: 'bg-green-100 text-green-800' },
    { value: 'intermediate', label: 'Intermédiaire', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'advanced', label: 'Avancé', color: 'bg-red-100 text-red-800' }
  ];

  const durations = [
    { value: 'short', label: 'Court (4-6h)', lessons: '6-8 leçons' },
    { value: 'medium', label: 'Moyen (8-12h)', lessons: '10-12 leçons' },
    { value: 'long', label: 'Long (15-20h)', lessons: '15-20 leçons' }
  ];

  const steps: CreationStep[] = [
    {
      id: 'topic',
      title: 'Sujet du cours',
      description: 'Définissez le sujet principal de votre cours',
      completed: !!courseData.topic
    },
    {
      id: 'details',
      title: 'Détails du cours',
      description: 'Configurez la catégorie, le niveau et la durée',
      completed: !!(courseData.category && courseData.difficulty)
    },
    {
      id: 'description',
      title: 'Description',
      description: 'Ajoutez une description personnalisée (optionnel)',
      completed: true
    },
    {
      id: 'generate',
      title: 'Génération',
      description: 'Laissez l\'IA créer votre cours premium',
      completed: false
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateCourse = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer un cours');
      return;
    }

    if (!courseData.topic || !courseData.category || !courseData.difficulty) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulation de progression
      const progressSteps = [
        { progress: 10, message: 'Initialisation de l\'IA...' },
        { progress: 25, message: 'Génération du plan de cours...' },
        { progress: 45, message: 'Création des leçons détaillées...' },
        { progress: 70, message: 'Génération du contenu interactif...' },
        { progress: 85, message: 'Création de l\'évaluation...' },
        { progress: 95, message: 'Finalisation du cours...' },
        { progress: 100, message: 'Cours créé avec succès !' }
      ];

      for (const step of progressSteps) {
        setGenerationProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const result = await luvvixLearnService.generateCourse(
        courseData.topic,
        courseData.category,
        courseData.difficulty
      );

      toast.success(`🎉 Cours "${result.course.title}" créé avec succès !`);
      
      if (onCourseCreated) {
        onCourseCreated();
      }

      // Réinitialiser le formulaire
      setCourseData({
        topic: '',
        category: '',
        difficulty: '',
        description: '',
        duration: 'medium'
      });
      setCurrentStep(0);

    } catch (error) {
      console.error('❌ Erreur génération cours:', error);
      toast.error('Erreur lors de la génération du cours');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <BookOpen className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Quel est le sujet de votre cours ?
              </h3>
              <p className="text-gray-600">
                Soyez précis pour obtenir un cours de qualité exceptionnelle
              </p>
            </div>
            
            <div className="space-y-4">
              <Input
                value={courseData.topic}
                onChange={(e) => setCourseData({ ...courseData, topic: e.target.value })}
                placeholder="Ex: React.js pour débutants, Machine Learning avancé..."
                className="text-lg p-4 border-2 focus:border-blue-500"
              />
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Développement Web avec React",
                  "Intelligence Artificielle",
                  "Cybersécurité Éthique",
                  "Data Science avec Python"
                ].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => setCourseData({ ...courseData, topic: suggestion })}
                    className="text-left h-auto p-3 hover:border-blue-500"
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-blue-500" />
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Target className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Configurez votre cours
              </h3>
              <p className="text-gray-600">
                Ces paramètres nous aident à créer le cours parfait pour vous
              </p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Catégorie
                </label>
                <Select value={courseData.category} onValueChange={(value) => setCourseData({ ...courseData, category: value })}>
                  <SelectTrigger className="p-4 border-2">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Niveau de difficulté
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {difficulties.map(diff => (
                    <Button
                      key={diff.value}
                      variant={courseData.difficulty === diff.value ? "default" : "outline"}
                      onClick={() => setCourseData({ ...courseData, difficulty: diff.value })}
                      className="h-16 flex-col gap-2"
                    >
                      <span className="font-semibold">{diff.label}</span>
                      <Badge className={diff.color} variant="secondary">
                        {diff.value}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Durée du cours
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {durations.map(duration => (
                    <Button
                      key={duration.value}
                      variant={courseData.duration === duration.value ? "default" : "outline"}
                      onClick={() => setCourseData({ ...courseData, duration: duration.value })}
                      className="h-16 flex-col gap-1"
                    >
                      <Clock className="h-4 w-4" />
                      <span className="font-semibold text-xs">{duration.label}</span>
                      <span className="text-xs text-gray-500">{duration.lessons}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Wand2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Personnalisez votre cours
              </h3>
              <p className="text-gray-600">
                Ajoutez des détails spécifiques pour un cours sur-mesure
              </p>
            </div>
            
            <div className="space-y-4">
              <Textarea
                value={courseData.description}
                onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                placeholder="Décrivez les objectifs spécifiques, le public cible, ou tout autre détail important..."
                className="min-h-32 border-2 focus:border-green-500"
              />
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Conseil IA</h4>
                    <p className="text-sm text-blue-700">
                      Plus vous donnez de détails, plus l'IA pourra créer un cours personnalisé 
                      et adapté à vos besoins spécifiques.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <Brain className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Résumé de votre cours
              </h3>
              <p className="text-gray-600">
                Vérifiez les détails avant de lancer la génération IA
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Sujet:</span>
                  <p className="font-semibold">{courseData.topic}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Catégorie:</span>
                  <p className="font-semibold">{courseData.category}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Niveau:</span>
                  <Badge className={difficulties.find(d => d.value === courseData.difficulty)?.color}>
                    {difficulties.find(d => d.value === courseData.difficulty)?.label}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Durée:</span>
                  <p className="font-semibold">
                    {durations.find(d => d.value === courseData.duration)?.label}
                  </p>
                </div>
              </div>
              
              {courseData.description && (
                <div>
                  <span className="text-sm text-gray-500">Description:</span>
                  <p className="text-sm mt-1">{courseData.description}</p>
                </div>
              )}
            </div>

            {isGenerating && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Génération en cours...</span>
                  <span className="font-semibold">{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} className="h-3" />
              </div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto border-0 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-xl">
            <Brain className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">
              Créateur de Cours IA Premium
            </CardTitle>
            <p className="text-blue-100">
              Générez des cours exceptionnels avec l'intelligence artificielle
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className={`flex items-center gap-3 ${currentStep >= index ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  currentStep > index 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : currentStep === index 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'border-gray-300'
                }`}>
                  {currentStep > index ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="hidden md:block">
                  <div className="font-semibold text-sm">{step.title}</div>
                  <div className="text-xs">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${currentStep > index ? 'bg-green-500' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-96">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-8"
          >
            Précédent
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={nextStep}
              disabled={!steps[currentStep].completed}
              className="px-8 bg-blue-600 hover:bg-blue-700"
            >
              Suivant
            </Button>
          ) : (
            <Button
              onClick={generateCourse}
              disabled={isGenerating || !courseData.topic || !courseData.category || !courseData.difficulty}
              className="px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Génération...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Générer le Cours
                </div>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedCourseCreator;
