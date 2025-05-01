
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface VoiceDiscussionProps {
  onVoiceInput: (transcript: string) => void;
  onAutoSubmit?: boolean;
  className?: string;
}

export const VoiceDiscussion = ({ onVoiceInput, onAutoSubmit = false, className }: VoiceDiscussionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Vérifie si la reconnaissance vocale est supportée
    const isSpeechRecognitionSupported = 
      'SpeechRecognition' in window || 
      'webkitSpeechRecognition' in window;
    
    setIsSpeechSupported(isSpeechRecognitionSupported);
    
    if (isSpeechRecognitionSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      
      // Utiliser addEventListener au lieu de onstart
      recognition.addEventListener('start', () => {
        setIsListening(true);
      });
      
      recognition.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join(' ');
        
        setTranscript(currentTranscript);
        
        // Si onAutoSubmit est activé, soumet automatiquement après une pause
        if (onAutoSubmit && timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        if (onAutoSubmit) {
          timeoutRef.current = setTimeout(() => {
            if (currentTranscript.trim()) {
              onVoiceInput(currentTranscript);
              resetRecognition();
            }
          }, 1500); // 1.5 secondes de silence pour soumettre
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (!onAutoSubmit && transcript.trim()) {
          onVoiceInput(transcript);
        }
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error("Erreur de reconnaissance vocale. Veuillez vérifier les autorisations du microphone.");
      };
      
      recognitionRef.current = recognition;
    } else {
      toast.error("La reconnaissance vocale n'est pas supportée par votre navigateur.");
    }
    
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onVoiceInput, onAutoSubmit, transcript]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setTranscript("");
        recognitionRef.current.start();
      } catch (error) {
        console.error('Speech recognition error:', error);
        toast.error("Impossible de démarrer la reconnaissance vocale.");
      }
    }
  };
  
  const resetRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setTranscript("");
  };

  if (!isSpeechSupported) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        size="icon"
        variant={isListening ? "default" : "outline"}
        className={cn(
          "h-10 w-10 rounded-full shadow-md transition-all",
          isListening ? "bg-red-500 hover:bg-red-600 text-white animate-pulse" : ""
        )}
        onClick={toggleListening}
        aria-label={isListening ? "Arrêter l'écoute" : "Commencer l'écoute"}
      >
        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      </Button>
      
      {isListening && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-primary/20 rounded-full px-3 py-1.5 shadow-lg z-50"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <p className="text-xs font-medium whitespace-nowrap">Écoute en cours...</p>
          </div>
          {transcript && (
            <p className="text-xs mt-1 max-w-[200px] truncate">{transcript}</p>
          )}
        </motion.div>
      )}
    </div>
  );
};
