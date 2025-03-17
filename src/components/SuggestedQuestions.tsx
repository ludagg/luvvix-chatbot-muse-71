
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export function SuggestedQuestions({ questions, onQuestionClick }: SuggestedQuestionsProps) {
  const isMobile = useIsMobile();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, staggerChildren: 0.1 }}
      className="w-full flex flex-col items-center"
    >
      <div className="w-full flex flex-wrap justify-center gap-2">
        {questions.map((question, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onQuestionClick(question)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium border border-primary/20 hover:bg-primary/10 transition-all",
              "bg-background/80 backdrop-blur-sm shadow-sm hover:shadow",
              isMobile ? "text-xs py-1.5 px-3" : "text-sm"
            )}
          >
            {question}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
