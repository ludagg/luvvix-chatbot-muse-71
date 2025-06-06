
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Trophy, 
  Zap, 
  BookOpen,
  Brain,
  Calendar,
  BarChart3,
  Award,
  Star,
  Activity
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import enhancedAIService from "@/services/enhanced-ai-service";
import luvvixLearnService from "@/services/luvvix-learn-service";
import { motion } from "framer-motion";

interface ProgressData {
  overall: {
    coursesEnrolled: number;
    coursesCompleted: number;
    totalTimeSpent: number;
    averageScore: number;
    completionRate: number;
  };
  recent: {
    sessionsThisWeek: number;
    timeThisWeek: number;
    lessonsCompleted: number;
    streakDays: number;
  };
  performance: {
    strongSubjects: string[];
    improvementAreas: string[];
    learningVelocity: number;
    consistencyScore: number;
  };
}

const AdvancedProgressTracker = () => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [enrollments, setEnrollments] = useState([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      const [enrollmentsData, analyticsData] = await Promise.all([
        luvvixLearnService.getUserEnrollments(user.id),
        enhancedAIService.getUserLearningAnalytics(user.id)
      ]);

      setEnrollments(enrollmentsData);
      setAnalytics(analyticsData);

      // Calculer les données de progression avancées
      const progressCalculated = calculateAdvancedProgress(enrollmentsData, analyticsData);
      setProgressData(progressCalculated);

    } catch (error) {
      console.error('Erreur chargement progression:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAdvancedProgress = (enrollments: any[], analytics: any): ProgressData => {
    const completedCourses = enrollments.filter(e => e.progress_percentage >= 100);
    const totalTimeSpent = analytics.totalTimeSpent || 0;
    const averageProgress = enrollments.length > 0 
      ? enrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / enrollments.length 
      : 0;

    // Calculer les sujets forts et les domaines d'amélioration
    const categoryPerformance = {};
    enrollments.forEach(enrollment => {
      const category = enrollment.courses?.category || 'Autre';
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = { total: 0, count: 0 };
      }
      categoryPerformance[category].total += enrollment.progress_percentage;
      categoryPerformance[category].count += 1;
    });

    const categoryAverages = Object.entries(categoryPerformance).map(([category, data]: [string, any]) => ({
      category,
      average: data.total / data.count
    }));

    const strongSubjects = categoryAverages
      .filter(cat => cat.average > 75)
      .map(cat => cat.category)
      .slice(0, 3);

    const improvementAreas = categoryAverages
      .filter(cat => cat.average < 50)
      .map(cat => cat.category)
      .slice(0, 3);

    return {
      overall: {
        coursesEnrolled: enrollments.length,
        coursesCompleted: completedCourses.length,
        totalTimeSpent: Math.floor(totalTimeSpent / 60), // en minutes
        averageScore: Math.round(averageProgress),
        completionRate: analytics.completionRate || 0
      },
      recent: {
        sessionsThisWeek: Math.min(analytics.totalSessions, 10), // Simulé
        timeThisWeek: Math.floor(totalTimeSpent / 4 / 60), // Simulé (25% du temps total)
        lessonsCompleted: completedCourses.length * 8, // Estimé 8 leçons par cours
        streakDays: 7 // Simulé
      },
      performance: {
        strongSubjects,
        improvementAreas,
        learningVelocity: Math.round((analytics.totalSessions / Math.max(enrollments.length, 1)) * 10) / 10,
        consistencyScore: Math.min(Math.round(analytics.completionRate + 20), 100)
      }
    };
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 75) return { label: 'Très bien', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 60) return { label: 'Bien', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 40) return { label: 'Satisfaisant', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { label: 'À améliorer', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <Card className="p-8 text-center">
        <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucune donnée de progression</h3>
        <p className="text-gray-500">Commencez à suivre des cours pour voir vos statistiques</p>
      </Card>
    );
  }

  const performanceLevel = getPerformanceLevel(progressData.overall.averageScore);

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Cours inscrits</p>
                <p className="text-3xl font-bold text-blue-700">{progressData.overall.coursesEnrolled}</p>
              </div>
              <BookOpen className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Cours terminés</p>
                <p className="text-3xl font-bold text-green-700">{progressData.overall.coursesCompleted}</p>
              </div>
              <Trophy className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Temps d'étude</p>
                <p className="text-3xl font-bold text-purple-700">{progressData.overall.totalTimeSpent}min</p>
              </div>
              <Clock className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Score moyen</p>
                <p className="text-3xl font-bold text-orange-700">{progressData.overall.averageScore}%</p>
              </div>
              <Target className="h-10 w-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progression détaillée */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance globale */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Performance globale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className={`inline-flex items-center px-4 py-2 rounded-full ${performanceLevel.bg}`}>
                  <Star className={`h-4 w-4 mr-2 ${performanceLevel.color}`} />
                  <span className={`font-semibold ${performanceLevel.color}`}>
                    {performanceLevel.label}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Taux de completion</span>
                    <span className="font-medium">{progressData.overall.completionRate.toFixed(0)}%</span>
                  </div>
                  <Progress value={progressData.overall.completionRate} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Vélocité d'apprentissage</span>
                    <span className="font-medium">{progressData.performance.learningVelocity}/10</span>
                  </div>
                  <Progress value={progressData.performance.learningVelocity * 10} className="h-3" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Score de régularité</span>
                    <span className="font-medium">{progressData.performance.consistencyScore}%</span>
                  </div>
                  <Progress value={progressData.performance.consistencyScore} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activité récente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Activité récente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700">{progressData.recent.sessionsThisWeek}</div>
                  <div className="text-sm text-blue-600">Sessions/semaine</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-700">{progressData.recent.timeThisWeek}min</div>
                  <div className="text-sm text-purple-600">Temps/semaine</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">{progressData.recent.lessonsCompleted}</div>
                  <div className="text-sm text-green-600">Leçons terminées</div>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Zap className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-700">{progressData.recent.streakDays}</div>
                  <div className="text-sm text-orange-600">Jours consécutifs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Forces et faiblesses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Analyse des performances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Points forts
                </h4>
                <div className="space-y-2">
                  {progressData.performance.strongSubjects.length > 0 ? (
                    progressData.performance.strongSubjects.map((subject, index) => (
                      <Badge key={index} className="bg-green-100 text-green-800 mr-2 mb-2">
                        {subject}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Continuez à apprendre pour identifier vos forces !</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Domaines d'amélioration
                </h4>
                <div className="space-y-2">
                  {progressData.performance.improvementAreas.length > 0 ? (
                    progressData.performance.improvementAreas.map((area, index) => (
                      <Badge key={index} variant="outline" className="border-orange-200 text-orange-700 mr-2 mb-2">
                        {area}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Excellentes performances dans tous les domaines !</p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                onClick={loadProgressData}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Actualiser les statistiques
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdvancedProgressTracker;
