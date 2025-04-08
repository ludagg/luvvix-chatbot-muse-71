
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceChatProps {
  onVoiceStart?: () => void;
  onVoiceEnd?: (transcript: string) => void;
  onSpeaking?: (isListening: boolean) => void;
}

export const VoiceChat = ({ onVoiceStart, onVoiceEnd, onSpeaking }: VoiceChatProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      
      recognition.onstart = () => {
        setIsListening(true);
        if (onVoiceStart) onVoiceStart();
        if (onSpeaking) onSpeaking(true);
      };
      
      recognition.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join(' ');
          
        setTranscript(currentTranscript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (onVoiceEnd && transcript) onVoiceEnd(transcript);
        if (onSpeaking) onSpeaking(false);
        setTranscript("");
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error("Erreur de reconnaissance vocale. Veuillez vérifier les autorisations du microphone.");
        if (onSpeaking) onSpeaking(false);
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, [onVoiceStart, onVoiceEnd, onSpeaking, transcript, isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
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

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Dans une implémentation réelle, vous connecteriez ceci à votre logique de sortie audio
    toast.info(isMuted ? "Son activé" : "Son désactivé");
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant={isListening ? "default" : "outline"}
          className={cn(
            "h-10 w-10 rounded-full shadow-md transition-all",
            isListening ? "bg-red-500 hover:bg-red-600 text-white" : ""
          )}
          onClick={toggleListening}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </Button>
        
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-10 w-10 rounded-full shadow-md"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </Button>
      </div>
      
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-primary/20 rounded-full px-3 py-1.5 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <p className="text-xs font-medium">Écoute en cours...</p>
            </div>
            {transcript && (
              <p className="text-xs mt-1 max-w-[200px] truncate">{transcript}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
