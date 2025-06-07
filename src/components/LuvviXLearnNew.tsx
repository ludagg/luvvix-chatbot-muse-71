
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Users, Trophy, Clock, Plus, Search, Filter, GraduationCap, Star, Play, CheckCircle, Video, FileText, Award, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import luvvixLearnService from "@/services/luvvix-learn-service";
import NewCourseCreator from "./learn/NewCourseCreator";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  instructor_name: string;
  thumbnail_url: string;
  enrollment_count: number;
  rating: number;
  price: number;
  is_free: boolean;
  what_you_will_learn: string[];
  course_material: string[];
  certificate_available: boolean;
  learning_objectives: string[];
  prerequisites: string[];
}

interface Enrollment {
  id: string;
  course_id: string;
  progress_percentage: number;
  completed_at: string | null;
  courses: Course;
}

const LuvviXLearnNew = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Tous', 'Marketing Digital', 'Administration', 'Business', 'IA Générative'];

  useEffect(() => {
    loadCourses();
    if (user) {
      loadEnrollments();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await luvvixLearnService.getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error('Erreur chargement cours:', error);
      toast.error('Erreur lors du chargement des cours');
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollments = async () => {
    if (!user?.id) return;
    
    try {
      const enrollmentsData = await luvvixLearnService.getUserEnrollments(user.id);
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Erreur chargement inscriptions:', error);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!user?.id) {
      toast.error('Veuillez vous connecter pour vous inscrire');
      return;
    }

    try {
      await luvvixLearnService.enrollInCourse(courseId, user.id);
      toast.success('Inscription réussie !');
      loadEnrollments();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'inscription');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tous' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      default: return level;
    }
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some(enrollment => enrollment.course_id === courseId);
  };

  const getEnrollmentProgress = (courseId: string) => {
    const enrollment = enrollments.find(e => e.course_id === courseId);
    return enrollment ? enrollment.progress_percentage : 0;
  };

  const completedCourses = enrollments.filter(e => e.completed_at).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header moderne inspiré d'edX */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <GraduationCap className="h-12 w-12" />
              <h1 className="text-4xl font-bold">LuvviX Learn</h1>
            </div>
            <p className="text-xl text-blue-100 mb-8">
              Développez vos compétences avec des cours professionnels certifiés
            </p>
            <div className="flex items-center justify-center gap-8 text-blue-100">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{courses.length}</div>
                <div className="text-sm">Cours disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">5,840</div>
                <div className="text-sm">Étudiants actifs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">1,200+</div>
                <div className="text-sm">Certificats délivrés</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-white rounded-lg shadow-sm p-2 mb-8">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-gray-100">
              <TabsTrigger value="catalog" className="flex items-center gap-2 data-[state=active]:bg-white">
                <BookOpen size={16} />
                <span className="hidden sm:inline">Catalogue</span>
              </TabsTrigger>
              <TabsTrigger value="my-courses" className="flex items-center gap-2 data-[state=active]:bg-white">
                <Play size={16} />
                <span className="hidden sm:inline">Mes Cours</span>
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2 data-[state=active]:bg-white">
                <Plus size={16} />
                <span className="hidden sm:inline">Créer</span>
              </TabsTrigger>
              <TabsTrigger value="certificates" className="flex items-center gap-2 data-[state=active]:bg-white">
                <Trophy size={16} />
                <span className="hidden sm:inline">Certificats</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="catalog" className="space-y-8">
            {/* Filtres de recherche */}
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher des cours par titre, description..."
                    className="pl-10 h-12"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="h-12"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grille des cours */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-4">
                      <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm overflow-hidden">
                    {/* Image du cours */}
                    <div className="relative">
                      <img 
                        src={course.thumbnail_url} 
                        alt={course.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge className={getDifficultyColor(course.difficulty_level)}>
                          {getDifficultyLabel(course.difficulty_level)}
                        </Badge>
                      </div>
                      {!course.is_free && (
                        <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1">
                          <span className="text-sm font-bold text-gray-900">{course.price}€</span>
                        </div>
                      )}
                      {course.is_free && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-green-500 text-white border-0">Gratuit</Badge>
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                          {course.category}
                        </span>
                        {course.certificate_available && (
                          <Award className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight line-clamp-2 mb-2">
                        {course.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {course.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="pt-0 space-y-4">
                      {/* Instructeur */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={14} />
                        <span>{course.instructor_name}</span>
                      </div>

                      {/* Métriques du cours */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{Math.round(course.duration_minutes / 60)}h</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{course.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{course.enrollment_count}</span>
                        </div>
                      </div>

                      {/* Progrès si inscrit */}
                      {isEnrolled(course.id) && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progression</span>
                            <span className="font-medium">{getEnrollmentProgress(course.id)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${getEnrollmentProgress(course.id)}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-2">
                        {!isEnrolled(course.id) ? (
                          <Button 
                            onClick={() => handleEnroll(course.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 h-10"
                          >
                            {course.is_free ? 'S\'inscrire gratuitement' : `S'inscrire - ${course.price}€`}
                          </Button>
                        ) : (
                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700 h-10"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Continuer le cours
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredCourses.length === 0 && !loading && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Aucun cours trouvé
                </h3>
                <p className="text-gray-500">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-courses" className="space-y-8">
            {!user ? (
              <Card className="text-center p-12">
                <CardContent>
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Connectez-vous pour voir vos cours
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Accédez à vos cours en cours et votre progression
                  </p>
                  <Button>Se connecter</Button>
                </CardContent>
              </Card>
            ) : enrollments.length === 0 ? (
              <Card className="text-center p-12">
                <CardContent>
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Aucun cours en cours
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Explorez notre catalogue pour commencer votre apprentissage
                  </p>
                  <Button onClick={() => setActiveTab('catalog')}>
                    Parcourir les cours
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Statistiques d'apprentissage */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                    <CardContent className="p-6 text-center">
                      <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-80" />
                      <h3 className="text-2xl font-bold mb-1">{enrollments.length}</h3>
                      <p className="text-blue-100 text-sm">Cours actifs</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                    <CardContent className="p-6 text-center">
                      <Trophy className="h-8 w-8 mx-auto mb-3 opacity-80" />
                      <h3 className="text-2xl font-bold mb-1">{completedCourses}</h3>
                      <p className="text-green-100 text-sm">Cours terminés</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                    <CardContent className="p-6 text-center">
                      <Clock className="h-8 w-8 mx-auto mb-3 opacity-80" />
                      <h3 className="text-2xl font-bold mb-1">42h</h3>
                      <p className="text-purple-100 text-sm">Temps d'apprentissage</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
                    <CardContent className="p-6 text-center">
                      <Award className="h-8 w-8 mx-auto mb-3 opacity-80" />
                      <h3 className="text-2xl font-bold mb-1">{completedCourses}</h3>
                      <p className="text-yellow-100 text-sm">Certificats</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Liste des cours inscrits */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {enrollments.map((enrollment) => (
                    <Card key={enrollment.id} className="hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          <img 
                            src={enrollment.courses.thumbnail_url} 
                            alt={enrollment.courses.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getDifficultyColor(enrollment.courses.difficulty_level)} variant="outline">
                                {getDifficultyLabel(enrollment.courses.difficulty_level)}
                              </Badge>
                              {enrollment.completed_at && (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <CardTitle className="text-lg mb-1">{enrollment.courses.title}</CardTitle>
                            <p className="text-sm text-gray-600">{enrollment.courses.instructor_name}</p>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {!enrollment.completed_at && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progression</span>
                              <span className="font-medium">{enrollment.progress_percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                                style={{ width: `${enrollment.progress_percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <Button 
                          className="w-full" 
                          variant={enrollment.completed_at ? "outline" : "default"}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          {enrollment.completed_at ? "Revoir le cours" : "Continuer"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-8">
            <NewCourseCreator />
          </TabsContent>

          <TabsContent value="certificates" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {completedCourses > 0 ? (
                enrollments
                  .filter(e => e.completed_at)
                  .map((enrollment) => (
                    <Card key={enrollment.id} className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Trophy className="h-8 w-8 text-yellow-600" />
                          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                            Certifié
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{enrollment.courses.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Date d'obtention:</span>
                            <div className="font-medium">
                              {new Date(enrollment.completed_at!).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-600">Score:</span>
                            <div className="font-medium text-green-600">
                              85%
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <span className="text-sm text-gray-600">ID de vérification:</span>
                          <div className="font-mono text-sm bg-white p-2 rounded border">
                            LXL-{enrollment.id.slice(0, 8).toUpperCase()}
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
                  ))
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
