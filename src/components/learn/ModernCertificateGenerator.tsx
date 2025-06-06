
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Award, Star, Shield, Verified } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface CertificateData {
  student_name: string;
  course_title: string;
  course_category: string;
  completion_date: string;
  score: number;
  mention: string;
  certificate_id: string;
  verification_code: string;
}

interface ModernCertificateGeneratorProps {
  userId: string;
  courseId: string;
  courseName: string;
  finalScore: number;
  onGenerated?: () => void;
}

const ModernCertificateGenerator = ({
  userId,
  courseId,
  courseName,
  finalScore,
  onGenerated
}: ModernCertificateGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);

  const generateCertificate = async () => {
    setIsGenerating(true);
    try {
      console.log('🏆 Génération du certificat moderne...');

      // Récupérer le profil utilisateur
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      // Déterminer la mention
      let mention = 'Insuffisant';
      if (finalScore >= 16) mention = 'Très Bien';
      else if (finalScore >= 14) mention = 'Bien';
      else if (finalScore >= 12) mention = 'Assez Bien';
      else if (finalScore >= 10) mention = 'Passable';

      // Récupérer les informations du cours
      const { data: course } = await supabase
        .from('courses')
        .select('title, category')
        .eq('id', courseId)
        .single();

      const verificationCode = `LUVVIX-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const certificateData: CertificateData = {
        student_name: userProfile?.full_name || 'Étudiant LuvviX',
        course_title: course?.title || courseName,
        course_category: course?.category || 'Formation',
        completion_date: new Date().toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        score: finalScore,
        mention,
        certificate_id: `CERT-${Date.now()}`,
        verification_code: verificationCode
      };

      // Sauvegarder dans la base de données
      const { data: certificate, error } = await supabase
        .from('certificates')
        .insert({
          user_id: userId,
          course_id: courseId,
          certificate_data: certificateData,
          verification_code: verificationCode,
          issued_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCertificateData(certificateData);
      toast.success('🎉 Certificat généré avec succès !');
      
      if (onGenerated) {
        onGenerated();
      }
    } catch (error) {
      console.error('❌ Erreur génération certificat:', error);
      toast.error('Erreur lors de la génération du certificat');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCertificate = () => {
    if (!certificateData) return;

    const certificateHTML = generateCertificateHTML(certificateData);
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificat-luvvix-${certificateData.certificate_id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('📥 Certificat téléchargé !');
  };

  const generateCertificateHTML = (data: CertificateData) => {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificat LuvviX - ${data.student_name}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .certificate {
            background: white;
            width: 800px;
            height: 600px;
            position: relative;
            border-radius: 20px;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            overflow: hidden;
        }
        
        .certificate::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 120px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            clip-path: polygon(0 0, 100% 0, 100% 70%, 0 100%);
        }
        
        .header {
            position: relative;
            z-index: 2;
            padding: 40px 60px 30px;
            text-align: center;
        }
        
        .logo {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        
        .logo-icon {
            width: 50px;
            height: 50px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 20px;
            color: #667eea;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .logo-text {
            color: white;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: 2px;
        }
        
        .certificate-title {
            font-family: 'Playfair Display', serif;
            font-size: 36px;
            font-weight: 700;
            color: #2d3748;
            margin: 30px 0 20px;
            text-transform: uppercase;
            letter-spacing: 3px;
        }
        
        .content {
            padding: 0 60px;
            text-align: center;
        }
        
        .proclamation {
            font-size: 18px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        .student-name {
            font-family: 'Playfair Display', serif;
            font-size: 42px;
            font-weight: 700;
            color: #667eea;
            margin: 20px 0;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .course-info {
            margin: 30px 0;
        }
        
        .course-title {
            font-size: 24px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 10px;
        }
        
        .course-category {
            font-size: 16px;
            color: #718096;
            font-style: italic;
        }
        
        .achievement {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin: 30px 0;
        }
        
        .achievement-item {
            text-align: center;
        }
        
        .achievement-value {
            font-size: 28px;
            font-weight: 700;
            color: #667eea;
        }
        
        .achievement-label {
            font-size: 14px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .footer {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 30px 60px;
            display: flex;
            justify-content: space-between;
            align-items: end;
        }
        
        .signature {
            text-align: center;
        }
        
        .signature-line {
            width: 200px;
            height: 2px;
            background: #e2e8f0;
            margin: 20px 0 10px;
        }
        
        .signature-name {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 5px;
        }
        
        .signature-title {
            font-size: 12px;
            color: #718096;
        }
        
        .verification {
            text-align: right;
            font-size: 12px;
            color: #718096;
        }
        
        .verification-code {
            font-family: monospace;
            background: #f7fafc;
            padding: 8px 12px;
            border-radius: 6px;
            margin-top: 5px;
            display: inline-block;
        }
        
        .decorative-elements {
            position: absolute;
            top: 150px;
            left: 40px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
            border-radius: 50%;
            opacity: 0.1;
        }
        
        .decorative-elements::after {
            content: '';
            position: absolute;
            top: 300px;
            right: -680px;
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            opacity: 0.1;
        }
        
        @media print {
            body {
                background: white;
            }
            .certificate {
                box-shadow: none;
                border: 2px solid #e2e8f0;
            }
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="decorative-elements"></div>
        
        <div class="header">
            <div class="logo">
                <div class="logo-icon">
                    VIX
                </div>
                <div class="logo-text">LUVVIX</div>
            </div>
        </div>
        
        <div class="content">
            <h1 class="certificate-title">Certificat de Réussite</h1>
            
            <p class="proclamation">
                Il est certifié par les présentes que
            </p>
            
            <div class="student-name">${data.student_name}</div>
            
            <p class="proclamation">
                a complété avec succès la formation
            </p>
            
            <div class="course-info">
                <div class="course-title">${data.course_title}</div>
                <div class="course-category">${data.course_category}</div>
            </div>
            
            <div class="achievement">
                <div class="achievement-item">
                    <div class="achievement-value">${data.score}/20</div>
                    <div class="achievement-label">Score Final</div>
                </div>
                <div class="achievement-item">
                    <div class="achievement-value">${data.mention}</div>
                    <div class="achievement-label">Mention</div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <div class="signature">
                <div class="signature-line"></div>
                <div class="signature-name">Ludovic Aggaï</div>
                <div class="signature-title">Fondateur & PDG, LuvviX</div>
            </div>
            
            <div class="verification">
                <div>Délivré le ${data.completion_date}</div>
                <div>ID: ${data.certificate_id}</div>
                <div class="verification-code">${data.verification_code}</div>
            </div>
        </div>
    </div>
</body>
</html>`;
  };

  if (certificateData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full">
                <Award className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              🎉 Félicitations !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-lg text-gray-700">
                Votre certificat <span className="font-bold text-orange-600">LuvviX</span> a été généré avec succès !
              </p>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-orange-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-orange-600">
                    <Shield className="h-5 w-5" />
                    <span className="font-semibold">Certificat Vérifié</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Étudiant:</span>
                      <p className="font-semibold">{certificateData.student_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Score:</span>
                      <p className="font-semibold text-green-600">{certificateData.score}/20</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Mention:</span>
                      <p className="font-semibold text-orange-600">{certificateData.mention}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <p className="font-semibold">{certificateData.completion_date}</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-orange-200">
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <Verified className="h-4 w-4" />
                      <span>Code: {certificateData.verification_code}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button
                onClick={downloadCertificate}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger le Certificat
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                🏆 Certificat délivré par <span className="font-bold">LuvviX Learn</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Signé électroniquement par Ludovic Aggaï, Fondateur & PDG
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-600" />
          Générer votre Certificat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">Score: {finalScore}/20</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-green-600">Réussi !</span>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              Félicitations ! Vous avez terminé le cours avec succès. 
              Générez votre certificat officiel LuvviX signé par le PDG.
            </p>
          </div>
          
          <Button
            onClick={generateCertificate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-3"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Génération en cours...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Générer mon Certificat LuvviX
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernCertificateGenerator;
