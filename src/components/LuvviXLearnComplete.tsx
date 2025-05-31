
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Play, 
  Clock, 
  Users, 
  Star, 
  Search, 
  Filter,
  Zap,
  Trophy,
  Target,
  Brain,
  Lightbulb,
  ChevronRight,
  CheckCircle,
  PlayCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: "Débutant" | "Intermédiaire" | "Avancé";
  rating: number;
  students: number;
  image: string;
  category: string;
  lessons: number;
  progress?: number;
  price: "Gratuit" | string;
  tags: string[];
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: number;
  duration: string;
  level: string;
  icon: React.ComponentType;
  color: string;
}

const LuvviXLearnComplete = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedLevel, setSelectedLevel] = useState("Tous");

  const categories = [
    "Tous", "Développement Web", "IA & Machine Learning", "Design", 
    "Marketing Digital", "Business", "Data Science", "Cybersécurité"
  ];

  const levels = ["Tous", "Débutant", "Intermédiaire", "Avancé"];

  const learningPaths: LearningPath[] = [
    {
      id: "1",
      title: "Développeur Full-Stack",
      description: "Maîtrisez le développement web moderne de A à Z",
      courses: 12,
      duration: "6 mois",
      level: "Débutant à Avancé",
      icon: Brain,
      color: "from-blue-600 to-purple-600"
    },
    {
      id: "2", 
      title: "Expert IA & Machine Learning",
      description: "Devenez expert en intelligence artificielle",
      courses: 8,
      duration: "4 mois",
      level: "Intermédiaire",
      icon: Zap,
      color: "from-green-600 to-blue-600"
    },
    {
      id: "3",
      title: "Designer UX/UI Professionnel",
      description: "Créez des expériences utilisateur exceptionnelles",
      courses: 6,
      duration: "3 mois", 
      level: "Débutant",
      icon: Lightbulb,
      color: "from-pink-600 to-orange-600"
    }
  ];

  const featuredCourses: Course[] = [
    {
      id: "1",
      title: "React & Next.js Masterclass 2024",
      description: "Apprenez React et Next.js de zéro à expert avec des projets réels",
      instructor: "Marie Dubois",
      duration: "12h 30min",
      level: "Intermédiaire",
      rating: 4.9,
      students: 2847,
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=500&h=300",
      category: "Développement Web",
      lessons: 45,
      progress: 0,
      price: "89€",
      tags: ["React", "Next.js", "JavaScript", "Frontend"]
    },
    {
      id: "2",
      title: "Intelligence Artificielle avec Python",
      description: "Découvrez l'IA et le machine learning avec des cas pratiques",
      instructor: "Dr. Antoine Martin",
      duration: "15h 20min",
      level: "Avancé",
      rating: 4.8,
      students: 1923,
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=500&h=300",
      category: "IA & Machine Learning",
      lessons: 52,
      progress: 0,
      price: "129€",
      tags: ["Python", "AI", "Machine Learning", "TensorFlow"]
    },
    {
      id: "3",
      title: "Design System & Figma Avancé",
      description: "Créez des design systems professionnels avec Figma",
      instructor: "Sophie Laurent",
      duration: "8h 45min",
      level: "Intermédiaire",
      rating: 4.7,
      students: 1654,
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=500&h=300",
      category: "Design",
      lessons: 28,
      progress: 0,
      price: "69€",
      tags: ["Figma", "Design System", "UI/UX", "Prototyping"]
    },
    {
      id: "4",
      title: "Marketing Digital & Growth Hacking",
      description: "Stratégies avancées pour faire croître votre business en ligne",
      instructor: "Thomas Weber",
      duration: "10h 15min",
      level: "Débutant",
      rating: 4.6,
      students: 3241,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&h=300",
      category: "Marketing Digital",
      lessons: 35,
      progress: 0,
      price: "Gratuit",
      tags: ["Marketing", "SEO", "Social Media", "Analytics"]
    }
  ];

  const [myCourses] = useState<Course[]>([
    { ...featuredCourses[0], progress: 65 },
    { ...featuredCourses[1], progress: 23 },
  ]);

  const filteredCourses = featuredCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "Tous" || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              LuvviX Learn
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Transformez votre carrière avec nos formations expertes. 
              Apprenez les technologies de demain, aujourd'hui.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Rechercher des cours, instructeurs, compétences..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 text-lg rounded-full border-2 border-gray-200 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
                <div className="text-gray-600">Cours disponibles</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-purple-600 mb-2">50k+</div>
                <div className="text-gray-600">Étudiants actifs</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-green-600 mb-2">200+</div>
                <div className="text-gray-600">Instructeurs experts</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-orange-600 mb-2">95%</div>
                <div className="text-gray-600">Taux de satisfaction</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Parcours d'apprentissage</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Suivez des parcours structurés pour maîtriser de nouvelles compétences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {learningPaths.map((path, index) => {
              const IconComponent = path.icon;
              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${path.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{path.title}</h3>
                    <p className="text-gray-600 mb-4">{path.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{path.courses} cours</span>
                        <span className="text-gray-500">{path.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Niveau: {path.level}</span>
                      </div>
                    </div>
                    <Button className="w-full group-hover:bg-blue-600 transition-colors">
                      Commencer le parcours
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* My Courses (if any) */}
      {myCourses.length > 0 && (
        <section className="py-16 px-4 bg-white/50">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold mb-4">Mes cours en cours</h2>
              <p className="text-gray-600">Continuez là où vous vous êtes arrêté</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {myCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-32 h-24 object-cover"
                    />
                    <div className="p-4 flex-1">
                      <h3 className="font-semibold mb-2">{course.title}</h3>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progression</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                      </div>
                      <Button size="sm" className="w-full">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Continuer
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="py-8 px-4 bg-white/30">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filtres:</span>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 rounded-full border border-gray-300 text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-1 rounded-full border border-gray-300 text-sm"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Cours populaires</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Découvrez les cours les plus appréciés par notre communauté
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group">
                  <div className="relative">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant={course.level === "Débutant" ? "secondary" : course.level === "Intermédiaire" ? "default" : "destructive"}>
                        {course.level}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant={course.price === "Gratuit" ? "secondary" : "default"} className="bg-white text-gray-800">
                        {course.price}
                      </Badge>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <PlayCircle className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs">
                        {course.category}
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center mb-3 text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="mr-4">{course.duration}</span>
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{course.lessons} leçons</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{course.rating}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{course.students.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {course.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <Button className="w-full group-hover:bg-blue-600 transition-colors">
                      Commencer le cours
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl font-bold mb-4">Prêt à commencer votre apprentissage ?</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Rejoignez des milliers d'apprenants qui transforment leur carrière avec LuvviX Learn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Trophy className="h-5 w-5 mr-2" />
                Commencer gratuitement
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Target className="h-5 w-5 mr-2" />
                Explorer les parcours
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LuvviXLearnComplete;
