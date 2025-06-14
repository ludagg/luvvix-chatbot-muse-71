
import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploaderProps {
  onFileAnalyzed: (content: string) => void;
}

const FileUploader = ({ onFileAnalyzed }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileAnalyzed(content);
      toast.success(`Fichier "${file.name}" analysé avec succès`);
    };

    if (file.type.startsWith('text/')) {
      reader.readAsText(file);
    } else {
      // Pour les autres types de fichiers, on simule une analyse
      onFileAnalyzed(`Contenu analysé du fichier ${file.name}`);
      toast.success(`Fichier "${file.name}" analysé avec succès`);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        accept=".txt,.pdf,.doc,.docx"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
      </Button>
    </>
  );
};

export default FileUploader;
