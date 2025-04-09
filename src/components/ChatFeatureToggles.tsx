
import React from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, Search, Brain } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ChatFeatureTogglesProps {
  useAdvancedReasoning: boolean;
  useLuvviXThink: boolean;
  useWebSearch: boolean;
  onToggleAdvancedReasoning: () => void;
  onToggleLuvviXThink: () => void;
  onToggleWebSearch: () => void;
  className?: string;
}

export const ChatFeatureToggles: React.FC<ChatFeatureTogglesProps> = ({
  useAdvancedReasoning,
  useLuvviXThink,
  useWebSearch,
  onToggleAdvancedReasoning,
  onToggleLuvviXThink,
  onToggleWebSearch,
  className
}) => {
  return (
    <div className={cn("flex gap-2 items-center", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleAdvancedReasoning}
              className={useAdvancedReasoning ? "bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800" : ""}
              aria-label="Activer le raisonnement avancé"
            >
              <Lightbulb size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Raisonnement avancé</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleLuvviXThink}
              className={useLuvviXThink ? "bg-purple-100 text-purple-700 hover:bg-purple-200 hover:text-purple-800" : ""}
              aria-label="Activer LuvviXThink"
            >
              <Brain size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>LuvviXThink</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleWebSearch}
              className={useWebSearch ? "bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800" : ""}
              aria-label="Activer la recherche web"
            >
              <Search size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Recherche web</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
