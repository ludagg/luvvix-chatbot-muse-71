
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Award, 
  Calendar, 
  Download,
  BookOpen,
  Star,
  GraduationCap,
  Medal
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import luvvixLearnService from "@/services/luvvix-learn-service";
import CertificateGenerator from "./CertificateGenerator";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface CompletedCourse {
  id: string;
  course_id: string;
  courses: any;
  completed: boolean;
}

interface Certificate {
  id: string;
  course_id: string;
  certificate_data: any;
  verification_code: string;
  issued_at: string;
}

const CompletedCoursesView = () => {
  const { user } = useAuth();
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCompletedCourses();
      loadCertificates();
    }
  }, [user]);

  const loadCompletedCourses = async () => {
    try {
      const courses = await luvvixLearnService.getCompletedCourses(user.id);
      setCompletedCourses(courses);
    } catch (error) {
      console.error('Erreur chargement cours terminés:', error);
    }
  };

  const loadCertificates = async () => {
    try {
      const certs = await luvvixLearnService.getUserCertificates(user.id);
      setCertificates(certs);
    } catch (error) {
      console.error('Erreur chargement certificats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async (courseId: string) => {
    try {
      await luvvixLearnService.generateCertificate(user.id, courseId);
      await loadCertificates();
      toast.success('Certificat généré avec succès !');
    } catch (error: any) {
      console.error('Erreur génération certificat:', error);
      toast.error(error.message || 'Erreur lors de la génération du certificat');
    }
  };

  const getCertificateForCourse = (courseId: string) => {
    return certificates.find(cert => cert.course_id === courseId);
  };

  const getMentionColor = (mention: string) => {
    switch (mention?.toLowerCase()) {
      case 'très bien':
        return 'bg-green-500';
      case 'bien':
        return 'bg-blue-500';
      case 'assez bien':
        return 'bg-yellow-500';
      case 'passable':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedCertificate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => setSelectedCertificate(null)}
          >
            ← Retour aux cours terminés
          </Button>
        </div>
        
        <CertificateGenerator
          certificate={selectedCertificate.certificate_data}
          onDownload={() => toast.success('Certificat téléchargé !')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-4"
        >
          <GraduationCap className="h-8 w-8 text-yellow-600" />
          <h2 className="text-3xl font-bold text-gray-900">Mes Cours Terminés</h2>
          <Medal className="h-8 w-8 text-yellow-600" />
        </motion.div>
        <p className="text-gray-600">
          Félicitations ! Voici tous les cours que vous avez terminés avec succès.
        </p>
      </div>

      {/* Statistiques */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <Trophy className="h-10 w-10 text-green-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-green-700 mb-1">
              {completedCourses.length}
            </div>
            <div className="text-green-600 font-medium">Cours terminés</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <Award className="h-10 w-10 text-blue-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-blue-700 mb-1">
              {certificates.length}
            </div>
            <div className="text-blue-600 font-medium">Certificats obtenus</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <Star className="h-10 w-10 text-yellow-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-yellow-700 mb-1">
              {certificates.filter(c => c.certificate_data.mention === 'Très Bien').length}
            </div>
            <div className="text-yellow-600 font-medium">Mentions Très Bien</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Liste des cours terminés */}
      {completedCourses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucun cours terminé</h3>
          <p className="text-gray-500">
            Terminez vos premiers cours en réussissant leurs évaluations pour voir vos accomplissements ici.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {completedCourses.map((course, index) => {
            const certificate = getCertificateForCourse(course.course_id);
            const hasCertificate = !!certificate;
            
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {course.courses?.title || 'Cours'}
                        </CardTitle>
                        <Badge className="mb-2" variant="outline">
                          {course.courses?.category || 'Général'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-600" />
                        <Badge className="bg-green-100 text-green-800">
                          Terminé
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {course.courses?.description || 'Description du cours'}
                    </p>
                    
                    {hasCertificate && (
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Certificat obtenu</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-yellow-700">
                              Note: {certificate.certificate_data.score}/20
                            </span>
                            <Badge 
                              className={`text-white ${getMentionColor(certificate.certificate_data.mention)}`}
                            >
                              {certificate.certificate_data.mention}
                            </Badge>
                          </div>
                          <div className="text-xs text-yellow-600">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {new Date(certificate.issued_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {hasCertificate ? (
                        <Button
                          onClick={() => setSelectedCertificate(certificate)}
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                        >
                          <Award className="h-4 w-4 mr-2" />
                          Voir le certificat
                        </Button>
                      ) : (
                        <Button
                          onClick={() => generateCertificate(course.course_id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Générer le certificat
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompletedCoursesView;
