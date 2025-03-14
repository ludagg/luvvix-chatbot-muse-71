
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircleQuestion } from "lucide-react";
import { motion } from "framer-motion";

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export function SuggestedQuestions({ questions, onQuestionClick }: SuggestedQuestionsProps) {
  const [position, setPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll animation
  useEffect(() => {
    if (questions.length === 0) return;
    
    const interval = setInterval(() => {
      setPosition(prev => (prev + 1) % questions.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [questions.length]);

  if (questions.length === 0) return null;

  return (
    <div className="px-4 md:px-6 pb-3 pt-1">
      <div className="flex items-center gap-1.5 mb-1.5">
        <MessageCircleQuestion className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-primary">Questions suggérées</span>
      </div>
      
      <div className="relative overflow-hidden" ref={containerRef}>
        <motion.div 
          className="flex gap-2 py-1"
          animate={{
            x: `-${position * 100}%`
          }}
          transition={{
            duration: 0.5,
            ease: "easeInOut"
          }}
        >
          {questions.map((question, index) => (
            <motion.div
              key={index}
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-primary/30 hover:bg-primary/10 hover:text-primary text-muted-foreground whitespace-nowrap"
                onClick={() => onQuestionClick(question)}
              >
                {question}
              </Button>
            </motion.div>
          ))}
          
          {/* Repeat first few items to create seamless loop effect */}
          {questions.slice(0, 3).map((question, index) => (
            <motion.div
              key={`repeat-${index}`}
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-primary/30 hover:bg-primary/10 hover:text-primary text-muted-foreground whitespace-nowrap"
                onClick={() => onQuestionClick(question)}
              >
                {question}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
