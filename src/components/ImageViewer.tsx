
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageViewerProps {
  imageUrl: string;
  alt?: string;
}

export const ImageViewer = ({ imageUrl, alt = "Image" }: ImageViewerProps) => {
  const [scale, setScale] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const resetZoom = () => setScale(1);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="relative w-full h-40 md:h-56 lg:h-64 cursor-pointer rounded-md overflow-hidden border border-primary/10 shadow-md hover:shadow-lg transition-shadow">
          <img 
            src={imageUrl} 
            alt={alt} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="opacity-0 hover:opacity-100 text-white font-medium transition-opacity">
              Agrandir
            </span>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] sm:max-w-[80vw] md:max-w-[70vw] p-0 border-none bg-transparent shadow-none">
        <div className="relative bg-secondary/90 backdrop-blur-md rounded-lg shadow-xl overflow-hidden">
          <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
            <Button 
              variant="secondary" 
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={zoomIn}
            >
              <ZoomIn size={16} />
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={zoomOut}
            >
              <ZoomOut size={16} />
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>
          <div 
            className="w-full h-[80vh] overflow-auto flex items-center justify-center p-4"
            onClick={resetZoom}
          >
            <motion.img
              src={imageUrl}
              alt={alt}
              style={{ scale }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
