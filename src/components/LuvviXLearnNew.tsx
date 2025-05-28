
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  GraduationCap, 
  BookOpen, 
  Trophy, 
  Clock, 
  Star, 
  Play,
  CheckCircle,
  Brain,
  Target,
  Award,
  TrendingUp,
  Users,
  Zap,
  Plus,
  Loader2,
  Calendar,
  BarChart3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  duration: string;
  modules: Module[];
  createdAt: string;
  aiGenerated: boolean;
  certification: boolean;
  exam?: Exam;
}

interface Module {
  title: string;
  description: string;
  lessons: Lesson[];
  project: string;
}

interface Lesson {
  title: string;
  content: string;
  duration: string;
  exercises: string[];
}

interface Exam {
  questions: Question[];
}

interface Question {
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options?: string[];
  correct: any;
  explanation: string;
}

const LuvviXLearnNew: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newCoursePrompt, setNewCoursePrompt] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermédiaire');
  const [selectedDuration, setSelectedDuration] = useState('8 semaines');
  const [selectedType, setSelectedType] = useState('Pratique');

  useEffect(() => {
    loadExistingCourses();
    // Déclencher la mise à jour automatique quotidienne
    scheduleAutoUpdates();
  }, []);

  const loadExistingCourses = async () => {
    // Charger les cours existants depuis la base de données
    // Pour l'instant, on démarre avec une liste vide
    setCourses([]);
  };

  const scheduleAutoUpdates = () => {
    // Planifier les mises à jour automatiques
    setInterval(async () => {
      await triggerAutoContentUpdate();
    }, 24 * 60 * 60 * 1000); // Tous les jours
  };

  const triggerAutoContentUpdate = async () => {
    try {
      const response = await fetch('/functions/v1/ai-content-updater', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      if (result.success) {
        console.log('Mise à jour automatique terminée:', result.report);
        if (result.data.newCourses?.length > 0) {
          setCourses(prev => [...prev, ...result.data.newCourses]);
          toast({
            title: "Nouveaux cours disponibles",
            description: `${result.data.newCourses.length} nouveaux cours ont été générés automatiquement`
          });
        }
      }
    } catch (error) {
      console.error('Erreur de mise à jour automatique:', error);
    }
  };

  const generateNewCourse = async () => {
    if (!newCoursePrompt.trim()) {
      toast({
        variant: "destructive",
        title: "Sujet requis",
        description: "Veuillez décrire le sujet du cours à créer"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/functions/v1/ai-course-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: newCoursePrompt,
          difficulty: selectedDifficulty,
          duration: selectedDuration,
          type: selectedType
        })
      });

      const result = await response.json();
      if (result.success && result.course) {
        setCourses(prev => [result.course, ...prev]);
        setNewCoursePrompt('');
        toast({
          title: "Cours créé avec succès",
          description: `Le cours "${result.course.title}" a été généré par l'IA`
        });
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Erreur de génération:', error);
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: "Impossible de générer le cours. Réessayez plus tard."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-100 text-green-700';
      case 'Intermédiaire': return 'bg-yellow-100 text-yellow-700';
      case 'Avancé': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LuvviX Learn
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Plateforme d'apprentissage révolutionnaire avec contenu généré automatiquement par IA et certifications officielles
          </p>
          
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Contenu IA Auto-généré</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">Certifications Officielles</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium">Mise à jour Continue</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
              <div className="text-sm text-gray-600">Cours Disponibles</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{courses.filter(c => c.aiGenerated).length}</div>
              <div className="text-sm text-gray-600">Générés par IA</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{courses.filter(c => c.certification).length}</div>
              <div className="text-sm text-gray-600">Certifiants</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">Quotidien</div>
              <div className="text-sm text-gray-600">Mises à jour Auto</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Tableau de Bord
            </TabsTrigger>
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Cours
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Créer
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Activité Récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courses.slice(0, 5).map((course, index) => (
                      <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-medium">{course.title}</h4>
                          <p className="text-sm text-gray-600">Créé le {new Date(course.createdAt).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                      </div>
                    ))}
                    {courses.length === 0 && (
                      <p className="text-center text-gray-500 py-8">
                        Aucun cours disponible. Créez votre premier cours avec l'IA !
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Génération Automatique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Prochaine mise à jour</span>
                      <span className="text-sm text-gray-600">Dans 12h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tendances analysées</span>
                      <span className="text-sm text-gray-600">15 aujourd'hui</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Nouveaux sujets détectés</span>
                      <span className="text-sm text-gray-600">3 cette semaine</span>
                    </div>
                    <Button 
                      onClick={triggerAutoContentUpdate}
                      className="w-full mt-4"
                      variant="outline"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Forcer la mise à jour
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getDifficultyColor(course.difficulty)}>
                            {course.difficulty}
                          </Badge>
                          {course.aiGenerated && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              <Brain className="h-3 w-3 mr-1" />
                              IA
                            </Badge>
                          )}
                          {course.certification && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                              <Award className="h-3 w-3 mr-1" />
                              Certifiant
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.modules?.length || 0} modules
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Commencer le cours
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Génération de Cours par IA
                </CardTitle>
                <CardDescription>
                  Décrivez le sujet que vous souhaitez apprendre et l'IA créera un cours complet avec examens et certification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Difficulté</label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Débutant">Débutant</SelectItem>
                        <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                        <SelectItem value="Avancé">Avancé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Durée</label>
                    <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4 semaines">4 semaines</SelectItem>
                        <SelectItem value="8 semaines">8 semaines</SelectItem>
                        <SelectItem value="12 semaines">12 semaines</SelectItem>
                        <SelectItem value="16 semaines">16 semaines</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Théorique">Théorique</SelectItem>
                        <SelectItem value="Pratique">Pratique</SelectItem>
                        <SelectItem value="Mixte">Mixte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sujet du cours</label>
                  <Textarea
                    value={newCoursePrompt}
                    onChange={(e) => setNewCoursePrompt(e.target.value)}
                    placeholder="Ex: Développement d'applications React avec TypeScript et intégration d'APIs REST..."
                    className="min-h-32"
                  />
                </div>

                <Button 
                  onClick={generateNewCourse}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-2" />
                      Générer le Cours avec l'IA
                    </>
                  )}
                </Button>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">L'IA va créer automatiquement :</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Contenu détaillé avec modules et leçons</li>
                    <li>• Exercices pratiques pour chaque module</li>
                    <li>• Projets concrets à réaliser</li>
                    <li>• Examen de certification avec 20 questions</li>
                    <li>• Certificat officiel LuvviX Learn</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Certifications Disponibles
                </CardTitle>
                <CardDescription>
                  Obtenez des certifications officielles LuvviX Learn reconnues par l'industrie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {courses.filter(c => c.certification).map((course) => (
                    <Card key={course.id} className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Award className="h-6 w-6 text-yellow-600" />
                          <Badge className="bg-yellow-100 text-yellow-700">
                            Certification
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600">{course.description}</p>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Modules:</span>
                            <span className="font-medium">{course.modules?.length || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Questions d'examen:</span>
                            <span className="font-medium">{course.exam?.questions?.length || 20}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Score requis:</span>
                            <span className="font-medium text-green-600">80%</span>
                          </div>
                        </div>
                        
                        <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                          <Trophy className="h-4 w-4 mr-2" />
                          Passer l'examen
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {courses.filter(c => c.certification).length === 0 && (
                    <div className="col-span-2 text-center py-12">
                      <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        Aucune certification disponible
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Créez des cours avec l'IA pour débloquer des certifications
                      </p>
                      <Button onClick={() => setActiveTab('create')}>
                        Créer un cours
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LuvviXLearnNew;
