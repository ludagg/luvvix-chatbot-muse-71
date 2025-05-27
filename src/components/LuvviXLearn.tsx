
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Zap
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  duration: string;
  modules: number;
  progress: number;
  completed: boolean;
  rating: number;
  enrolledStudents: number;
  aiGenerated: boolean;
  certification: boolean;
}

interface Certificate {
  id: string;
  courseTitle: string;
  issueDate: string;
  score: number;
  verificationId: string;
}

const LuvviXLearn: React.FC = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [courses] = useState<Course[]>([
    {
      id: '1',
      title: 'Développement Web Frontend avec React',
      description: 'Maîtrisez React, TypeScript et les outils modernes du développement frontend',
      category: 'Frontend',
      difficulty: 'Intermédiaire',
      duration: '12 semaines',
      modules: 24,
      progress: 65,
      completed: false,
      rating: 4.8,
      enrolledStudents: 1250,
      aiGenerated: true,
      certification: true
    },
    {
      id: '2',
      title: 'Backend Development avec Node.js',
      description: 'Créez des APIs robustes et scalables avec Node.js et Express',
      category: 'Backend',
      difficulty: 'Avancé',
      duration: '16 semaines',
      modules: 32,
      progress: 30,
      completed: false,
      rating: 4.9,
      enrolledStudents: 890,
      aiGenerated: true,
      certification: true
    },
    {
      id: '3',
      title: 'Introduction à l\'Intelligence Artificielle',
      description: 'Découvrez les fondamentaux de l\'IA et du Machine Learning',
      category: 'IA',
      difficulty: 'Débutant',
      duration: '8 semaines',
      modules: 16,
      progress: 100,
      completed: true,
      rating: 4.7,
      enrolledStudents: 2100,
      aiGenerated: true,
      certification: true
    },
    {
      id: '4',
      title: 'DevOps et Cloud Computing',
      description: 'Automatisation, déploiement et gestion d\'infrastructure cloud',
      category: 'DevOps',
      difficulty: 'Avancé',
      duration: '14 semaines',
      modules: 28,
      progress: 0,
      completed: false,
      rating: 4.6,
      enrolledStudents: 650,
      aiGenerated: true,
      certification: true
    }
  ]);

  const [certificates] = useState<Certificate[]>([
    {
      id: 'cert-1',
      courseTitle: 'Introduction à l\'Intelligence Artificielle',
      issueDate: '2024-01-15',
      score: 92,
      verificationId: 'LXL-AI-2024-001'
    }
  ]);

  const categories = ['all', 'Frontend', 'Backend', 'IA', 'DevOps', 'Mobile'];

  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-100 text-green-700';
      case 'Intermédiaire': return 'bg-yellow-100 text-yellow-700';
      case 'Avancé': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalProgress = Math.round(
    courses.reduce((acc, course) => acc + course.progress, 0) / courses.length
  );

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
            Plateforme d'apprentissage intelligente avec contenu généré automatiquement par IA et certifications officielles
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
              <div className="text-sm text-gray-600">Cours Actifs</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{certificates.length}</div>
              <div className="text-sm text-gray-600">Certifications</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{totalProgress}%</div>
              <div className="text-sm text-gray-600">Progression Globale</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">5,890</div>
              <div className="text-sm text-gray-600">Étudiants Total</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="courses" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Mes Cours
            </TabsTrigger>
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Catalogue
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progression
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.filter(course => course.progress > 0).map((course) => (
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
                      {course.completed && (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      )}
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
                        {course.modules} modules
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progression</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    
                    <Button 
                      className="w-full" 
                      variant={course.completed ? "outline" : "default"}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {course.completed ? "Revoir le cours" : "Continuer"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="catalog" className="space-y-6">
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category === 'all' ? 'Tous' : category}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
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
                        {course.modules} modules
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{course.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.enrolledStudents.toLocaleString()} étudiants</span>
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      {course.progress > 0 ? "Continuer" : "S'inscrire"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Tableau de Bord de Progression
                </CardTitle>
                <CardDescription>
                  Suivez vos progrès et performances d'apprentissage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Progression par Cours</h3>
                    {courses.filter(c => c.progress > 0).map((course) => (
                      <div key={course.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{course.title}</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Statistiques</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {courses.filter(c => c.completed).length}
                        </div>
                        <div className="text-sm text-blue-700">Cours Terminés</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {courses.filter(c => c.progress > 0 && !c.completed).length}
                        </div>
                        <div className="text-sm text-green-700">En Cours</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">
                          {Math.round(courses.reduce((acc, c) => acc + c.rating, 0) / courses.length * 10) / 10}
                        </div>
                        <div className="text-sm text-yellow-700">Note Moyenne</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {certificates.length}
                        </div>
                        <div className="text-sm text-purple-700">Certifications</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <Card key={cert.id} className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Award className="h-8 w-8 text-yellow-600" />
                      <Badge className="bg-yellow-100 text-yellow-700">
                        Certifié
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{cert.courseTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Date d'émission:</span>
                        <div className="font-medium">
                          {new Date(cert.issueDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Score:</span>
                        <div className="font-medium text-green-600">{cert.score}%</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">ID de vérification:</span>
                      <div className="font-mono text-sm bg-white p-2 rounded border">
                        {cert.verificationId}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Télécharger PDF
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Partager
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Prochaine Certification
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Terminez vos cours en cours pour obtenir de nouvelles certifications
                  </p>
                  <Button>Voir mes cours</Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LuvviXLearn;
