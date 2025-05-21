
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadFormProps {
  onFileUploaded?: (content: string, source: string) => void;
}

const FileUploadForm: React.FC<FileUploadFormProps> = ({ onFileUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    setIsLoading(true);
    setProgress(20);

    try {
      // Handle different file types
      if (file.type === 'text/plain') {
        const text = await file.text();
        setProgress(90);
        
        if (onFileUploaded) {
          onFileUploaded(text, file.name);
        }
        
        toast.success('Fichier importé avec succès');
      } else if (file.type === 'application/pdf') {
        // For PDF files - currently we'll just acknowledge them
        // In a real implementation, you'd use a proper PDF parser
        setProgress(90);
        toast.info('Le support complet pour les fichiers PDF sera disponible prochainement');
        
        if (onFileUploaded) {
          onFileUploaded(`Contenu du PDF ${file.name} (format non entièrement supporté)`, file.name);
        }
      } else {
        setProgress(90);
        toast.error('Type de fichier non supporté. Veuillez utiliser un fichier TXT ou PDF');
      }
      
      // Reset the file input
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (err) {
      toast.error('Erreur lors de l\'importation: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt,.pdf"
        className="hidden"
      />
      
      <div 
        onClick={triggerFileInput}
        className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex justify-center mb-4">
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-full">
            <Upload className="h-6 w-6 text-violet-500 dark:text-violet-400" />
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-2">Importer des documents</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          Déposez un fichier PDF ou texte pour enrichir les connaissances de votre agent
        </p>
        
        {file ? (
          <div className="text-sm font-medium text-violet-600 dark:text-violet-400">
            <FileText className="inline-block mr-1 h-4 w-4" />
            {file.name}
          </div>
        ) : null}
      </div>
      
      {file && (
        <div className="flex justify-center">
          <Button
            onClick={handleUpload}
            disabled={isLoading}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importation...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importer
              </>
            )}
          </Button>
        </div>
      )}
      
      {isLoading && (
        <div className="mt-2">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center mt-1 text-slate-500">
            Importation en cours...
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploadForm;
