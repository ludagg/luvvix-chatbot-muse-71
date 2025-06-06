
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  Target, 
  BarChart3,
  Award,
  Users,
  Clock,
  Play,
  ChevronRight,
  Star,
  TrendingUp,
  Lightbulb,
  MessageCircle,
  Zap,
  GraduationCap,
  CheckCircle,
  Search,
  Filter,
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Course, CourseEnrollment, COURSE_CATEGORIES } from "@/types/course";
import CourseCard from "./learn/CourseCard";
import NewCourseCreator from "./learn/NewCourseCreator";

const LuvviXLearnNew = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Données d'exemple pour le nouveau système
  const sampleCourses: Course[] = [
    {
      id: '1',
      title: 'Marketing Digital avec Meta Ads',
      description: 'Apprenez à créer des campagnes publicitaires efficaces sur Facebook et Instagram pour développer votre business.',
      category: 'Marketing Digital',
      instructor: 'Expert LuvviX',
      duration_minutes: 240,
      difficulty_level: 'beginner',
      learning_objectives: ['Créer des campagnes Meta Ads', 'Optimiser le ROI', 'Analyser les performances'],
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
      lessons_count: 6,
      enrollment_count: 1250,
      rating: 4.8,
      is_free: true,
      certificate_available: true,
      tags: ['Facebook', 'Instagram', 'Publicité', 'ROI']
    },
    {
      id: '2',
      title: 'Introduction à ChatGPT et l\'IA Générative',
      description: 'Découvrez comment utiliser ChatGPT et les outils d\'IA pour automatiser vos tâches et améliorer votre productivité.',
      category: 'Intelligence Artificielle',
      instructor: 'Expert IA LuvviX',
      duration_minutes: 180,
      difficulty_level: 'beginner',
      learning_objectives: ['Maîtriser ChatGPT', 'Créer des prompts efficaces', 'Automatiser ses tâches'],
      created_at: '2024-01-10',
      updated_at: '2024-01-10',
      lessons_count: 5,
      enrollment_count: 2100,
      rating: 4.9,
      is_free: true,
      certificate_available: true,
      tags: ['ChatGPT', 'Prompts', 'Automatisation']
    },
    {
      id: '3',
      title: 'Créer son Business Plan en 7 Étapes',
      description: 'Guide complet pour structurer votre idée d\'entreprise et créer un business plan convaincant pour investisseurs.',
      category: 'Business & Entrepreneuriat',
      instructor: 'Coach Business LuvviX',
      duration_minutes: 360,
      difficulty_level: 'intermediate',
      learning_objectives: ['Structurer son projet', 'Analyser le marché', 'Convaincre les investisseurs'],
      created_at: '2024-01-05',
      updated_at: '2024-01-05',
      lessons_count: 8,
      enrollment_count: 850,
      rating: 4.7,
      is_free: false,
      price: 49,
      certificate_available: true,
      tags: ['Business Plan', 'Entrepreneuriat', 'Financement']
    },
    {
      id: '4',
      title: 'Excel Avancé pour l\'Analyse de Données',
      description: 'Maîtrisez les fonctions avancées d\'Excel : tableaux croisés dynamiques, macros, Power Query et visualisation de données.',
      category: 'Administration & Gestion',
      instructor: 'Expert Excel LuvviX',
      duration_minutes: 300,
      difficulty_level: 'advanced',
      learning_objectives: ['Tableaux croisés dynamiques', 'Macros VBA', 'Power Query', 'Dashboards'],
      created_at: '2024-01-20',
      updated_at: '2024-01-20',
      lessons_count: 7,
      enrollment_count: 650,
      rating: 4.6,
      is_free: true,
      certificate_available: true,
      tags: ['Excel', 'Analyse', 'Données', 'Automatisation']
    }
  ];

  const sampleEnrollments: CourseEnrollment[] = [
    {
      id: '1',
      user_id: user?.id || '',
      course_id: '1',
      progress_percentage: 75,
      completed: false,
      last_accessed: '2024-01-25',
      created_at: '2024-01-15',
      updated_at: '2024-01-25',
      courses: sampleCourses[0]
    },
    {
      id: '2',
      user_id: user?.id || '',
      course_id: '2',
      progress_percentage: 100,
      completed: true,
      last_accessed: '2024-01-20',
      created_at: '2024-01-10',
      updated_at: '2024-01-20',
      courses: sampleCourses[1]
    }
  ];

  useEffect(() => {
    if (user) {
      // Simuler le chargement des données
      setTimeout(() => {
        setCourses(sampleCourses);
        setEnrollments(sampleEnrollments);
        setLoading(false);
      }, 1000);
    }
  }, [user]);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const enrolledCourseIds = enrollments.map(e => e.course_id);
  const completedCourses = enrollments.filter(e => e.completed);
  const inProgressCourses = enrollments.filter(e => !e.completed);

  const handleEnroll = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      toast.success(`Inscription réussie au cours "${course.title}"`);
      const newEnrollment: CourseEnrollment = {
        id: Date.now().toString(),
        user_id: user?.id || '',
        course_id: courseId,
        progress_percentage: 0,
        completed: false,
        last_accessed: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        courses: course
      };
      setEnrollments(prev => [...prev, newEnrollment]);
    }
  };

  const handleViewDetails = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    const enrollment = enrollments.find(e => e.course_id === courseId);
    
    if (enrollment) {
      toast.info(`Reprise du cours "${course?.title}" à ${enrollment.progress_percentage}%`);
    } else {
      toast.info(`Affichage des détails du cours "${course?.title}"`);
    }
  };

  const handleCourseCreated = () => {
    toast.success("Nouveau cours créé avec succès !");
    setActiveTab("catalog");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Chargement de LuvviX Learn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            LuvviX Learn
          </h1>
          <p className="text-xl text-gray-600">
            Plateforme d'apprentissage intelligente avec IA
          </p>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 size={16} />
              <span className="hidden md:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <BookOpen size={16} />
              <span className="hidden md:inline">Catalogue</span>
            </TabsTrigger>
            <TabsTrigger value="my-courses" className="flex items-center gap-2">
              <GraduationCap size={16} />
              <span className="hidden md:inline">Mes Cours</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus size={16} />
              <span className="hidden md:inline">Créer</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <Trophy size={16} />
              <span className="hidden md:inline">Progrès</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cours suivis</p>
                      <p className="text-3xl font-bold">{enrollments.length}</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cours terminés</p>
                      <p className="text-3xl font-bold">{completedCourses.length}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Certificats</p>
                      <p className="text-3xl font-bold">{completedCourses.length}</p>
                    </div>
                    <Award className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Temps d'étude</p>
                      <p className="text-3xl font-bold">
                        {Math.round(enrollments.reduce((total, e) => total + (e.courses?.duration_minutes || 0) * (e.progress_percentage / 100), 0) / 60)}h
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cours en cours */}
            {inProgressCourses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Continuer l'apprentissage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inProgressCourses.map(enrollment => (
                      <div key={enrollment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{enrollment.courses?.title}</h4>
                          <div className="mt-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progression</span>
                              <span>{enrollment.progress_percentage}%</span>
                            </div>
                            <Progress value={enrollment.progress_percentage} className="h-2" />
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleViewDetails(enrollment.course_id)}
                          className="ml-4"
                        >
                          Continuer
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Catalogue */}
          <TabsContent value="catalog" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Rechercher un cours..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Toutes les catégories</option>
                {COURSE_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEnroll={handleEnroll}
                  onViewDetails={handleViewDetails}
                  enrolled={enrolledCourseIds.includes(course.id)}
                  progress={enrollments.find(e => e.course_id === course.id)?.progress_percentage || 0}
                />
              ))}
            </div>
          </TabsContent>

          {/* Mes Cours */}
          <TabsContent value="my-courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mes inscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                {enrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun cours suivi pour le moment</p>
                    <Button 
                      onClick={() => setActiveTab("catalog")}
                      className="mt-4"
                    >
                      Explorer le catalogue
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.map(enrollment => (
                      <CourseCard
                        key={enrollment.id}
                        course={enrollment.courses!}
                        onViewDetails={handleViewDetails}
                        enrolled={true}
                        progress={enrollment.progress_percentage}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Créer un cours */}
          <TabsContent value="create" className="space-y-6">
            <NewCourseCreator onCourseCreated={handleCourseCreated} />
          </TabsContent>

          {/* Progrès */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques d'apprentissage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Cours terminés</span>
                      <span className="font-bold">{completedCourses.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cours en cours</span>
                      <span className="font-bold">{inProgressCourses.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Temps total d'étude</span>
                      <span className="font-bold">
                        {Math.round(enrollments.reduce((total, e) => total + (e.courses?.duration_minutes || 0) * (e.progress_percentage / 100), 0) / 60)}h
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Certificats obtenus</CardTitle>
                </CardHeader>
                <CardContent>
                  {completedCourses.length === 0 ? (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucun certificat obtenu</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {completedCourses.map(enrollment => (
                        <div key={enrollment.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="font-medium">{enrollment.courses?.title}</p>
                            <p className="text-sm text-gray-600">Terminé le {new Date(enrollment.updated_at).toLocaleDateString()}</p>
                          </div>
                          <Award className="h-6 w-6 text-green-600" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LuvviXLearnNew;
