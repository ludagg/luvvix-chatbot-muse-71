
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendIcon, Mic, MicOff, Smile, Paperclip, Image as ImageIcon, X, Brain, Search, BrainCircuit, Globe, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendImage?: (file: File) => void;
  isLoading?: boolean;
  isPro?: boolean;
  useAdvancedReasoning: boolean;
  useLuvviXThink: boolean;
  useWebSearch: boolean;
  onToggleAdvancedReasoning: () => void;
  onToggleLuvviXThink: () => void;
  onToggleWebSearch: () => void;
}

export const ChatInput = ({ 
  onSendMessage, 
  onSendImage, 
  isLoading = false, 
  isPro = false,
  useAdvancedReasoning,
  useLuvviXThink,
  useWebSearch,
  onToggleAdvancedReasoning,
  onToggleLuvviXThink,
  onToggleWebSearch
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    
    if (selectedFile && onSendImage && !isLoading) {
      onSendImage(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }
    
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
      
      if (isListening && recognitionInstance) {
        recognitionInstance.stop();
        setIsListening(false);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isPro && file.size > 5 * 1024 * 1024) {
        toast({
          title: "Limite de taille atteinte",
          description: "Les images sont limitées à 5 MB. Passez à la version Pro pour envoyer des fichiers plus grands.",
          variant: "destructive"
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Type de fichier non supporté",
          description: "Seules les images sont acceptées.",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    setMessage(prev => prev + emoji.native);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleWebSearchToggle = () => {
    onToggleWebSearch();
  };

  const handleAdvancedReasoningToggle = () => {
    onToggleAdvancedReasoning();
  };

  const handleLuvviXThinkToggle = () => {
    onToggleLuvviXThink();
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
      {selectedFile && previewUrl && (
        <div className="absolute -top-24 left-0 right-0 bg-background/95 backdrop-blur-sm border border-primary/20 rounded-lg p-2 flex items-center">
          <div className="relative w-16 h-16 rounded-md overflow-hidden mr-2">
            <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={clearSelectedFile}
          >
            <X size={16} />
          </Button>
        </div>
      )}
      
      <div className="mb-2 flex items-center justify-center gap-2 flex-wrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={useAdvancedReasoning ? "default" : "outline"}
                size="sm"
                onClick={handleAdvancedReasoningToggle}
                className="h-8 gap-1 text-xs font-medium transition-all"
              >
                <BrainCircuit size={14} className={useAdvancedReasoning ? "text-primary-foreground" : "text-muted-foreground"} />
                <span>Raisonnement avancé</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Réponses plus détaillées avec analyse étape par étape</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={useLuvviXThink ? "default" : "outline"}
                size="sm"
                onClick={handleLuvviXThinkToggle}
                className="h-8 gap-1 text-xs font-medium transition-all"
              >
                <Lightbulb size={14} className={useLuvviXThink ? "text-primary-foreground" : "text-muted-foreground"} />
                <span>LuvviXThink</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Réflexion approfondie avant de répondre à vos questions</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={useWebSearch ? "default" : "outline"}
                size="sm"
                onClick={handleWebSearchToggle}
                className={`h-8 gap-1 text-xs font-medium transition-all ${useWebSearch ? "animate-pulse" : ""}`}
              >
                <Globe size={14} className={useWebSearch ? "text-primary-foreground" : "text-muted-foreground"} />
                <span>{useWebSearch ? "LuvvixSEARCH ACTIF" : "LuvvixSEARCH"}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Recherche sur le web en temps réel pour des réponses actualisées</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="relative flex items-center w-full bg-secondary/40 backdrop-blur-sm border border-primary/20 rounded-full shadow-lg overflow-hidden pl-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <ImageIcon size={16} />
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              <Smile size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 border-none bg-transparent shadow-none" align="start" sideOffset={5}>
            <Picker 
              data={data} 
              onEmojiSelect={handleEmojiSelect}
              theme={window.document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
              set="apple"
            />
          </PopoverContent>
        </Popover>
        
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
                variant={isListening ? "default" : "ghost"}
                className={cn(
                  "h-8 w-8 transition-all",
                  isListening ? "bg-red-500 hover:bg-red-600 text-white" : "text-muted-foreground hover:text-foreground"
                )}
                onClick={toggleListening}
                disabled={isLoading}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </Button>
              <Button
                type="submit"
                size="icon"
                disabled={(message.trim() === "" && !selectedFile) || isLoading}
                className={cn(
                  "h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/25",
                  (message.trim() === "" && !selectedFile) && "opacity-70"
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
