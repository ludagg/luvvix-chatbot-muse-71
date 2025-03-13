
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendIcon, Mic, Smile, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading = false }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };

  // Auto-resize textarea
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
      <div className="relative flex items-center w-full bg-secondary/30 backdrop-blur-sm border border-primary/20 rounded-full shadow-lg overflow-hidden pl-2">
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
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Mic size={16} />
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
    </motion.form>
  );
};
