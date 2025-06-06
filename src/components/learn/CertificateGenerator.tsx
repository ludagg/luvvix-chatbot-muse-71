
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Award, 
  Calendar, 
  User, 
  GraduationCap,
  Printer,
  Share2,
  Star
} from "lucide-react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Certificate {
  id: string;
  student_name: string;
  course_title: string;
  course_category: string;
  score: number;
  mention: string;
  issued_date: string;
  verification_code: string;
  signed_by: string;
  signed_title: string;
}

interface CertificateGeneratorProps {
  certificate: Certificate;
  onDownload?: () => void;
}

const CertificateGenerator = ({ certificate, onDownload }: CertificateGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const getMentionColor = (mention: string) => {
    switch (mention.toLowerCase()) {
      case 'très bien':
        return 'text-green-600 bg-green-100';
      case 'bien':
        return 'text-blue-600 bg-blue-100';
      case 'assez bien':
        return 'text-yellow-600 bg-yellow-100';
      case 'passable':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMentionStars = (mention: string) => {
    switch (mention.toLowerCase()) {
      case 'très bien':
        return 5;
      case 'bien':
        return 4;
      case 'assez bien':
        return 3;
      case 'passable':
        return 2;
      default:
        return 1;
    }
  };

  const downloadPDF = async () => {
    if (!certificateRef.current) return;

    try {
      setIsGenerating(true);
      
      // Configuration pour une meilleure qualité
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 1200,
        height: 850
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificat_${certificate.course_title.replace(/\s+/g, '_')}_${certificate.student_name.replace(/\s+/g, '_')}.pdf`);
      
      if (onDownload) onDownload();
    } catch (error) {
      console.error('Erreur génération PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!certificateRef.current) return;

    try {
      setIsGenerating(true);
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `Certificat_${certificate.course_title.replace(/\s+/g, '_')}_${certificate.student_name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      if (onDownload) onDownload();
    } catch (error) {
      console.error('Erreur génération image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareOnSocial = () => {
    const text = `Je viens de terminer avec succès le cours "${certificate.course_title}" sur LuvviX Learn avec mention ${certificate.mention} ! 🎓✨`;
    const url = `https://luvvix.com/verify/${certificate.verification_code}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Mon nouveau certificat LuvviX Learn',
        text: text,
        url: url
      });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-600" />
            Votre Certificat de Réussite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={downloadPDF}
              disabled={isGenerating}
              className="bg-red-600 hover:bg-red-700"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Génération...' : 'Télécharger PDF'}
            </Button>
            
            <Button
              onClick={downloadImage}
              disabled={isGenerating}
              variant="outline"
            >
              <Printer className="h-4 w-4 mr-2" />
              Télécharger Image
            </Button>
            
            <Button
              onClick={shareOnSocial}
              variant="outline"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificat */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div
          ref={certificateRef}
          className="bg-white p-12 border-8 border-double border-yellow-600 rounded-lg shadow-2xl"
          style={{ 
            width: '1200px', 
            height: '850px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            fontFamily: 'serif'
          }}
        >
          {/* Header décoratif */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-1 bg-yellow-600 mr-4"></div>
              <GraduationCap className="h-12 w-12 text-yellow-600" />
              <div className="w-16 h-1 bg-yellow-600 ml-4"></div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">CERTIFICAT DE RÉUSSITE</h1>
            <div className="text-lg text-gray-600">LuvviX Learn - Plateforme d'Apprentissage IA</div>
          </div>

          {/* Corps du certificat */}
          <div className="text-center space-y-8">
            <div className="text-xl text-gray-700 leading-relaxed">
              Il est certifié par les présentes que
            </div>

            <div className="text-5xl font-bold text-blue-800 mb-4">
              {certificate.student_name}
            </div>

            <div className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              a terminé avec succès le cours
            </div>

            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h2 className="text-3xl font-bold text-blue-800 mb-2">
                {certificate.course_title}
              </h2>
              <Badge className="bg-blue-600 text-white px-4 py-2 text-lg">
                {certificate.course_category}
              </Badge>
            </div>

            {/* Score et mention */}
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {certificate.score}/20
                </div>
                <div className="text-gray-600">Score obtenu</div>
              </div>
              
              <div className="text-center">
                <Badge className={`px-6 py-3 text-lg font-semibold ${getMentionColor(certificate.mention)}`}>
                  {certificate.mention}
                </Badge>
                <div className="flex items-center justify-center mt-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < getMentionStars(certificate.mention)
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Date et signature */}
            <div className="flex items-end justify-between mt-12">
              <div className="text-left">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  Délivré le {new Date(certificate.issued_date).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-sm text-gray-500">
                  Code de vérification : {certificate.verification_code}
                </div>
              </div>

              <div className="text-right">
                <div className="border-t-2 border-gray-400 pt-2 w-64">
                  <div className="font-semibold text-gray-800">{certificate.signed_by}</div>
                  <div className="text-sm text-gray-600">{certificate.signed_title}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer décoratif */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="text-center text-sm text-gray-500">
              <div>Ce certificat atteste de la réussite à l'évaluation du cours</div>
              <div>Vérifiable sur luvvix.com/verify/{certificate.verification_code}</div>
            </div>
          </div>

          {/* Éléments décoratifs */}
          <div className="absolute top-8 left-8 w-16 h-16 border-4 border-yellow-600 rounded-full opacity-20"></div>
          <div className="absolute top-8 right-8 w-16 h-16 border-4 border-yellow-600 rounded-full opacity-20"></div>
          <div className="absolute bottom-8 left-8 w-12 h-12 border-4 border-blue-600 rounded-full opacity-20"></div>
          <div className="absolute bottom-8 right-8 w-12 h-12 border-4 border-blue-600 rounded-full opacity-20"></div>
        </div>
      </motion.div>

      {/* Informations de vérification */}
      <Card className="border-0 shadow-lg bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Award className="h-6 w-6 text-green-600 mt-1" />
            <div>
              <h3 className="font-semibold text-green-800 mb-2">Certificat authentifié</h3>
              <p className="text-green-700 text-sm">
                Ce certificat est authentique et peut être vérifié en ligne avec le code {certificate.verification_code}.
                Il atteste officiellement de votre réussite au cours "{certificate.course_title}".
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificateGenerator;
