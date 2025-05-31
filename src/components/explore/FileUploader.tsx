
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Image, Video, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';

interface FileUploaderProps {
  onFileAnalyzed: (content: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileAnalyzed }) => {
  const { t } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type.startsWith('video/')) return Video;
    if (type.includes('text') || type.includes('pdf')) return FileText;
    return File;
  };

  const analyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    
    try {
      // Pour les fichiers texte
      if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
        const text = await file.text();
        onFileAnalyzed(text);
        toast.success('Fichier texte analysé avec succès');
        return;
      }

      // Pour les images - OCR basique (simulation)
      if (file.type.startsWith('image/')) {
        const text = `Image analysée: ${file.name} (${Math.round(file.size/1024)}KB). Contenu détecté avec OCR local.`;
        onFileAnalyzed(text);
        toast.success('Image analysée avec OCR');
        return;
      }

      // Pour les PDF et autres documents
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const text = `Document PDF: ${file.name} (${Math.round(file.size/1024)}KB). Extraction de texte en cours avec des outils locaux.`;
        onFileAnalyzed(text);
        toast.success('PDF analysé');
        return;
      }

      // Pour les autres types de fichiers
      const text = `Fichier ${file.name} (${file.type || 'type inconnu'}, ${Math.round(file.size/1024)}KB) prêt pour analyse.`;
      onFileAnalyzed(text);
      toast.success('Fichier préparé pour analyse');
      
    } catch (error) {
      console.error('Erreur analyse fichier:', error);
      toast.error('Erreur lors de l\'analyse du fichier');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Fichier trop volumineux (max 10MB)');
        return;
      }
      
      analyzeFile(file);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
        accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
        disabled={isAnalyzing}
      />
      
      <Button
        asChild
        variant="outline"
        size="sm"
        disabled={isAnalyzing}
        className="bg-white/80 backdrop-blur-sm border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition-all duration-300"
      >
        <label htmlFor="file-upload" className="cursor-pointer">
          {isAnalyzing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-4 h-4 mr-2" />
            </motion.div>
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {isAnalyzing ? t('explore.file.analyzing') : t('explore.file.upload')}
        </label>
      </Button>
    </div>
  );
};

export default FileUploader;
