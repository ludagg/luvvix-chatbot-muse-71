
import { useState, useEffect } from "react";
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
  Target, 
  Clock, 
  BookOpen, 
  Lightbulb,
  Users,
  TrendingUp,
  Sparkles,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import enhancedAIService from "@/services/enhanced-ai-service";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface CourseTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty_level: string;
  template_structure: any;
}

interface GenerationProgress {
  step: string;
  progress: number;
  message: string;
}

const SmartCourseGenerator = ({ onCourseGenerated }: { onCourseGenerated?: () => void }) => {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [description, setDescription] = useState('');
  const [templates, setTemplates] = useState<CourseTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<any>(null);

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
    { value: 'beginner', label: 'Débutant', description: 'Aucune connaissance préalable requise' },
    { value: 'intermediate', label: 'Intermédiaire', description: 'Connaissances de base nécessaires' },
    { value: 'advanced', label: 'Avancé', description: 'Expertise technique requise' }
  ];

  useEffect(() => {
    if (user) {
      loadUserAnalytics();
    }
  }, [user]);

  useEffect(() => {
    if (category && difficulty) {
      loadTemplates();
    }
  }, [category, difficulty]);

  const loadUserAnalytics = async () => {
    try {
      const analytics = await enhancedAIService.getUserLearningAnalytics(user.id);
      setUserAnalytics(analytics);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const template = await enhancedAIService.getOptimalCourseTemplate(category, difficulty);
      if (template) {
        setTemplates([template]);
        setSelectedTemplate(template.id);
      }
    } catch (error) {
      console.error('Erreur chargement templates:', error);
    }
  };

  const generateSmartCourse = async () => {
    if (!topic.trim() || !category || !difficulty) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!user) {
      toast.error('Vous devez être connecté pour générer un cours');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress({ step: 'initialization', progress: 10, message: 'Initialisation de la génération...' });

    try {
      // Étape 1: Analyse du profil utilisateur
      setGenerationProgress({ step: 'profile_analysis', progress: 20, message: 'Analyse de votre profil d\'apprentissage...' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Étape 2: Sélection du template optimal
      setGenerationProgress({ step: 'template_selection', progress: 40, message: 'Sélection du template optimal...' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Étape 3: Génération IA
      setGenerationProgress({ step: 'ai_generation', progress: 60, message: 'Génération du contenu par l\'IA...' });
      
      const userProfile = {
        analytics: userAnalytics,
        learning_pace: 'normal',
        interests: [category],
        experience_level: difficulty
      };

      const result = await enhancedAIService.generateIntelligentCourse(
        topic, 
        category, 
        difficulty, 
        userProfile
      );

      // Étape 4: Optimisation
      setGenerationProgress({ step: 'optimization', progress: 80, message: 'Optimisation et personnalisation...' });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Étape 5: Finalisation
      setGenerationProgress({ step: 'finalization', progress: 100, message: 'Finalisation du cours...' });
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success(`🎉 Cours "${result.course.title}" généré avec succès !`);
      
      if (onCourseGenerated) {
        onCourseGenerated();
      }

      // Réinitialiser le formulaire
      setTopic('');
      setDescription('');
      setSelectedTemplate('');

    } catch (error) {
      console.error('Erreur génération cours:', error);
      toast.error('Erreur lors de la génération du cours');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  const getPersonalizedSuggestions = () => {
    if (!userAnalytics) return [];

    const suggestions = [];
    
    if (userAnalytics.completionRate > 80) {
      suggestions.push({
        icon: <TrendingUp className="h-4 w-4" />,
        text: "Excellent taux de réussite ! Essayez un niveau avancé.",
        type: "success"
      });
    }

    if (userAnalytics.averageSessionTime > 45) {
      suggestions.push({
        icon: <Clock className="h-4 w-4" />,
        text: "Vous apprenez de manière approfondie. Cours longs recommandés.",
        type: "info"
      });
    }

    if (userAnalytics.totalSessions > 10) {
      suggestions.push({
        icon: <Target className="h-4 w-4" />,
        text: "Apprenant expérimenté ! Explorez de nouveaux domaines.",
        type: "primary"
      });
    }

    return suggestions;
  };

  return (
    <div className="space-y-8">
      {/* Header avec analytics utilisateur */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-50" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <Brain className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Générateur de Cours IA</h1>
              <p className="text-lg opacity-90">Créez des cours personnalisés avec l'intelligence artificielle</p>
            </div>
          </div>

          {userAnalytics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{userAnalytics.totalSessions}</div>
                <div className="text-sm opacity-90">Sessions d'apprentissage</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{userAnalytics.completionRate.toFixed(0)}%</div>
                <div className="text-sm opacity-90">Taux de réussite</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{Math.floor(userAnalytics.averageSessionTime / 60)}min</div>
                <div className="text-sm opacity-90">Session moyenne</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Suggestions personnalisées */}
      {userAnalytics && getPersonalizedSuggestions().length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Lightbulb className="h-5 w-5" />
                Suggestions personnalisées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getPersonalizedSuggestions().map((suggestion, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <div className="text-green-600">{suggestion.icon}</div>
                    <span className="text-sm text-gray-700">{suggestion.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Formulaire de génération */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-purple-600" />
              Configuration du cours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Sujet du cours *
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: React.js pour débutants"
                  className="border-gray-200 focus:border-purple-500"
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Catégorie *
                </label>
                <Select value={category} onValueChange={setCategory} disabled={isGenerating}>
                  <SelectTrigger className="border-gray-200 focus:border-purple-500">
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Niveau de difficulté *
                </label>
                <Select value={difficulty} onValueChange={setDifficulty} disabled={isGenerating}>
                  <SelectTrigger className="border-gray-200 focus:border-purple-500">
                    <SelectValue placeholder="Choisir un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map(diff => (
                      <SelectItem key={diff.value} value={diff.value}>
                        <div>
                          <div className="font-medium">{diff.label}</div>
                          <div className="text-xs text-gray-500">{diff.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Template recommandé
                </label>
                {templates.length > 0 ? (
                  <div className="p-3 bg-blue-50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">{templates[0].name}</span>
                      <Badge className="bg-blue-100 text-blue-800">Optimal</Badge>
                    </div>
                    <p className="text-sm text-blue-700 mt-1">{templates[0].description}</p>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg border border-dashed">
                    <span className="text-sm text-gray-500">Sélectionnez une catégorie et un niveau</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Description supplémentaire (optionnel)
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ajoutez des détails spécifiques, objectifs particuliers, ou contraintes..."
                className="border-gray-200 focus:border-purple-500 min-h-20"
                disabled={isGenerating}
              />
            </div>

            {/* Barre de progression */}
            <AnimatePresence>
              {isGenerating && generationProgress && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600 animate-spin" />
                    <span className="text-sm font-medium text-purple-900">
                      {generationProgress.message}
                    </span>
                  </div>
                  <Progress 
                    value={generationProgress.progress} 
                    className="h-2 bg-white"
                  />
                  <div className="text-xs text-purple-700">
                    {generationProgress.progress}% terminé
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setTopic('');
                  setDescription('');
                  setCategory('');
                  setDifficulty('');
                }}
                disabled={isGenerating}
              >
                Réinitialiser
              </Button>
              <Button
                onClick={generateSmartCourse}
                disabled={isGenerating || !topic.trim() || !category || !difficulty}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white min-w-32"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Génération...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Générer le cours
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SmartCourseGenerator;
