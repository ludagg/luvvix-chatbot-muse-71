
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface FileViewerProps {
  file: {
    id: string;
    name: string;
    type: string;
    mime_type?: string;
    url?: string;
  };
  open: boolean;
  onClose: () => void;
}

const FileViewer = ({ file, open, onClose }: FileViewerProps) => {
  const isImage = file.mime_type?.startsWith("image/");
  const isPdf = file.mime_type === "application/pdf";
  const isVideo = file.mime_type?.startsWith("video/");
  const isAudio = file.mime_type?.startsWith("audio/");
  const isText = file.mime_type?.startsWith("text/") || file.mime_type === "application/json";
  
  const [textContent, setTextContent] = useState<string>("");
  
  // Load text content if it's a text file
  useState(() => {
    if (isText && file.url) {
      fetch(file.url)
        .then(response => response.text())
        .then(text => setTextContent(text))
        .catch(error => console.error("Error loading text:", error));
    }
  });
  
  const renderFileContent = () => {
    if (!file.url) {
      return <div className="p-8 text-center text-gray-500">Prévisualisation non disponible</div>;
    }
    
    if (isImage) {
      return <img src={file.url} alt={file.name} className="max-w-full max-h-[70vh] object-contain mx-auto" />;
    }
    
    if (isPdf) {
      return <iframe src={file.url} className="w-full h-[70vh]" title={file.name} />;
    }
    
    if (isVideo) {
      return (
        <video controls className="w-full max-h-[70vh]">
          <source src={file.url} type={file.mime_type} />
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      );
    }
    
    if (isAudio) {
      return (
        <audio controls className="w-full mt-8">
          <source src={file.url} type={file.mime_type} />
          Votre navigateur ne supporte pas la lecture audio.
        </audio>
      );
    }
    
    if (isText) {
      return (
        <pre className="p-4 bg-gray-100 dark:bg-gray-800 overflow-auto h-[70vh] text-sm">
          {textContent || "Chargement..."}
        </pre>
      );
    }
    
    return (
      <div className="p-8 text-center">
        <p className="mb-4 text-gray-500">Prévisualisation non disponible pour ce type de fichier.</p>
        <Button onClick={() => window.open(file.url, "_blank")}>
          <Download className="mr-2 h-4 w-4" />
          Télécharger pour voir
        </Button>
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>{file.name}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="mt-2">
          {renderFileContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileViewer;
