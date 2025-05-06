
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Message } from "@/types/message";
import { cleanTextForSpeech, speakText } from "@/utils/speechUtils";

interface VoiceChatControlProps {
  onVoiceStart?: () => void;
  onVoiceResult: (transcript: string) => void;
  lastMessage?: Message | null;
  className?: string;
}

export function VoiceChatControl({ onVoiceStart, onVoiceResult, lastMessage, className }: VoiceChatControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const stopSpeakingRef = useRef<(() => void) | null>(null);

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      
      recognition.onresult = (event) => {
        const currentTranscript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join(' ');
        
        setTranscript(currentTranscript);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (transcript) onVoiceResult(transcript);
        setTranscript("");
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error("Erreur de reconnaissance vocale. Veuillez vérifier les autorisations du microphone.");
      };
      
      recognitionRef.current = recognition;
    }
  };

  // Toggle voice listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      initSpeechRecognition();
    }
    
    if (!recognitionRef.current) {
      toast.error("La reconnaissance vocale n'est pas supportée par votre navigateur.");
      return;
    }
    
    // Stop speaking if active
    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();
      stopSpeakingRef.current = null;
      setIsSpeaking(false);
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (onVoiceStart) onVoiceStart();
      try {
        setTranscript("");
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition error:', error);
        toast.error("Impossible de démarrer la reconnaissance vocale.");
      }
    }
  };

  // Toggle mute for speech synthesis
  const toggleMute = () => {
    if (isSpeaking && !isMuted && stopSpeakingRef.current) {
      stopSpeakingRef.current();
      stopSpeakingRef.current = null;
      setIsSpeaking(false);
    }
    
    setIsMuted(!isMuted);
    toast.info(isMuted ? "Son activé" : "Son désactivé");
  };

  // Read message aloud
  const readMessage = () => {
    if (lastMessage && lastMessage.role === "assistant" && !isMuted) {
      // Stop any current speech
      if (stopSpeakingRef.current) {
        stopSpeakingRef.current();
        stopSpeakingRef.current = null;
      }
      
      const textToSpeak = cleanTextForSpeech(lastMessage.content);
      
      setIsSpeaking(true);
      stopSpeakingRef.current = speakText(textToSpeak);
      
      const utterance = new SpeechSynthesisUtterance();
      utterance.onend = () => {
        setIsSpeaking(false);
        stopSpeakingRef.current = null;
      };
    }
  };

  return (
    <div className={cn("relative", className)}>
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
          aria-label={isMuted ? "Activer le son" : "Désactiver le son"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </Button>
        
        {lastMessage && lastMessage.role === "assistant" && !isListening && !isSpeaking && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-xs text-muted-foreground px-2 h-8"
            onClick={readMessage}
            disabled={isMuted}
          >
            Lire le message
          </Button>
        )}
      </div>
      
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-primary/20 rounded-full px-3 py-1.5 shadow-lg z-10"
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
            className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-primary/20 rounded-full px-3 py-1.5 shadow-lg z-10"
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
}
