
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Message } from "@/components/ChatMessage";
import { speakText, cleanTextForSpeech } from "@/utils/speechUtils";

interface VoiceAssistantProps {
  onVoiceInput: (transcript: string) => void;
  onToggleVoiceMode: (active: boolean) => void;
  isVoiceModeActive: boolean;
  lastMessage?: Message | null;
  className?: string;
}

export const VoiceAssistant = ({ 
  onVoiceInput,
  onToggleVoiceMode,
  isVoiceModeActive,
  lastMessage,
  className
}: VoiceAssistantProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const { user } = useAuth();
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const stopSpeakingRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Vérifie si la reconnaissance vocale est supportée
    const isSpeechRecognitionSupported = 
      'SpeechRecognition' in window || 
      'webkitSpeechRecognition' in window;
    
    if (isSpeechRecognitionSupported) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      
      recognition.addEventListener('start', () => {
        setIsListening(true);
      });
      
      recognition.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join(' ');
        
        setTranscript(currentTranscript);
        
        // Soumet automatiquement après une pause
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          if (currentTranscript.trim()) {
            onVoiceInput(currentTranscript);
            resetRecognition();
          }
        }, 1500); // 1.5 secondes de silence pour soumettre
      };
      
      recognition.onend = () => {
        setIsListening(false);
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
      if (stopSpeakingRef.current) {
        stopSpeakingRef.current();
        stopSpeakingRef.current = null;
      }
    };
  }, [onVoiceInput]);

  // Effet pour lire à haute voix le dernier message de l'assistant
  useEffect(() => {
    if (lastMessage && lastMessage.role === "assistant" && !isMuted && isVoiceModeActive) {
      // Arrêter toute lecture en cours
      if (stopSpeakingRef.current) {
        stopSpeakingRef.current();
        stopSpeakingRef.current = null;
      }
      
      // Nettoyer le texte pour la synthèse vocale
      const textToSpeak = cleanTextForSpeech(lastMessage.content);
      
      // Lancer la synthèse vocale
      setIsSpeaking(true);
      stopSpeakingRef.current = speakText(textToSpeak);
      
      // Gérer la fin de la lecture
      const utterance = new SpeechSynthesisUtterance();
      utterance.onend = () => {
        setIsSpeaking(false);
        stopSpeakingRef.current = null;
      };
    }
  }, [lastMessage, isMuted, isVoiceModeActive]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }
    
    // Arrêter la synthèse vocale si elle est en cours
    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();
      stopSpeakingRef.current = null;
      setIsSpeaking(false);
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
  
  const resetRecognition = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    setTranscript("");
  };

  const toggleMute = () => {
    // Arrêter la lecture en cours si on active le mode muet
    if (!isMuted && stopSpeakingRef.current) {
      stopSpeakingRef.current();
      stopSpeakingRef.current = null;
      setIsSpeaking(false);
    }
    
    setIsMuted(!isMuted);
    toast.info(isMuted ? "Son activé" : "Son désactivé");
  };
  
  const toggleVoiceMode = () => {
    const newModeState = !isVoiceModeActive;
    onToggleVoiceMode(newModeState);
    toast.info(newModeState ? "Mode conversation vocale activé" : "Mode conversation vocale désactivé");
    
    if (!newModeState && isListening) {
      resetRecognition();
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "flex items-center gap-2 transition-all",
        isVoiceModeActive ? "scale-110" : "scale-100"
      )}>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn("h-10 w-10 rounded-full shadow-md hover:bg-primary/10",
            isVoiceModeActive ? "bg-primary/10 text-primary border-primary/30" : ""
          )}
          onClick={toggleVoiceMode}
        >
          <MessageSquare size={18} />
        </Button>
      
        {isVoiceModeActive && (
          <>
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
            
            <Button
              type="button"
              size="icon"
              variant={isSpeaking && !isMuted ? "default" : "outline"}
              className={cn(
                "h-10 w-10 rounded-full shadow-md",
                isSpeaking && !isMuted ? "bg-primary text-primary-foreground" : ""
              )}
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>
          </>
        )}
      </div>
      
      <AnimatePresence>
        {isVoiceModeActive && isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-primary/20 rounded-xl px-4 py-2.5 shadow-lg z-50 w-64"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </div>
              <p className="text-sm font-medium">Écoute en cours...</p>
            </div>
            
            <div className="flex items-start gap-2 mt-1.5">
              <Avatar className="h-6 w-6">
                {user?.photoURL ? (
                  <AvatarImage src={user.photoURL} alt={user.displayName || ""} />
                ) : (
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {user?.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <p className="text-xs mt-0.5 flex-1 opacity-80">{transcript || "En attente de parole..."}</p>
            </div>
          </motion.div>
        )}
        
        {isVoiceModeActive && isSpeaking && !isMuted && !isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-primary/20 rounded-full px-3 py-1.5 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              <p className="text-xs font-medium">Lecture en cours...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
