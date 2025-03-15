
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
    <div className="w-full flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full overflow-x-auto pb-2 flex flex-wrap justify-center gap-2"
      >
        {questions.map((question, index) => (
          <motion.button
            key={index}
            onClick={() => onQuestionClick(question)}
            className={cn(
              "rounded-full px-4 py-2 text-sm border border-border/50 hover:bg-primary/10 transition-colors",
              "flex-none bg-background/80 backdrop-blur-sm",
              isMobile ? "text-xs py-1.5 px-3" : "text-sm"
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {question}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
