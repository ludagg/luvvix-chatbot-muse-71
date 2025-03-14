
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircleQuestion } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export function SuggestedQuestions({ questions, onQuestionClick }: SuggestedQuestionsProps) {
  const [position, setPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Auto scroll animation
  useEffect(() => {
    if (questions.length === 0) return;
    
    const interval = setInterval(() => {
      setPosition(prev => (prev + 1) % Math.max(1, questions.length));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [questions.length]);

  if (questions.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 mb-2">
        <MessageCircleQuestion className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium text-primary">Questions suggérées</span>
      </div>
      
      <div className="relative overflow-hidden w-full" ref={containerRef}>
        <motion.div 
          className="flex gap-2 py-1 flex-nowrap"
          animate={{
            x: `-${position * (isMobile ? 80 : 60)}%`
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut"
          }}
        >
          {questions.map((question, index) => (
            <motion.div
              key={index}
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="text-xs md:text-sm border-primary/30 hover:bg-primary/10 hover:text-primary text-muted-foreground whitespace-nowrap"
                onClick={() => onQuestionClick(question)}
              >
                {question}
              </Button>
            </motion.div>
          ))}
          
          {/* Répéter les questions pour créer un effet de boucle */}
          {questions.map((question, index) => (
            <motion.div
              key={`repeat-${index}`}
              className="flex-shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="outline"
                size="sm"
                className="text-xs md:text-sm border-primary/30 hover:bg-primary/10 hover:text-primary text-muted-foreground whitespace-nowrap"
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
