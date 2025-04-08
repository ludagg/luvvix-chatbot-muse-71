
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  isPro?: boolean;
}

export const ImageUploader = ({ onImageUpload, isPro = false }: ImageUploaderProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isPro && file.size > 5 * 1024 * 1024) {
        toast({
          title: "Limite de taille atteinte",
          description: "Les images sont limitées à 5 MB. Passez à la version Pro pour envoyer des fichiers plus grands.",
          variant: "destructive"
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Type de fichier non supporté",
          description: "Seules les images sont acceptées.",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onImageUpload(selectedFile);
      clearSelectedFile();
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={() => fileInputRef.current?.click()}
      >
        <ImageIcon size={16} />
      </Button>
      
      <AnimatePresence>
        {selectedFile && previewUrl && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-0 mb-2 w-60 bg-secondary/50 backdrop-blur-sm border border-primary/10 rounded-lg p-2 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Button 
                    type="button"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={handleUpload}
                  >
                    Envoyer
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={clearSelectedFile}
                  >
                    <X size={12} />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
