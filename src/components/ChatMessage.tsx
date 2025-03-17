
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Copy, Check, RefreshCcw, Share2, ThumbsUp, ThumbsDown, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: "positive" | "negative") => void;
}

export function ChatMessage({ 
  message, 
  isLast = false, 
  onRegenerate, 
  onFeedback 
}: ChatMessageProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasFeedback, setHasFeedback] = useState<"positive" | "negative" | null>(null);
  const { toast } = useToast();

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      toast({
        title: "Texte copié !",
        description: "Le contenu du message a été copié dans le presse-papier.",
      });
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleShare = (text: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Réponse de LuvviX AI',
        text: text,
      }).then(() => {
        toast({
          title: "Partage réussi",
          description: "La réponse a été partagée avec succès.",
        });
      }).catch((error) => {
        console.error('Erreur lors du partage :', error);
        toast({
          title: "Erreur de partage",
          description: "Impossible de partager ce contenu.",
          variant: "destructive"
        });
      });
    } else {
      handleCopy(text, message.id);
      toast({
        title: "Fonctionnalité limitée",
        description: "Le partage direct n'est pas supporté par votre navigateur. Le texte a été copié à la place.",
      });
    }
  };

  const handleFeedback = (type: "positive" | "negative") => {
    if (onFeedback) {
      onFeedback(message.id, type);
      setHasFeedback(type);
      toast({
        title: type === "positive" ? "Merci pour votre retour positif!" : "Désolé que cette réponse ne soit pas utile",
        description: type === "positive" 
          ? "Nous sommes ravis que cette réponse vous ait aidé." 
          : "Nous utiliserons votre retour pour améliorer nos réponses.",
      });
    }
  };

  const isUser = message.role === "user";
  const variant = isUser ? "user" : "bot";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3 md:gap-4",
        isUser ? "flex-row-reverse" : ""
      )}
    >
      <div className="flex-shrink-0 mt-1">
        <Avatar className={cn("border", isUser ? "border-blue-200 bg-blue-100" : "border-purple-200 bg-purple-100")}>
          <AvatarFallback className={isUser ? "text-blue-500" : "text-purple-500"}>
            {isUser ? <User size={18} /> : <Bot size={18} />}
          </AvatarFallback>
          {!isUser && <AvatarImage src="/luvvix-avatar.png" alt="LuvviX AI" />}
        </Avatar>
      </div>

      <div className={cn(
        "flex flex-col space-y-1 max-w-[85%] md:max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-lg relative",
          isUser ? "bg-blue-500 text-white" : "bg-muted text-foreground"
        )}>
          <div className="prose dark:prose-invert prose-sm sm:prose-base max-w-none">
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 px-1">
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleString()}
          </span>
          
          {/* Action buttons for assistant messages */}
          {!isUser && (
            <div className="flex space-x-1 ml-2">
              {isLast && onRegenerate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full bg-background/70 hover:bg-background text-muted-foreground hover:text-foreground"
                  onClick={() => onRegenerate(message.id)}
                  title="Régénérer la réponse"
                >
                  <RefreshCcw className="h-3 w-3" />
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full bg-background/70 hover:bg-background text-muted-foreground hover:text-foreground"
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleCopy(message.content, message.id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare(message.content)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Partager
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 rounded-full bg-background/70 hover:bg-background text-muted-foreground hover:text-foreground",
                  hasFeedback === "positive" && "text-green-500 bg-green-100 hover:bg-green-200"
                )}
                onClick={() => handleFeedback("positive")}
                title="Cette réponse est utile"
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 rounded-full bg-background/70 hover:bg-background text-muted-foreground hover:text-foreground",
                  hasFeedback === "negative" && "text-red-500 bg-red-100 hover:bg-red-200"
                )}
                onClick={() => handleFeedback("negative")}
                title="Cette réponse n'est pas utile"
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
