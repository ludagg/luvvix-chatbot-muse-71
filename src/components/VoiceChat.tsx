
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { speakText, cleanTextForSpeech } from "@/utils/speechUtils";
import { Message } from "@/components/ChatMessage";

interface VoiceChatProps {
  onVoiceStart?: () => void;
  onVoiceEnd?: (transcript: string) => void;
  onSpeaking?: (isListening: boolean) => void;
  lastMessage?: Message | null;
}

export const VoiceChat = ({ onVoiceStart, onVoiceEnd, onSpeaking, lastMessage }: VoiceChatProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const stopSpeakingRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      
      // Add event listener for the 'start' event instead of using onstart property
      recognition.addEventListener('start', () => {
        setIsListening(true);
        if (onVoiceStart) onVoiceStart();
        if (onSpeaking) onSpeaking(true);
      });
      
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
      if (recognitionRef.current) {
        // Clean up event listeners
        if (recognitionRef.current instanceof EventTarget) {
          recognitionRef.current.removeEventListener('start', () => {});
        }
        
        if (isListening) {
          recognitionRef.current.stop();
        }
      }
      
      if (stopSpeakingRef.current) {
        stopSpeakingRef.current();
        stopSpeakingRef.current = null;
      }
    };
  }, [onVoiceStart, onVoiceEnd, onSpeaking, transcript, isListening]);

  // Effet pour lire à haute voix le dernier message de l'assistant
  useEffect(() => {
    if (lastMessage && lastMessage.role === "assistant" && !isMuted && !isListening) {
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
  }, [lastMessage, isMuted]);

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
          variant={isSpeaking && !isMuted ? "default" : "outline"}
          className={cn(
            "h-10 w-10 rounded-full shadow-md",
            isSpeaking && !isMuted ? "bg-primary text-primary-foreground" : ""
          )}
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
        
        {isSpeaking && !isMuted && !isListening && (
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
