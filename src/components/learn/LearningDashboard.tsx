
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Trophy, 
  Clock, 
  TrendingUp, 
  Brain,
  Target,
  Award,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import luvvixLearnService from "@/services/luvvix-learn-service";
import { toast } from "sonner";

const LearningDashboard = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
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
      const [enrollmentsData, certificatesData, pathsData, analyticsData] = await Promise.all([
        luvvixLearnService.getUserEnrollments(user.id),
        luvvixLearnService.getUserCertificates(user.id),
        luvvixLearnService.getUserLearningPaths(user.id),
        luvvixLearnService.getUserAnalytics(user.id)
      ]);

      setEnrollments(enrollmentsData || []);
      setCertificates(certificatesData || []);
      setLearningPaths(pathsData || []);
      setAnalytics(analyticsData || []);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const generateAdaptivePath = async () => {
    try {
      await luvvixLearnService.generateAdaptivePath(user.id);
      toast.success('Parcours adaptatif généré par LuvviX AI !');
      loadDashboardData();
    } catch (error) {
      toast.error('Erreur lors de la génération du parcours');
    }
  };

  const activeCourses = enrollments.filter(e => !e.completed_at);
  const completedCourses = enrollments.filter(e => e.completed_at);
  const averageProgress = enrollments.length > 0 
    ? enrollments.reduce((sum, e) => sum + e.progress_percentage, 0) / enrollments.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cours en cours</p>
              <p className="text-2xl font-bold text-blue-600">{activeCourses.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cours terminés</p>
              <p className="text-2xl font-bold text-green-600">{completedCourses.length}</p>
            </div>
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Certificats</p>
              <p className="text-2xl font-bold text-purple-600">{certificates.length}</p>
            </div>
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Progression moyenne</p>
              <p className="text-2xl font-bold text-orange-600">{averageProgress.toFixed(0)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Cours en cours */}
      {activeCourses.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Mes cours en cours
          </h3>
          <div className="space-y-4">
            {activeCourses.slice(0, 3).map((enrollment) => (
              <div key={enrollment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{enrollment.courses.title}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <Badge variant="outline">
                      {enrollment.courses.difficulty_level === 'beginner' ? 'Débutant' :
                       enrollment.courses.difficulty_level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                    </Badge>
                    <span>{enrollment.courses.category}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progression</span>
                      <span>{enrollment.progress_percentage}%</span>
                    </div>
                    <Progress value={enrollment.progress_percentage} className="h-2" />
                  </div>
                </div>
                <Button className="ml-4">
                  Continuer
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Parcours d'apprentissage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Parcours d'apprentissage
          </h3>
          {learningPaths.length > 0 ? (
            <div className="space-y-3">
              {learningPaths.map((path) => (
                <div key={path.id} className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">{path.name}</h4>
                  <p className="text-sm text-blue-700 mt-1">{path.description}</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">
                    🤖 Généré par LuvviX AI
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">Aucun parcours personnalisé</p>
              <Button onClick={generateAdaptivePath} className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Zap className="h-4 w-4 mr-2" />
                Générer un parcours IA
              </Button>
            </div>
          )}
        </Card>

        {/* Certificats récents */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Mes certificats
          </h3>
          {certificates.length > 0 ? (
            <div className="space-y-3">
              {certificates.slice(0, 3).map((cert) => (
                <div key={cert.id} className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">{cert.courses.title}</h4>
                  <p className="text-sm text-green-700">
                    Obtenu le {new Date(cert.issued_at).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Code: {cert.verification_code}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Aucun certificat obtenu</p>
              <p className="text-sm text-gray-500">Terminez des cours pour obtenir vos premiers certificats !</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LearningDashboard;
