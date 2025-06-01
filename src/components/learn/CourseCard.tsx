
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Users, Star, Play } from "lucide-react";
import { Course } from "@/services/luvvix-learn-service";

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => void;
  isEnrolled?: boolean;
  progress?: number;
}

const CourseCard = ({ course, onEnroll, isEnrolled, progress }: CourseCardProps) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <Badge className={getDifficultyColor(course.difficulty_level)}>
            {getDifficultyLabel(course.difficulty_level)}
          </Badge>
          {course.ai_generated && (
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              🤖 LuvviX AI
            </Badge>
          )}
        </div>
        
        <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {course.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{Math.floor(course.duration_minutes / 60)}h {course.duration_minutes % 60}min</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.category}</span>
            </div>
          </div>
        </div>

        {course.learning_objectives.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Objectifs:</p>
            <ul className="text-xs text-gray-600">
              {course.learning_objectives.slice(0, 2).map((objective, index) => (
                <li key={index} className="mb-1">• {objective}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mb-4">
          {course.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {isEnrolled && progress !== undefined ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <Button className="w-full mt-3">
              <Play className="h-4 w-4 mr-2" />
              Continuer le cours
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full group-hover:bg-blue-600 transition-colors"
            onClick={() => onEnroll(course.id)}
          >
            Commencer le cours
          </Button>
        )}
      </div>
    </Card>
  );
};

export default CourseCard;
