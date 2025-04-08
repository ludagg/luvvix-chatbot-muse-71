
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface ImageGeneratorProps {
  onImageGenerated?: (imageUrl: string) => void;
}

export const ImageGenerator = ({ onImageGenerated }: ImageGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une description pour générer une image.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Using a free placeholder image API for demonstration
      // In a real implementation, you would use a proper image generation API
      const width = 512;
      const height = 512;
      
      // For demo purposes, we'll use a placeholder image
      const imageUrl = `https://picsum.photos/${width}/${height}?random=${Date.now()}`;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setGeneratedImage(imageUrl);
      if (onImageGenerated) {
        onImageGenerated(imageUrl);
      }
      
      toast({
        title: "Image générée",
        description: "Votre image a été générée avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la génération de l'image:", error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'image. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full shadow-lg border border-primary/10">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Décrivez l'image que vous souhaitez créer..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1"
              disabled={isGenerating}
            />
            <Button 
              onClick={generateImage} 
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span>Génération...</span>
                </>
              ) : (
                <>
                  <Wand2 size={16} />
                  <span>Générer</span>
                </>
              )}
            </Button>
          </div>
          
          {generatedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <p className="text-sm text-muted-foreground mb-2">Image générée:</p>
              <div className="relative w-full h-48 md:h-64 rounded-md overflow-hidden">
                <img 
                  src={generatedImage} 
                  alt="Image générée" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Note: Cette fonctionnalité utilise actuellement une API de placeholder. Pour une véritable génération d'images, une API comme Stability AI ou DALL-E serait nécessaire.
              </p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
