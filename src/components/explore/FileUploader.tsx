
import React, { useRef, useState } from 'react';
import { Upload, File, Image, FileText, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploaderProps {
  onFileAnalyzed: (content: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileAnalyzed }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    
    try {
      const content = await analyzeFile(file);
      onFileAnalyzed(content);
      toast.success(`Fichier ${file.name} analysé avec succès`);
    } catch (error) {
      console.error('Erreur analyse fichier:', error);
      toast.error('Erreur lors de l\'analyse du fichier');
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
      // Simulation d'extraction PDF (en réalité, vous utiliseriez une bibliothèque comme pdf-parse)
      return `Contenu extrait du PDF: ${file.name}\n\nCe fichier PDF contient des informations importantes qui ont été analysées par LuvviX AI.`;
    }
    
    if (fileType.startsWith('image/')) {
      // OCR simulation
      return `Image analysée: ${file.name}\n\nCette image contient du texte et des éléments visuels qui ont été traités par notre IA de reconnaissance optique.`;
    }
    
    if (fileType.startsWith('audio/') || fileType.startsWith('video/')) {
      // Transcription simulation
      return `Média transcrit: ${file.name}\n\nCe fichier audio/vidéo a été transcrit automatiquement par notre système de reconnaissance vocale.`;
    }
    
    return `Fichier analysé: ${file.name}\n\nType: ${fileType}\nTaille: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
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
        title="Analyser un fichier"
      >
        {getFileIcon()}
      </Button>
    </>
  );
};

export default FileUploader;
