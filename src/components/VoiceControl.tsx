
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface VoiceControlProps {
  onVoiceResult: (transcript: string) => void;
}

export const VoiceControl = ({ onVoiceResult }: VoiceControlProps) => {
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        onVoiceResult(transcript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Erreur de reconnaissance vocale",
          description: "Impossible d'utiliser le microphone. Veuillez vérifier les autorisations.",
          variant: "destructive"
        });
      };
      
      setRecognitionInstance(recognition);
    } else {
      toast({
        title: "Fonctionnalité non supportée",
        description: "La reconnaissance vocale n'est pas supportée par votre navigateur.",
        variant: "destructive"
      });
    }
    
    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [toast, onVoiceResult]);

  const toggleListening = () => {
    if (!recognitionInstance) return;
    
    if (isListening) {
      recognitionInstance.stop();
      setIsListening(false);
    } else {
      try {
        recognitionInstance.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition error:', error);
        toast({
          title: "Erreur de reconnaissance vocale",
          description: "Impossible de démarrer la reconnaissance vocale.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="relative">
      <Button
        type="button"
        size="icon"
        variant={isListening ? "default" : "ghost"}
        className={`
          h-8 w-8 transition-all
          ${isListening ? "bg-red-500 hover:bg-red-600 text-white" : "text-muted-foreground hover:text-foreground"}
        `}
        onClick={toggleListening}
      >
        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
      </Button>
      
      {isListening && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium text-red-500 bg-background/90 px-2 py-1 rounded-full shadow-sm"
        >
          Écoute en cours...
        </motion.div>
      )}
    </div>
  );
};
