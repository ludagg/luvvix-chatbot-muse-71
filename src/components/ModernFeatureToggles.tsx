
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  BrainCircuit, 
  Lightbulb, 
  Globe, 
  ChevronDown, 
  ChevronUp,
  Sparkles
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ModernFeatureTogglesProps {
  useAdvancedReasoning: boolean;
  onToggleAdvancedReasoning: () => void;
  useLuvviXThink: boolean;
  onToggleLuvviXThink: () => void;
  useWebSearch: boolean;
  onToggleWebSearch: () => void;
  useSentimentAnalysis?: boolean;
  onToggleSentimentAnalysis?: () => void;
  isPro?: boolean;
}

export function ModernFeatureToggles({
  useAdvancedReasoning,
  onToggleAdvancedReasoning,
  useLuvviXThink,
  onToggleLuvviXThink,
  useWebSearch,
  onToggleWebSearch,
  useSentimentAnalysis,
  onToggleSentimentAnalysis,
  isPro = false
}: ModernFeatureTogglesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative w-full">
      <div className="w-full flex items-center justify-between px-4 py-2 border-t border-border/20">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground flex items-center gap-1 h-7 px-2 rounded-md"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Sparkles className="h-3 w-3" />
          <span>LuvviX Fonctionnalités</span>
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>

        <div className="flex items-center gap-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={useWebSearch ? "default" : "outline"}
                  className={cn(
                    "h-7 w-7 rounded-full p-0",
                    useWebSearch ? "bg-primary/90 hover:bg-primary" : "border-muted-foreground/30"
                  )}
                  onClick={onToggleWebSearch}
                >
                  <Globe className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Recherche web {useWebSearch ? "(activée)" : "(désactivée)"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={useAdvancedReasoning ? "default" : "outline"}
                  className={cn(
                    "h-7 w-7 rounded-full p-0",
                    useAdvancedReasoning ? "bg-primary/90 hover:bg-primary" : "border-muted-foreground/30"
                  )}
                  onClick={onToggleAdvancedReasoning}
                >
                  <BrainCircuit className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Raisonnement avancé {useAdvancedReasoning ? "(activé)" : "(désactivé)"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full bg-muted/30 backdrop-blur-sm rounded-lg mt-1 overflow-hidden border border-border/20 shadow-lg"
          >
            <div className="p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Recherche web</h3>
                    <p className="text-xs text-muted-foreground">Accéder aux informations du web</p>
                  </div>
                </div>
                <Switch checked={useWebSearch} onCheckedChange={onToggleWebSearch} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <BrainCircuit className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Raisonnement avancé</h3>
                    <p className="text-xs text-muted-foreground">Analyse approfondie et précise</p>
                  </div>
                </div>
                <Switch checked={useAdvancedReasoning} onCheckedChange={onToggleAdvancedReasoning} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div>
                      <h3 className="text-sm font-medium">LuvviXThink</h3>
                      <p className="text-xs text-muted-foreground">Réflexion approfondie et créative</p>
                    </div>
                    {!isPro && (
                      <Badge variant="outline" className="text-[9px] h-4 px-1 border-amber-500/50 text-amber-500">PRO</Badge>
                    )}
                  </div>
                </div>
                <Switch checked={useLuvviXThink} onCheckedChange={onToggleLuvviXThink} disabled={!isPro} />
              </div>

              {useSentimentAnalysis !== undefined && onToggleSentimentAnalysis && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-sm">😊</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <h3 className="text-sm font-medium">Analyse des sentiments</h3>
                        <p className="text-xs text-muted-foreground">Détection des émotions dans le texte</p>
                      </div>
                      {!isPro && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1 border-amber-500/50 text-amber-500">PRO</Badge>
                      )}
                    </div>
                  </div>
                  <Switch 
                    checked={useSentimentAnalysis} 
                    onCheckedChange={onToggleSentimentAnalysis} 
                    disabled={!isPro} 
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
