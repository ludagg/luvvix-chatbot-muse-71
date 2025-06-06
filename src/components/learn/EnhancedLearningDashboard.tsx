
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp, 
  Award,
  Brain,
  Calendar,
  Zap,
  Star,
  Users,
  PlayCircle,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import luvvixLearnService from "@/services/luvvix-learn-service";
import { motion } from "framer-motion";

interface EnhancedLearningDashboardProps {
  onCourseSelect?: (courseId: string) => void;
}

const EnhancedLearningDashboard = ({ onCourseSelect }: EnhancedLearningDashboardProps) => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [enrollmentsData, certificatesData, analyticsData] = await Promise.all([
        luvvixLearnService.getUserEnrollments(user.id),
        luvvixLearnService.getUserCertificates(user.id),
        luvvixLearnService.getUserAnalytics(user.id)
      ]);

      setEnrollments(enrollmentsData || []);
      setCertificates(certificatesData || []);
      setAnalytics(analyticsData || []);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalCourses: enrollments.length,
    completedCourses: enrollments.filter(e => e.progress_percentage >= 100).length,
    totalCertificates: certificates.length,
    averageProgress: enrollments.length > 0 
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / enrollments.length)
      : 0,
    totalHours: enrollments.reduce((sum, e) => sum + (e.courses?.duration_minutes || 0), 0),
    currentStreak: 7 // Simulé
  };

  const handleContinueCourse = (courseId: string) => {
    if (onCourseSelect) {
      onCourseSelect(courseId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-30" />
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">
            Bienvenue, {user?.user_metadata?.full_name || 'Apprenant'} ! 🎓
          </h1>
          <p className="text-xl opacity-90 mb-6">
            Continuez votre parcours d'apprentissage avec LuvviX Learn
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.totalCourses}</div>
              <div className="text-sm opacity-90">Cours inscrits</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.completedCourses}</div>
              <div className="text-sm opacity-90">Cours terminés</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{Math.floor(stats.totalHours / 60)}h</div>
              <div className="text-sm opacity-90">Temps d'étude</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <div className="text-3xl font-bold">{stats.currentStreak}</div>
              <div className="text-sm opacity-90">Jours consécutifs</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Progression moyenne</p>
                  <p className="text-3xl font-bold text-emerald-700">{stats.averageProgress}%</p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-full">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Certificats obtenus</p>
                  <p className="text-3xl font-bold text-blue-700">{stats.totalCertificates}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Heures d'étude</p>
                  <p className="text-3xl font-bold text-purple-700">{Math.floor(stats.totalHours / 60)}h</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Série actuelle</p>
                  <p className="text-3xl font-bold text-orange-700">{stats.currentStreak} jours</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Cours en cours */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-6 w-6 text-blue-600" />
              Vos cours en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrollments.filter(e => e.progress_percentage < 100).length === 0 ? (
              <div className="text-center py-12">
                <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun cours en cours</h3>
                <p className="text-gray-500 mb-4">Explorez notre catalogue pour commencer votre apprentissage</p>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  Découvrir les cours
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.filter(e => e.progress_percentage < 100).slice(0, 3).map((enrollment) => (
                  <motion.div
                    key={enrollment.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {enrollment.courses?.title || 'Cours sans titre'}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {enrollment.courses?.category || 'Catégorie inconnue'}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progression</span>
                              <span className="font-medium">{enrollment.progress_percentage}%</span>
                            </div>
                            <Progress value={enrollment.progress_percentage} className="h-2" />
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="ml-4"
                        onClick={() => handleContinueCourse(enrollment.course_id)}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Continuer
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievements Section */}
      {certificates.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="border-0 shadow-xl bg-gradient-to-br from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trophy className="h-6 w-6 text-yellow-600" />
                Vos accomplissements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.slice(0, 3).map((cert, index) => (
                  <motion.div
                    key={cert.id}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white rounded-lg p-4 shadow-md border border-yellow-200"
                  >
                    <div className="text-center">
                      <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-900">{cert.courses?.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(cert.issued_at).toLocaleDateString('fr-FR')}
                      </p>
                      {cert.certificate_data?.mention && (
                        <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                          {cert.certificate_data.mention}
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedLearningDashboard;
