
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendIcon, Mic, StopCircle, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  
  // Handle send message
  const handleSendMessage = () => {
    if (isLoading || !inputValue.trim()) return;
    
    onSendMessage(inputValue);
    setInputValue('');
    
    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  // Handle input key press (Shift + Enter = new line, Enter = send)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle auto-growing textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  // Toggle speech recognition
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };
  
  // Start speech recognition
  const startRecording = () => {
    setIsRecording(true);
    
    // This is just a placeholder. In a real implementation, we'd use browser's
    // SpeechRecognition API or a suitable library
    toast({
      title: "Reconnaissance vocale",
      description: "Cette fonctionnalité sera disponible prochainement.",
    });
    
    // Simulate ending recording after a delay
    setTimeout(() => {
      stopRecording();
    }, 2000);
  };
  
  // Stop speech recognition
  const stopRecording = () => {
    setIsRecording(false);
  };

  // Handle image upload
  const handleImageUpload = () => {
    toast({
      title: "Upload d'images",
      description: "Cette fonctionnalité sera disponible prochainement.",
    });
  };
  
  // Add emoji to input
  const handleEmojiSelect = (emoji: any) => {
    setInputValue(prev => prev + emoji.native);
    setIsEmojiPickerOpen(false);
    
    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  };
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        {/* Image upload button */}
        <Button 
          onClick={handleImageUpload}
          type="button"
          size="icon"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground"
        >
          <Image className="h-5 w-5" />
        </Button>
        
        {/* Emoji picker */}
        <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
          <PopoverTrigger asChild>
            <Button 
              type="button"
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-none bg-transparent" align="start">
            <Picker 
              data={data} 
              onEmojiSelect={handleEmojiSelect}
              theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
            />
          </PopoverContent>
        </Popover>
        
        {/* Main input area */}
        <div className="relative flex-1">
          <Textarea 
            ref={textareaRef}
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Posez une question à LuvviX AI..."
            className="pr-12 min-h-[40px] max-h-[200px] resize-none rounded-lg py-3 px-4 overflow-y-auto"
            disabled={isLoading}
          />
          
          {/* Send button (positioned absolutely for better UX) */}
          <AnimatePresence>
            {inputValue.trim() && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-2 right-2"
              >
                <Button 
                  onClick={handleSendMessage}
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  disabled={isLoading || !inputValue.trim()}
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Voice input button */}
        <Button 
          onClick={toggleSpeechRecognition}
          type="button"
          size="icon"
          variant={isRecording ? "destructive" : "ghost"}
          className={isRecording ? "" : "text-muted-foreground hover:text-foreground"}
        >
          {isRecording ? (
            <StopCircle className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      {/* Info text below input */}
      <p className="text-xs text-center text-muted-foreground">
        LuvviX AI peut occasionnellement faire des erreurs. Vérifiez les informations importantes.
      </p>
    </div>
  );
}
