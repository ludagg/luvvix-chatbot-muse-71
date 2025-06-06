
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star, BookOpen, Award } from "lucide-react";
import { Course } from "@/types/course";

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  onViewDetails?: (courseId: string) => void;
  enrolled?: boolean;
  progress?: number;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onEnroll,
  onViewDetails,
  enrolled = false,
  progress = 0
}) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Marketing Digital': return 'bg-blue-100 text-blue-800';
      case 'Intelligence Artificielle': return 'bg-purple-100 text-purple-800';
      case 'Business & Entrepreneuriat': return 'bg-green-100 text-green-800';
      case 'Administration & Gestion': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge className={getCategoryColor(course.category)}>
            {course.category}
          </Badge>
          <Badge className={getDifficultyColor(course.difficulty_level)}>
            {course.difficulty_level === 'beginner' ? 'Débutant' : 
             course.difficulty_level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
          </Badge>
        </div>
        <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {course.description}
        </p>
        
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{Math.round(course.duration_minutes / 60)}h</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen size={14} />
            <span>{course.lessons_count || 0} leçons</span>
          </div>
          {course.rating && (
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span>{course.rating}</span>
            </div>
          )}
        </div>

        {enrolled && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progression</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {course.certificate_available && (
              <Badge variant="outline" className="text-xs">
                <Award size={12} className="mr-1" />
                Certificat
              </Badge>
            )}
            {course.is_free && (
              <Badge variant="outline" className="text-xs text-green-600">
                Gratuit
              </Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            {!enrolled ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onViewDetails?.(course.id)}
                >
                  Détails
                </Button>
                <Button 
                  size="sm"
                  onClick={() => onEnroll?.(course.id)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  S'inscrire
                </Button>
              </>
            ) : (
              <Button 
                size="sm"
                onClick={() => onViewDetails?.(course.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                Continuer
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
