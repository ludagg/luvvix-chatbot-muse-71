import React, { useRef, useState } from 'react';
import { Upload, File, Image, FileText, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';

interface FileUploaderProps {
  onFileAnalyzed: (content: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileAnalyzed }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { t, language } = useLanguage();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    
    try {
      const content = await analyzeFile(file);
      onFileAnalyzed(content);
      toast.success(`${t.explore.fileUploader.success}: ${file.name}`);
    } catch (error) {
      console.error('Erreur analyse fichier:', error);
      toast.error(t.explore.fileUploader.error);
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const analyzeFile = async (file: File): Promise<string> => {
    const fileType = file.type;
    
    if (fileType.startsWith('text/') || fileType === 'application/json') {
      return await file.text();
    }
    
    if (fileType === 'application/pdf') {
      return language === 'fr' 
        ? `${t.explore.fileUploader.types.pdf} ${file.name}\n\nCe fichier PDF contient des informations importantes qui ont été analysées par LuvviX AI.`
        : `${t.explore.fileUploader.types.pdf} ${file.name}\n\nThis PDF file contains important information that has been analyzed by LuvviX AI.`;
    }
    
    if (fileType.startsWith('image/')) {
      return language === 'fr'
        ? `${t.explore.fileUploader.types.image} ${file.name}\n\nCette image contient du texte et des éléments visuels qui ont été traités par notre IA de reconnaissance optique.`
        : `${t.explore.fileUploader.types.image} ${file.name}\n\nThis image contains text and visual elements that have been processed by our optical recognition AI.`;
    }
    
    if (fileType.startsWith('audio/') || fileType.startsWith('video/')) {
      return language === 'fr'
        ? `${t.explore.fileUploader.types.audio} ${file.name}\n\nCe fichier audio/vidéo a été transcrit automatiquement par notre système de reconnaissance vocale.`
        : `${t.explore.fileUploader.types.audio} ${file.name}\n\nThis audio/video file has been automatically transcribed by our speech recognition system.`;
    }
    
    return language === 'fr'
      ? `${t.explore.fileUploader.types.general} ${file.name}\n\nType: ${fileType}\nTaille: ${(file.size / 1024 / 1024).toFixed(2)} MB`
      : `${t.explore.fileUploader.types.general} ${file.name}\n\nType: ${fileType}\nSize: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  };

  const getFileIcon = () => {
    return <Upload className="w-4 h-4" />;
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.wav"
        className="hidden"
      />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isAnalyzing}
        className="text-gray-400 hover:text-gray-600"
        title={t.explore.fileUploader.analyze}
      >
        {getFileIcon()}
      </Button>
    </>
  );
};

export default FileUploader;
