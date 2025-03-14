
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import { useIsMobile } from "@/hooks/use-mobile";

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
}

export const ChatMessage = ({ message, isLast }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex w-full mb-3 md:mb-4 items-end gap-1 md:gap-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-primary/80 text-primary-foreground flex items-center justify-center font-semibold text-xs md:text-sm flex-shrink-0 shadow-md">
          L
        </div>
      )}
      
      <div
        className={cn(
          "max-w-[90%] sm:max-w-[85%] px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl text-sm md:text-base",
          isUser
            ? "bg-gradient-to-r from-primary/90 to-primary/75 text-primary-foreground rounded-tr-none shadow-lg shadow-primary/20"
            : "bg-secondary/80 backdrop-blur-md border border-primary/10 rounded-tl-none shadow-md"
        )}
      >
        <div className="leading-relaxed prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
      
      {isUser && (
        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-background border border-border text-foreground flex items-center justify-center font-semibold text-xs md:text-sm flex-shrink-0 shadow-md">
          U
        </div>
      )}
    </motion.div>
  );
};
