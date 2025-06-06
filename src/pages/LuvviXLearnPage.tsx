import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, BookOpen, Brain, Trophy, Target, Sparkles, Zap, Star, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import luvvixLearnService from "@/services/luvvix-learn-service";
import EnhancedCourseCard from "@/components/learn/EnhancedCourseCard";
import EnhancedLearningDashboard from "@/components/learn/EnhancedLearningDashboard";
import EnhancedAIAssistant from "@/components/learn/EnhancedAIAssistant";
import SmartCourseGenerator from "@/components/learn/SmartCourseGenerator";
import AdvancedProgressTracker from "@/components/learn/AdvancedProgressTracker";
import CourseViewer from "@/components/learn/CourseViewer";
import LearningMobileNav from "@/components/learn/LearningMobileNav";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

const LuvviXLearnPage = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Tous");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollingCourses, setEnrollingCourses] = useState(new Set());

  const categories = [
    "Tous",
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

  const difficulties = ["Tous", "Débutant", "Intermédiaire", "Avancé"];

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedDifficulty, user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesData, enrollmentsData] = await Promise.all([
        luvvixLearnService.getCourses(
          selectedCategory === "Tous" ? undefined : selectedCategory,
          selectedDifficulty === "Tous" ? undefined : 
            selectedDifficulty === "Débutant" ? "beginner" :
            selectedDifficulty === "Intermédiaire" ? "intermediate" : "advanced"
        ),
        user ? luvvixLearnService.getUserEnrollments(user.id) : Promise.resolve([])
      ]);

      setCourses(coursesData || []);
      setEnrollments(enrollmentsData || []);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour vous inscrire à un cours');
      return;
    }

    if (enrollingCourses.has(courseId)) {
      toast.error('Inscription en cours...');
      return;
    }

    if (isUserEnrolled(courseId)) {
      toast.error('Vous êtes déjà inscrit à ce cours');
      return;
    }

    try {
      console.log('Inscription au cours:', courseId, 'utilisateur:', user.id);
      
      setEnrollingCourses(prev => new Set(prev).add(courseId));
      
      await luvvixLearnService.enrollInCourse(courseId, user.id);
      toast.success('🎉 Inscription réussie ! Commencez votre apprentissage');
      
      await loadData();
    } catch (error) {
      console.error('Erreur inscription:', error);
      if (error.message?.includes('déjà inscrit')) {
        toast.error('Vous êtes déjà inscrit à ce cours');
      } else {
        toast.error('Erreur lors de l\'inscription au cours');
      }
    } finally {
      setEnrollingCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourse(courseId);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isUserEnrolled = (courseId: string) => {
    return enrollments.some(e => e.course_id === courseId);
  };

  const getUserProgress = (courseId: string) => {
    const enrollment = enrollments.find(e => e.course_id === courseId);
    return enrollment ? enrollment.progress_percentage : 0;
  };

  if (selectedCourse) {
    return (
      <div className="min-h-screen pb-20 md:pb-0">
        <Navbar />
        <div className="pt-20 pb-16 px-4">
          <div className="container mx-auto">
            <CourseViewer 
              courseId={selectedCourse}
              onBack={() => setSelectedCourse(null)}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Helmet>
        <title>LuvviX Learn | École d'apprentissage en ligne IA révolutionnaire</title>
        <meta name="description" content="Rejoignez LuvviX Learn, l'école en ligne du futur. Cours adaptatifs générés par IA, certificats reconnus, parcours personnalisés. Transformez votre carrière avec l'éducation autonome." />
      </Helmet>
      
      <Navbar />
      
      <div className="pt-20 pb-16">
        {/* Enhanced Header */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white py-20 overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-32 h-32 bg-purple-400 rounded-full blur-xl animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-pink-400 rounded-full blur-xl animate-pulse delay-2000"></div>
          </div>
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-8 w-8 text-yellow-400" />
                <span className="text-yellow-400 font-semibold text-lg">École en ligne certifiée</span>
                <Sparkles className="h-8 w-8 text-yellow-400" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                LuvviX Learn
              </h1>
              
              <p className="text-xl md:text-2xl mb-2 font-medium">
                🚀 L'École du Futur • 100% IA Autonome
              </p>
              
              <p className="text-lg md:text-xl mb-8 max-w-4xl mx-auto opacity-90">
                Rejoignez la révolution éducative ! Notre IA génère, adapte et améliore vos cours en temps réel. 
                Obtenez des certificats reconnus et transformez votre carrière.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-2">🤖</div>
                <div className="font-semibold">IA Autonome</div>
                <div className="text-sm opacity-80">Cours auto-générés</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-2">📚</div>
                <div className="font-semibold">Adaptatif</div>
                <div className="text-sm opacity-80">Personnalisé pour vous</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-2">🏆</div>
                <div className="font-semibold">Certifié</div>
                <div className="text-sm opacity-80">Diplômes reconnus</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-2">⚡</div>
                <div className="font-semibold">Instantané</div>
                <div className="text-sm opacity-80">Résultats immédiats</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold px-8 py-4 text-lg shadow-2xl"
                onClick={() => setActiveTab("courses")}
              >
                <Star className="h-5 w-5 mr-2" />
                Commencer maintenant
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg backdrop-blur-sm"
                onClick={() => setActiveTab("generator")}
              >
                <Zap className="h-5 w-5 mr-2" />
                Créer un cours IA
              </Button>
            </motion.div>
          </div>
        </motion.section>

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Navigation desktop */}
            <TabsList className="hidden md:grid w-full grid-cols-5 mb-8 bg-gradient-to-r from-gray-100 to-blue-50 border-0 p-2 rounded-2xl">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg">
                <Target className="h-4 w-4" />
                Tableau de bord
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg">
                <BookOpen className="h-4 w-4" />
                Catalogue
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg">
                <BarChart3 className="h-4 w-4" />
                Progression
              </TabsTrigger>
              <TabsTrigger value="ai-assistant" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg">
                <Brain className="h-4 w-4" />
                Assistant IA
              </TabsTrigger>
              <TabsTrigger value="generator" className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-lg">
                <Trophy className="h-4 w-4" />
                Créateur IA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              {user ? (
                <EnhancedLearningDashboard onCourseSelect={handleCourseSelect} />
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl"
                >
                  <Brain className="h-20 w-20 text-blue-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Connectez-vous pour accéder à votre tableau de bord</h3>
                  <p className="text-gray-600 mb-6 text-lg">Suivez vos progrès, obtenez des recommandations IA personnalisées</p>
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    Se connecter
                  </Button>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="courses">
              <div className="space-y-8">
                {/* Enhanced Filters */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-0"
                >
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        placeholder="Rechercher votre cours idéal..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 border-0 bg-gray-50 rounded-xl text-lg"
                      />
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full md:w-48 h-12 border-0 bg-gray-50 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                        <SelectTrigger className="w-full md:w-40 h-12 border-0 bg-gray-50 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map(difficulty => (
                            <SelectItem key={difficulty} value={difficulty}>
                              {difficulty}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>

                {/* Course Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-2xl"></div>
                    ))}
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  >
                    {filteredCourses.map((course, index) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedCourse(course.id)} 
                        className="cursor-pointer"
                      >
                        <EnhancedCourseCard
                          course={course}
                          onEnroll={handleEnroll}
                          onViewCourse={setSelectedCourse}
                          isEnrolled={isUserEnrolled(course.id)}
                          progress={getUserProgress(course.id)}
                          isEnrolling={enrollingCourses.has(course.id)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {filteredCourses.length === 0 && !loading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl"
                  >
                    <BookOpen className="h-20 w-20 text-orange-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold mb-4">Aucun cours trouvé</h3>
                    <p className="text-gray-600 mb-6">Essayez de modifier vos filtres ou demandez à l'IA de générer un nouveau cours</p>
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                      onClick={() => setActiveTab("generator")}
                    >
                      <Zap className="h-5 w-5 mr-2" />
                      Créer un cours personnalisé
                    </Button>
                  </motion.div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="progress">
              {user ? (
                <AdvancedProgressTracker />
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 bg-gradient-to-br from-green-50 to-teal-50 rounded-3xl"
                >
                  <BarChart3 className="h-20 w-20 text-green-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Connectez-vous pour voir vos statistiques</h3>
                  <p className="text-gray-600 mb-6">Suivez votre progression détaillée et vos performances</p>
                  <Button size="lg" className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                    Se connecter
                  </Button>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="ai-assistant">
              {user ? (
                <EnhancedAIAssistant />
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl"
                >
                  <Brain className="h-20 w-20 text-purple-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Connectez-vous pour utiliser l'assistant IA</h3>
                  <p className="text-gray-600 mb-6">Obtenez de l'aide personnalisée pour votre apprentissage</p>
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    Se connecter
                  </Button>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="generator">
              <SmartCourseGenerator onCourseGenerated={loadData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <LearningMobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <Footer />
    </div>
  );
};

export default LuvviXLearnPage;
