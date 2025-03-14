
import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
}

export function ChatMessage({ message, isLast = false }: ChatMessageProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
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
          
          {/* Copy button for assistant messages */}
          {!isUser && (
            <div className="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full bg-background/70 hover:bg-background text-muted-foreground hover:text-foreground"
                onClick={() => handleCopy(message.content, message.id)}
              >
                {copiedId === message.id ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground px-1">
          {new Date(message.timestamp).toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}
