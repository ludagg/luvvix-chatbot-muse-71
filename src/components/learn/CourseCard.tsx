
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, Brain, Trophy, Loader2 } from "lucide-react";

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

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => void;
  isEnrolled: boolean;
  progress: number;
  isEnrolling?: boolean;
}

const CourseCard = ({ course, onEnroll, isEnrolled, progress, isEnrolling = false }: CourseCardProps) => {
  const difficultyColors = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-yellow-100 text-yellow-800", 
    advanced: "bg-red-100 text-red-800"
  };

  const difficultyLabels = {
    beginner: "Débutant",
    intermediate: "Intermédiaire",
    advanced: "Avancé"
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg font-semibold line-clamp-2">
            {course.title}
          </CardTitle>
          {course.ai_generated && (
            <Badge className="bg-purple-100 text-purple-800 ml-2 flex-shrink-0">
              <Brain className="h-3 w-3 mr-1" />
              IA
            </Badge>
          )}
        </div>
        
        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
          {course.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {course.category}
          </Badge>
          <Badge className={`text-xs ${difficultyColors[course.difficulty_level]}`}>
            {difficultyLabels[course.difficulty_level]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {Math.floor(course.duration_minutes / 60)}h {course.duration_minutes % 60}min
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Multi-leçons
          </div>
        </div>

        {course.learning_objectives && course.learning_objectives.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Objectifs :</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {course.learning_objectives.slice(0, 2).map((objective, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="line-clamp-1">{objective}</span>
                </li>
              ))}
              {course.learning_objectives.length > 2 && (
                <li className="text-gray-400 text-xs">
                  +{course.learning_objectives.length - 2} autres objectifs
                </li>
              )}
            </ul>
          </div>
        )}

        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {course.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{course.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {isEnrolled ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progression</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <Button className="w-full" size="sm">
              <Trophy className="h-4 w-4 mr-2" />
              Continuer le cours
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full" 
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
              "S'inscrire"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCard;
