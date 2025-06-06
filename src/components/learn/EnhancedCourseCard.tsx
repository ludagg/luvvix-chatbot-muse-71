
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, Brain, Trophy, Loader2, Users, Star, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  learning_objectives: string[];
  prerequisites: string[];
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  ai_generated: boolean;
  created_at: string;
}

interface EnhancedCourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => void;
  onViewCourse: (courseId: string) => void;
  isEnrolled: boolean;
  progress: number;
  isEnrolling?: boolean;
  studentsCount?: number;
  rating?: number;
}

const EnhancedCourseCard = ({ 
  course, 
  onEnroll, 
  onViewCourse,
  isEnrolled, 
  progress, 
  isEnrolling = false,
  studentsCount = Math.floor(Math.random() * 1000) + 50,
  rating = 4.5 + Math.random() * 0.4
}: EnhancedCourseCardProps) => {
  const difficultyColors = {
    beginner: "bg-emerald-100 text-emerald-800 border-emerald-200",
    intermediate: "bg-amber-100 text-amber-800 border-amber-200", 
    advanced: "bg-red-100 text-red-800 border-red-200"
  };

  const difficultyLabels = {
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    advanced: "Avancé"
  };

  const categoryIcons = {
    "Informatique fondamentale": "💻",
    "Programmation Web": "🌐", 
    "Intelligence Artificielle": "🤖",
    "Base de données": "🗄️",
    "Cybersécurité": "🔒",
    "Réseaux": "🌐",
    "Développement Mobile": "📱",
    "DevOps": "⚙️",
    "Data Science": "📊",
    "Cloud Computing": "☁️"
  };

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category as keyof typeof categoryIcons] || "📚";
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="h-full hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden group">
        {/* Decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-purple-50/20 to-pink-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* AI Badge */}
        {course.ai_generated && (
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
              <Brain className="h-3 w-3 mr-1" />
              IA
            </Badge>
          </div>
        )}

        <CardHeader className="relative z-10">
          <div className="flex items-start gap-3 mb-3">
            <div className="text-2xl">{getCategoryIcon(course.category)}</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {course.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              {course.category}
            </Badge>
            <Badge className={`text-xs border ${difficultyColors[course.difficulty_level]}`}>
              {difficultyLabels[course.difficulty_level]}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.floor(course.duration_minutes / 60)}h {course.duration_minutes % 60}min
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Multi-leçons
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {studentsCount}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {rating.toFixed(1)}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10">
          {course.learning_objectives && course.learning_objectives.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">🎯 Objectifs :</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {course.learning_objectives.slice(0, 2).map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span className="line-clamp-1">{objective}</span>
                  </li>
                ))}
                {course.learning_objectives.length > 2 && (
                  <li className="text-gray-400 text-xs ml-4">
                    +{course.learning_objectives.length - 2} autres objectifs
                  </li>
                )}
              </ul>
            </div>
          )}

          {isEnrolled ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-700 font-medium">Votre progression</span>
                  <span className="font-bold text-blue-600">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-gray-200">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </Progress>
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewCourse(course.id);
                }}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Continuer le cours
              </Button>
            </div>
          ) : (
            <Button 
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white border-0 shadow-lg group-hover:shadow-xl transition-all duration-300"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEnroll(course.id);
              }}
              disabled={isEnrolling}
            >
              {isEnrolling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Inscription...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4 mr-2" />
                  S'inscrire maintenant
                </>
              )}
            </Button>
          )}

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {course.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                  #{tag}
                </Badge>
              ))}
              {course.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-500">
                  +{course.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedCourseCard;
