
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, Phone, PhoneOff } from "lucide-react";
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
  const [inCall, setInCall] = useState(false);
  const { user } = useAuth();
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const stopSpeakingRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effet pour démarrer/arrêter l'appel en fonction de isVoiceModeActive
  useEffect(() => {
    if (isVoiceModeActive && !isListening && !inCall) {
      setInCall(true);
      startListening();
      toast.success("Appel avec Léa démarré", { 
        description: "Vous pouvez parler naturellement"
      });
    } else if (!isVoiceModeActive && inCall) {
      setInCall(false);
      if (isListening) {
        stopListening();
      }
    }
  }, [isVoiceModeActive]);

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
            resetTranscript();
          }
        }, 1500); // 1.5 secondes de silence pour soumettre
      };
      
      recognition.onend = () => {
        setIsListening(false);
        
        // Redémarrer automatiquement la reconnaissance si nous sommes toujours en mode appel
        if (inCall) {
          try {
            recognition.start();
          } catch (error) {
            console.error("Erreur lors du redémarrage de la reconnaissance vocale:", error);
          }
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
      if (stopSpeakingRef.current) {
        stopSpeakingRef.current();
        stopSpeakingRef.current = null;
      }
    };
  }, [onVoiceInput, inCall]);

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

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }
    
    try {
      setTranscript("");
      recognitionRef.current.start();
    } catch (error) {
      console.error('Speech recognition error:', error);
      toast.error("Impossible de démarrer la reconnaissance vocale.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };
  
  const resetTranscript = () => {
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
  
  const toggleCallMode = () => {
    const newCallState = !inCall;
    setInCall(newCallState);
    onToggleVoiceMode(newCallState);
    
    if (newCallState) {
      startListening();
      toast.success("Appel avec Léa démarré", {
        description: "Vous pouvez parler naturellement"
      });
    } else {
      stopListening();
      toast.info("Appel avec Léa terminé");
    }
  };

  // Si le composant est utilisé uniquement pour l'interaction vocale (sans UI visible)
  if (!isVoiceModeActive && !inCall) {
    return (
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="h-10 w-10 rounded-full shadow-md"
        onClick={toggleCallMode}
        aria-label="Démarrer un appel avec Léa"
      >
        <Phone size={18} />
      </Button>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className={cn(
        "flex items-center gap-2 transition-all",
        (isVoiceModeActive || inCall) ? "scale-110" : "scale-100"
      )}>
        <Button
          type="button"
          size="icon"
          variant={inCall ? "default" : "outline"}
          className={cn(
            "h-10 w-10 rounded-full shadow-md",
            inCall ? "bg-red-500 hover:bg-red-600 text-white" : ""
          )}
          onClick={toggleCallMode}
          aria-label={inCall ? "Terminer l'appel" : "Appeler Léa"}
        >
          {inCall ? <PhoneOff size={18} /> : <Phone size={18} />}
        </Button>
      
        {(isVoiceModeActive || inCall) && (
          <>
            <Button
              type="button"
              size="icon"
              variant={isMuted ? "default" : "outline"}
              className="h-10 w-10 rounded-full shadow-md"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>
          </>
        )}
      </div>
      
      <AnimatePresence>
        {isListening && (isVoiceModeActive || inCall) && (
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
              <p className="text-sm font-medium">En appel avec Léa...</p>
            </div>
            
            <div className="flex items-start gap-2 mt-1.5">
              <Avatar className="h-6 w-6">
                {user?.displayName ? (
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {user.displayName.charAt(0) || "U"}
                  </AvatarFallback>
                ) : (
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {"U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <p className="text-xs mt-0.5 flex-1 opacity-80">{transcript || "En attente de parole..."}</p>
            </div>
          </motion.div>
        )}
        
        {isSpeaking && !isMuted && (isVoiceModeActive || inCall) && !isListening && (
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
              <p className="text-xs font-medium">Léa parle...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
