
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX, Play, Headphones, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { speakText, cleanTextForSpeech } from "@/utils/speechUtils";
import { Message } from "@/types/message";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EnhancedVoiceControlProps {
  onVoiceStart?: () => void;
  onVoiceEnd?: (transcript: string) => void;
  lastMessage?: Message | null;
  className?: string;
  position?: "floating" | "inline" | "fixed";
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "minimal";
}

export function EnhancedVoiceControl({ 
  onVoiceStart, 
  onVoiceEnd, 
  lastMessage,
  className,
  position = "floating",
  size = "md",
  variant = "primary"
}: EnhancedVoiceControlProps) {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const stopSpeakingRef = useRef<(() => void) | null>(null);
  
  // Sizes based on the size prop
  const buttonSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  };
  
  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'fr-FR';
      
      recognition.addEventListener('start', () => {
        setIsListening(true);
        if (onVoiceStart) onVoiceStart();
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
    toast.success(isMuted ? "Son activé" : "Son désactivé", {
      icon: isMuted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />,
      duration: 2000
    });
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

  // Effect pour lire le dernier message de l'assistant
  useEffect(() => {
    if (lastMessage && lastMessage.role === "assistant" && !isMuted && !isListening) {
      const textToSpeak = cleanTextForSpeech(lastMessage.content);
      setIsSpeaking(true);
      stopSpeakingRef.current = speakText(textToSpeak);
      
      const utterance = new SpeechSynthesisUtterance();
      utterance.onend = () => {
        setIsSpeaking(false);
        stopSpeakingRef.current = null;
      };
    }
  }, [lastMessage, isMuted]);

  return (
    <div className={cn(
      "relative",
      position === "floating" && "fixed bottom-28 right-4 z-50",
      position === "fixed" && "fixed bottom-4 right-4 z-50",
      className
    )}>
      <div className={cn(
        "flex items-center gap-2",
        variant === "primary" && "bg-primary/10 backdrop-blur-sm p-3 rounded-full shadow-lg border border-primary/20",
        variant === "secondary" && "bg-muted/50 p-2 rounded-full shadow-md"
      )}>
        <Button
          type="button"
          size="icon"
          variant={isListening ? "destructive" : (variant === "minimal" ? "outline" : "secondary")}
          className={cn(
            buttonSizes[size],
            "rounded-full shadow-md transition-all",
            isListening && "animate-pulse"
          )}
          onClick={toggleListening}
          aria-label={isListening ? "Arrêter l'écoute" : "Commencer l'écoute"}
        >
          {isListening ? 
            <MicOff size={iconSizes[size]} /> : 
            <Mic size={iconSizes[size]} />}
        </Button>
        
        <Button
          type="button"
          size="icon"
          variant={isSpeaking && !isMuted ? "default" : (variant === "minimal" ? "outline" : "secondary")}
          className={cn(
            buttonSizes[size],
            "rounded-full shadow-md",
            isSpeaking && !isMuted && "animate-pulse"
          )}
          onClick={toggleMute}
          aria-label={isMuted ? "Activer le son" : "Désactiver le son"}
        >
          {isMuted ? <VolumeX size={iconSizes[size]} /> : <Volume2 size={iconSizes[size]} />}
        </Button>
        
        {lastMessage && lastMessage.role === "assistant" && !isListening && !isSpeaking && (
          <Button
            type="button"
            size={size === "sm" ? "sm" : "icon"}
            variant="ghost"
            className={cn(
              buttonSizes[size],
              "rounded-full text-muted-foreground hover:text-foreground"
            )}
            onClick={readMessage}
            disabled={isMuted}
            aria-label="Lire le message"
          >
            <Play size={iconSizes[size]} />
          </Button>
        )}
      </div>
      
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm border border-destructive/30 rounded-xl px-4 py-3 shadow-lg z-10"
          >
            <Card className="p-0 border-none shadow-none bg-transparent">
              <div className="flex items-center gap-2 mb-1">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                </div>
                <p className="text-sm font-medium flex items-center">
                  <Radio className="h-3.5 w-3.5 mr-1.5" />
                  Écoute en cours
                </p>
              </div>
              {transcript && (
                <div className="mt-2 max-w-[250px]">
                  <Badge variant="outline" className="px-1.5 py-0.5 text-xs text-muted-foreground">En direct</Badge>
                  <p className="text-xs mt-1 line-clamp-2">{transcript}</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
        
        {isSpeaking && !isMuted && !isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm border border-primary/30 rounded-xl px-4 py-2 shadow-lg z-10"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex h-3 w-3">
                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </div>
              <p className="text-sm font-medium flex items-center">
                <Headphones className="h-3.5 w-3.5 mr-1.5" />
                Lecture en cours
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
