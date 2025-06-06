
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Users, Trophy, Clock, Plus, Search, Filter, GraduationCap, Star, Play, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  duration: string;
  lessons: number;
  enrolled: number;
  rating: number;
  price: number;
  isFree: boolean;
  instructor: string;
  thumbnail: string;
  progress?: number;
  completed?: boolean;
}

const SAMPLE_COURSES: Course[] = [
  {
    id: '1',
    title: 'Marketing Digital avec l\'IA',
    description: 'Apprenez à utiliser l\'intelligence artificielle pour optimiser vos campagnes marketing et automatiser vos processus.',
    category: 'Marketing Digital',
    difficulty: 'Intermédiaire',
    duration: '8 heures',
    lessons: 12,
    enrolled: 1250,
    rating: 4.8,
    price: 99,
    isFree: false,
    instructor: 'Sophie Martin',
    thumbnail: '📱',
    progress: 65
  },
  {
    id: '2',
    title: 'Administration Moderne et Efficace',
    description: 'Maîtrisez les outils numériques et les techniques modernes d\'administration pour une productivité maximale.',
    category: 'Administration',
    difficulty: 'Débutant',
    duration: '5 heures',
    lessons: 8,
    enrolled: 890,
    rating: 4.6,
    price: 0,
    isFree: true,
    instructor: 'Jean Dubois',
    thumbnail: '📊',
    progress: 30
  },
  {
    id: '3',
    title: 'Business Intelligence et Analytics',
    description: 'Transformez vos données en insights business actionables avec les outils d\'analyse modernes.',
    category: 'Business',
    difficulty: 'Avancé',
    duration: '12 heures',
    lessons: 15,
    enrolled: 650,
    rating: 4.9,
    price: 149,
    isFree: false,
    instructor: 'Marie Claire',
    thumbnail: '📈',
    completed: true
  },
  {
    id: '4',
    title: 'Utilisation Avancée de ChatGPT',
    description: 'Découvrez comment utiliser ChatGPT et l\'IA générative pour automatiser vos tâches quotidiennes.',
    category: 'IA Générative',
    difficulty: 'Débutant',
    duration: '6 heures',
    lessons: 10,
    enrolled: 2100,
    rating: 4.7,
    price: 79,
    isFree: false,
    instructor: 'Alexandre Tech',
    thumbnail: '🤖'
  }
];

const LuvviXLearnNew = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [courses] = useState<Course[]>(SAMPLE_COURSES);

  const categories = ['Tous', 'Marketing Digital', 'Administration', 'Business', 'IA Générative'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Débutant': return 'bg-green-100 text-green-800';
      case 'Intermédiaire': return 'bg-yellow-100 text-yellow-800';
      case 'Avancé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const myCourses = courses.filter(course => course.progress !== undefined || course.completed);
  const completedCourses = courses.filter(course => course.completed).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header moderne */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="h-8 w-8" />
                <h1 className="text-3xl font-bold">LuvviX Learn</h1>
              </div>
              <p className="text-blue-100">Plateforme d'apprentissage professionnelle</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{courses.length}</div>
                <div className="text-sm text-blue-100">Cours disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">5,840</div>
                <div className="text-sm text-blue-100">Étudiants actifs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <BookOpen size={16} />
              Catalogue
            </TabsTrigger>
            <TabsTrigger value="my-courses" className="flex items-center gap-2">
              <Play size={16} />
              Mes Cours
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus size={16} />
              Créer
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center gap-2">
              <Trophy size={16} />
              Certificats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="catalog" className="mt-8">
            <div className="space-y-6">
              {/* Filtres */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher des cours..."
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Grille des cours */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-4xl">{course.thumbnail}</div>
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {course.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen size={14} />
                          {course.lessons} leçons
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          {course.enrolled}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{course.rating}</span>
                          </div>
                          <span className="text-sm text-gray-500">• {course.instructor}</span>
                        </div>
                        
                        <div className="text-right">
                          {course.isFree ? (
                            <Badge variant="outline" className="text-green-600">
                              Gratuit
                            </Badge>
                          ) : (
                            <div className="font-bold text-lg">{course.price}€</div>
                          )}
                        </div>
                      </div>
                      
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        {course.progress !== undefined ? "Continuer" : "S'inscrire"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="my-courses" className="mt-8">
            {!user ? (
              <Card className="text-center p-8">
                <CardContent>
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Connectez-vous pour voir vos cours
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Accédez à vos cours en cours et votre progression
                  </p>
                  <Button>Se connecter</Button>
                </CardContent>
              </Card>
            ) : myCourses.length === 0 ? (
              <Card className="text-center p-8">
                <CardContent>
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Aucun cours en cours
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Explorez notre catalogue pour commencer votre apprentissage
                  </p>
                  <Button onClick={() => setActiveTab('catalog')}>
                    Parcourir les cours
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-blue-700 mb-2">{myCourses.length}</h3>
                      <p className="text-gray-600">Cours actifs</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-green-700 mb-2">{completedCourses}</h3>
                      <p className="text-gray-600">Cours terminés</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Clock className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-purple-700 mb-2">42h</h3>
                      <p className="text-gray-600">Temps d'apprentissage</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Cours en cours */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myCourses.map((course) => (
                    <Card key={course.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">{course.thumbnail}</div>
                            <div>
                              <CardTitle className="text-lg">{course.title}</CardTitle>
                              <p className="text-sm text-gray-600">{course.instructor}</p>
                            </div>
                          </div>
                          {course.completed && (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {course.progress !== undefined && !course.completed && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progression</span>
                              <span className="font-medium">{course.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
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
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Créer un cours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <div className="bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Accès réservé aux créateurs
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Vous devez avoir un token d'accès valide pour créer des cours sur LuvviX Learn
                  </p>
                  
                  <div className="max-w-md mx-auto space-y-4">
                    <Input 
                      placeholder="Entrez votre token d'accès..."
                      className="text-center"
                    />
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      Valider le token
                    </Button>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                    <p>
                      <strong>Note :</strong> Seuls les examens finaux sont générés automatiquement par IA. 
                      Le contenu des cours doit être créé manuellement par les instructeurs certifiés.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedCourses > 0 ? (
                <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Trophy className="h-8 w-8 text-yellow-600" />
                      <Badge className="bg-yellow-100 text-yellow-700">
                        Certifié
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">Business Intelligence et Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Date d'obtention:</span>
                        <div className="font-medium">15 Janvier 2024</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Score:</span>
                        <div className="font-medium text-green-600">92%</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">ID de vérification:</span>
                      <div className="font-mono text-sm bg-white p-2 rounded border">
                        LXL-BI-2024-001
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
              ) : null}
              
              <Card className="border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">
                    Obtenez votre premier certificat
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Terminez un cours pour obtenir votre certificat LuvviX
                  </p>
                  <Button onClick={() => setActiveTab('catalog')}>
                    Voir les cours
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LuvviXLearnNew;
