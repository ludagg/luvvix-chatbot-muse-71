
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, BookOpen, Brain, Trophy, Target } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import luvvixLearnService from "@/services/luvvix-learn-service";
import CourseCard from "@/components/learn/CourseCard";
import LearningDashboard from "@/components/learn/LearningDashboard";
import AILearningAssistant from "@/components/learn/AILearningAssistant";
import CourseGenerator from "@/components/learn/CourseGenerator";
import CourseViewer from "@/components/learn/CourseViewer";
import LearningMobileNav from "@/components/learn/LearningMobileNav";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";

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
  }, [selectedCategory, selectedDifficulty]);

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

    try {
      console.log('Inscription au cours:', courseId, 'utilisateur:', user.id);
      await luvvixLearnService.enrollInCourse(courseId, user.id);
      toast.success('🎉 Inscription réussie ! Commencez votre apprentissage');
      await loadData();
    } catch (error) {
      console.error('Erreur inscription:', error);
      toast.error('Erreur lors de l\'inscription au cours');
    }
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
        <title>LuvviX Learn | Plateforme d'apprentissage IA autonome</title>
        <meta name="description" content="Apprenez avec LuvviX Learn, la plateforme éducative autonome pilotée par l'IA. Cours adaptatifs, certificats numériques et parcours personnalisés." />
      </Helmet>
      
      <Navbar />
      
      <div className="pt-20 pb-16">
        {/* Header */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              LuvviX Learn
              <span className="block text-xl md:text-2xl font-normal mt-2 opacity-90">
                IA Self-Evolving Education
              </span>
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
              La première plateforme d'apprentissage entièrement autonome. 
              Notre IA génère, adapte et améliore vos cours en temps réel.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">🤖</div>
                <div className="text-sm">IA Autonome</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">📚</div>
                <div className="text-sm">Cours Adaptatifs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">🏆</div>
                <div className="text-sm">Certificats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold">🎯</div>
                <div className="text-sm">Personnalisé</div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Navigation desktop uniquement */}
            <TabsList className="hidden md:grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Tableau de bord
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Cours disponibles
              </TabsTrigger>
              <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Assistant IA
              </TabsTrigger>
              <TabsTrigger value="generator" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Générateur IA
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              {user ? (
                <LearningDashboard />
              ) : (
                <div className="text-center py-16">
                  <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Connectez-vous pour accéder à votre tableau de bord</h3>
                  <p className="text-gray-600">Suivez vos progrès, obtenez des recommandations IA personnalisées</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="courses">
              <div className="space-y-6">
                {/* Filtres et recherche */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher des cours..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-2 w-full md:w-auto">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full md:w-48">
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
                      <SelectTrigger className="w-full md:w-40">
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

                {/* Grille des cours */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                      <div key={course.id} onClick={() => setSelectedCourse(course.id)} className="cursor-pointer">
                        <CourseCard
                          course={course}
                          onEnroll={handleEnroll}
                          isEnrolled={isUserEnrolled(course.id)}
                          progress={getUserProgress(course.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {filteredCourses.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Aucun cours trouvé</h3>
                    <p className="text-gray-600">Essayez de modifier vos filtres ou demandez à l'IA de générer un nouveau cours</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ai-assistant">
              {user ? (
                <AILearningAssistant />
              ) : (
                <div className="text-center py-16">
                  <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Connectez-vous pour utiliser l'assistant IA</h3>
                  <p className="text-gray-600">Obtenez de l'aide personnalisée pour votre apprentissage</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="generator">
              <CourseGenerator onCourseGenerated={loadData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Navigation mobile en bas */}
      <LearningMobileNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <Footer />
    </div>
  );
};

export default LuvviXLearnPage;
