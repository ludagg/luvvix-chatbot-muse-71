
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
      <div className="w-full flex flex-wrap justify-center gap-2">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onQuestionClick(question)}
            className={cn(
              "rounded-full px-4 py-2 text-sm border border-border/50 hover:bg-primary/10 transition-colors",
              "bg-background/80 backdrop-blur-sm",
              isMobile ? "text-xs py-1.5 px-3" : "text-sm"
            )}
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
