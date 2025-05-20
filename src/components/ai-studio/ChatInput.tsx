
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  disabled = false,
  placeholder = "Tapez un message..."
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobileDevice = window.innerWidth <= 768;

  // Ajustement automatique de la hauteur du textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;
    
    onSendMessage(input);
    setInput('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isMobileDevice) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="relative flex items-end gap-2"
    >
      <div className="relative flex-grow">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading || disabled}
          rows={1}
          className="w-full min-h-[44px] max-h-[150px] resize-none rounded-xl px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all duration-200 text-gray-900 dark:text-gray-100"
        />
        <div className="absolute right-2 bottom-1">
          <Button
            type="submit"
            disabled={!input.trim() || isLoading || disabled}
            size="sm"
            variant="ghost"
            className="h-8 w-8 rounded-full p-0 hover:bg-blue-100 dark:hover:bg-gray-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <Send className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Bouton d'IA pour des suggestions */}
      <Button
        type="button"
        disabled={isLoading || disabled}
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-violet-500 dark:text-violet-400 flex-shrink-0"
        title="Suggestions d'IA"
      >
        <Sparkles className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatInput;
