import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendIcon, Mic, MicOff, Smile, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [recognitionInstance, setRecognitionInstance] = useState<SpeechRecognition | null>(null);

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
        
        setMessage(transcript);
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
  }, [toast]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
      
      if (isListening && recognitionInstance) {
        recognitionInstance.stop();
        setIsListening(false);
      }
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [message]);

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onSubmit={handleSubmit}
      className="relative w-full"
    >
      <div className="relative flex items-center w-full bg-secondary/40 backdrop-blur-sm border border-primary/20 rounded-full shadow-lg overflow-hidden pl-2">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Paperclip size={16} />
        </Button>
        
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Message LuvviX..."
          className="w-full py-3 px-3 bg-transparent border-none resize-none max-h-[150px] focus-visible:outline-none"
          rows={1}
          disabled={isLoading}
        />
        
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="pr-3 pl-2"
            >
              <div className="h-8 w-8 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="buttons"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex pr-3 pl-2 gap-1"
            >
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Smile size={16} />
              </Button>
              <Button
                type="button"
                size="icon"
                variant={isListening ? "default" : "ghost"}
                className={cn(
                  "h-8 w-8 transition-all",
                  isListening ? "bg-red-500 hover:bg-red-600 text-white" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={toggleListening}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </Button>
              <Button
                type="submit"
                size="icon"
                disabled={message.trim() === "" || isLoading}
                className={cn(
                  "h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/25",
                  message.trim() === "" && "opacity-70"
                )}
              >
                <SendIcon size={14} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {isListening && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute -top-8 left-0 right-0 text-center text-xs text-red-500 font-medium"
        >
          Écoute en cours... Parlez maintenant
        </motion.div>
      )}
    </motion.form>
  );
};
