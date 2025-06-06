import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  CheckCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import luvvixLearnService from "@/services/luvvix-learn-service";
import EnhancedLearningDashboard from "./learn/EnhancedLearningDashboard";
import AdvancedProgressTracker from "./learn/AdvancedProgressTracker";
import EnhancedAIAssistant from "./learn/EnhancedAIAssistant";
import SmartCourseGenerator from "./learn/SmartCourseGenerator";
import CompletedCoursesView from "./learn/CompletedCoursesView";
import LearningMobileNav from "./learn/LearningMobileNav";
import CourseAssessment from "./learn/CourseAssessment";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  duration_minutes: number;
  difficulty_level: string;
  learning_objectives: string[];
  lessons: Lesson[];
  created_at: string;
  updated_at: string;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  lesson_order: number;
  created_at: string;
  updated_at: string;
}

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress_percentage: number;
  completed: boolean;
  last_accessed: string;
  created_at: string;
  updated_at: string;
  courses: Course;
}

const LuvviXLearnNew = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadCourses();
      loadEnrollments();
    }
  }, [user]);

  const loadCourses = async () => {
    try {
      const coursesData = await luvvixLearnService.getCourses();
      setCourses(coursesData);
    } catch (error) {
      console.error("Erreur chargement cours:", error);
      toast.error("Erreur lors du chargement des cours");
    }
  };

  const loadEnrollments = async () => {
    try {
      const enrollmentsData = await luvvixLearnService.getUserEnrollments(user.id);
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error("Erreur chargement inscriptions:", error);
      toast.error("Erreur lors du chargement des inscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setActiveTab("course-detail");
    }
  };

  const handleLessonSelect = (lessonId: string) => {
    if (selectedCourse) {
      const lesson = selectedCourse.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        setSelectedLesson(lesson);
        setActiveTab("lesson");
      }
    }
  };

  const handleAssessmentComplete = () => {
    loadEnrollments();
    setSelectedCourse(null);
    setActiveTab("completed");
  };

  const getCourseProgress = (courseId: string) => {
    const enrollment = enrollments.find((e) => e.course_id === courseId);
    return enrollment ? enrollment.progress_percentage : 0;
  };

  const isCourseCompleted = (courseId: string) => {
    const enrollment = enrollments.find((e) => e.course_id === courseId);
    return enrollment ? enrollment.completed : false;
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <EnhancedLearningDashboard onCourseSelect={handleCourseSelect} />;
      
      case "courses":
        return (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Catalogue des cours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    className="bg-white hover:shadow-md transition-shadow duration-300 border-0 shadow-sm"
                  >
                    <CardHeader className="space-y-0.5">
                      <CardTitle className="text-lg font-semibold">
                        {course.title}
                      </CardTitle>
                      <p className="text-sm text-gray-500">{course.category}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {course.instructor}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {course.duration_minutes} minutes
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <Progress
                          value={getCourseProgress(course.id)}
                          className="flex-1 mr-2 h-2"
                        />
                        <span className="text-xs text-gray-500">
                          {getCourseProgress(course.id)}%
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => handleCourseSelect(course.id)}
                      >
                        {isCourseCompleted(course.id) ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Voir le certificat
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            {getCourseProgress(course.id) > 0 ? "Continuer" : "Commencer"}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case "course-detail":
        return selectedCourse ? (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {selectedCourse.title}
                </CardTitle>
                <p className="text-gray-500">{selectedCourse.description}</p>
                <div className="flex items-center gap-2 mt-4">
                  <Badge className="bg-blue-100 text-blue-800">
                    {selectedCourse.category}
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    {selectedCourse.difficulty_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-xl font-semibold">Objectifs d'apprentissage</h3>
                <ul className="list-disc list-inside space-y-2">
                  {selectedCourse.learning_objectives.map((objective, index) => (
                    <li key={index} className="text-gray-700">
                      {objective}
                    </li>
                  ))}
                </ul>

                <h3 className="text-xl font-semibold mt-6">Leçons</h3>
                <div className="space-y-2">
                  {selectedCourse.lessons.map((lesson) => (
                    <Card
                      key={lesson.id}
                      className="bg-white hover:shadow-md transition-shadow duration-300 border-0 shadow-sm"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg font-semibold">
                          {lesson.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {lesson.content}
                        </p>
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => handleLessonSelect(lesson.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Commencer la leçon
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    variant="secondary"
                    onClick={() => setActiveTab("courses")}
                  >
                    <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                    Retour aux cours
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => setActiveTab("assessment")}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Passer l'évaluation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null;

      case "lesson":
        return selectedLesson ? (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  {selectedLesson.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                </ScrollArea>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => setActiveTab("course-detail")}
                >
                  <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
                  Retour au cours
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : null;

      case "assessment":
        return selectedCourse ? (
          <CourseAssessment 
            courseId={selectedCourse.id}
            courseName={selectedCourse.title}
            onAssessmentComplete={handleAssessmentComplete}
          />
        ) : null;

      case "progress":
        return <AdvancedProgressTracker />;

      case "ai-assistant":
        return <EnhancedAIAssistant />;

      case "generator":
        return <SmartCourseGenerator onCourseGenerated={loadEnrollments} />;

      case "completed":
        return <CompletedCoursesView />;

      default:
        return <EnhancedLearningDashboard onCourseSelect={handleCourseSelect} />;
    }
  };

  return (
    <div className="min-h-screen">
      <Tabs value={activeTab} className="w-full">
        <TabsList className="hidden md:flex">
          <TabsTrigger value="dashboard" onClick={() => setActiveTab("dashboard")}>
            <Target className="h-4 w-4 mr-2" />
            Accueil
          </TabsTrigger>
          <TabsTrigger value="courses" onClick={() => setActiveTab("courses")}>
            <BookOpen className="h-4 w-4 mr-2" />
            Cours
          </TabsTrigger>
          <TabsTrigger value="progress" onClick={() => setActiveTab("progress")}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="completed" onClick={() => setActiveTab("completed")}>
            <Award className="h-4 w-4 mr-2" />
            Diplômes
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" onClick={() => setActiveTab("ai-assistant")}>
            <Brain className="h-4 w-4 mr-2" />
            IA
          </TabsTrigger>
          <TabsTrigger value="generator" onClick={() => setActiveTab("generator")}>
            <Trophy className="h-4 w-4 mr-2" />
            Créer
          </TabsTrigger>
        </TabsList>
        <div className="md:hidden">
          <Card className="border-0 shadow-lg">
            <CardContent>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">LuvviX Learn</h2>
                <Button variant="outline" size="sm" onClick={() => setMobileNavOpen(true)}>
                  Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Tabs>

      <div className="p-6 md:p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          renderContent()
        )}
      </div>

      <LearningMobileNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default LuvviXLearnNew;
