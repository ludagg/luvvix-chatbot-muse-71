
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Image, RefreshCw, Share2, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";

interface ImageGeneratorProps {
  onImageGenerated?: (imageData: {
    url: string;
    prompt: string;
    model: string;
  }) => void;
}

interface Model {
  id: string;
  name: string;
}

export const ImageGenerator = ({ onImageGenerated }: ImageGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("runwayml/stable-diffusion-v1-5");
  const [generationDetails, setGenerationDetails] = useState<{
    prompt: string;
    model: string;
  } | null>(null);

  // Liste des modèles disponibles
  const models: Model[] = [
    { id: "runwayml/stable-diffusion-v1-5", name: "Stable Diffusion v1.5" },
    { id: "CompVis/stable-diffusion-v1-4", name: "Stable Diffusion v1.4" },
    { id: "prompthero/openjourney", name: "OpenJourney" }
  ];

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Veuillez entrer une description pour générer une image.");
      return;
    }

    setIsGenerating(true);
    try {
      // Pour le moment, nous utilisons un API simulé avec une image placeholder
      // Dans une implémentation réelle, vous utiliseriez l'API Hugging Face
      const modelName = selectedModel.split("/")[1];
      const width = 512;
      const height = 512;
      
      // Simuler un temps de génération différent selon le modèle
      const delay = selectedModel === "runwayml/stable-diffusion-v1-5" ? 3000 : 
                    selectedModel === "CompVis/stable-diffusion-v1-4" ? 2000 : 2500;
      
      // Simuler l'appel API avec un placeholder
      const imageUrl = `https://picsum.photos/${width}/${height}?random=${Date.now()}`;
      
      // Simuler le délai de l'API
      await new Promise(resolve => setTimeout(resolve, delay));
      
      setGeneratedImage(imageUrl);
      const details = {
        url: imageUrl,
        prompt: prompt,
        model: selectedModel
      };
      
      setGenerationDetails({
        prompt: prompt,
        model: selectedModel
      });
      
      if (onImageGenerated) {
        onImageGenerated(details);
      }
      
      toast.success(`Image générée avec succès via ${modelName}`);
    } catch (error) {
      console.error("Erreur lors de la génération de l'image:", error);
      toast.error("Impossible de générer l'image. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateImage = () => {
    if (generatedImage) {
      generateImage();
    }
  };

  const shareImage = () => {
    if (generatedImage && navigator.share) {
      navigator.share({
        title: 'Image générée par IA',
        text: `Image générée à partir du prompt: "${prompt}"`,
        url: generatedImage
      })
      .then(() => toast.success("Image partagée avec succès"))
      .catch((error) => console.error('Erreur de partage:', error));
    } else {
      // Copier l'URL de l'image dans le presse-papiers si le partage n'est pas disponible
      navigator.clipboard.writeText(generatedImage || '')
        .then(() => toast.success("URL de l'image copiée dans le presse-papiers"))
        .catch(() => toast.error("Impossible de copier l'URL"));
    }
  };

  const printImage = () => {
    if (generatedImage) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Impression d'image</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
                img { max-width: 100%; max-height: 100vh; }
              </style>
            </head>
            <body>
              <img src="${generatedImage}" alt="Image générée" />
              <script>
                window.onload = function() {
                  setTimeout(() => {
                    window.print();
                    window.close();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        toast.error("Impossible d'ouvrir la fenêtre d'impression.");
      }
    }
  };

  return (
    <Card className="w-full shadow-lg border border-primary/10">
      <CardContent className="p-4">
        <div className="space-y-4">
          <Select
            value={selectedModel}
            onValueChange={setSelectedModel}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez un modèle" />
            </SelectTrigger>
            <SelectContent>
              {models.map(model => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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
                  <Image size={16} />
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
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Image générée:</p>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={regenerateImage} 
                    disabled={isGenerating}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw size={14} />
                    <span className="sr-only md:not-sr-only md:inline">Régénérer</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={shareImage}
                    className="flex items-center gap-1"
                  >
                    <Share2 size={14} />
                    <span className="sr-only md:not-sr-only md:inline">Partager</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={printImage}
                    className="flex items-center gap-1"
                  >
                    <Printer size={14} />
                    <span className="sr-only md:not-sr-only md:inline">Imprimer</span>
                  </Button>
                </div>
              </div>
              <div className="relative w-full h-48 md:h-64 rounded-md overflow-hidden">
                <img 
                  src={generatedImage} 
                  alt="Image générée" 
                  className="w-full h-full object-cover"
                />
              </div>
              {generationDetails && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <p><span className="font-medium">Prompt:</span> {generationDetails.prompt}</p>
                  <p><span className="font-medium">Modèle:</span> {models.find(m => m.id === generationDetails.model)?.name || generationDetails.model}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
