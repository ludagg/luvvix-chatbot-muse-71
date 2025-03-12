
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

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
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex w-full mb-4 items-end",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] md:max-w-[70%] px-4 py-3 rounded-2xl",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "glass-panel rounded-tl-none"
        )}
      >
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </motion.div>
  );
};
