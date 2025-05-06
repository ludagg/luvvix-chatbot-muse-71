
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
  Sparkles,
  Zap,
  Heart,
  Search
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface EnhancedFeatureTogglesProps {
  useAdvancedReasoning: boolean;
  onToggleAdvancedReasoning: () => void;
  useLuvviXThink: boolean;
  onToggleLuvviXThink: () => void;
  useWebSearch: boolean;
  onToggleWebSearch: () => void;
  useSentimentAnalysis?: boolean;
  onToggleSentimentAnalysis?: () => void;
  useContextMemory?: boolean;
  onToggleContextMemory?: () => void;
  isPro?: boolean;
}

export function EnhancedFeatureToggles({
  useAdvancedReasoning,
  onToggleAdvancedReasoning,
  useLuvviXThink,
  onToggleLuvviXThink,
  useWebSearch,
  onToggleWebSearch,
  useSentimentAnalysis,
  onToggleSentimentAnalysis,
  useContextMemory,
  onToggleContextMemory,
  isPro = false
}: EnhancedFeatureTogglesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const features = [
    {
      name: "Recherche web",
      description: "Accéder aux informations du web",
      icon: <Globe className="h-4 w-4 text-primary" />,
      isActive: useWebSearch,
      toggle: onToggleWebSearch,
      isPro: false
    },
    {
      name: "Raisonnement avancé",
      description: "Analyse approfondie et précise",
      icon: <BrainCircuit className="h-4 w-4 text-primary" />,
      isActive: useAdvancedReasoning,
      toggle: onToggleAdvancedReasoning,
      isPro: false
    },
    {
      name: "LuvviXThink",
      description: "Réflexion approfondie et créative",
      icon: <Lightbulb className="h-4 w-4 text-primary" />,
      isActive: useLuvviXThink,
      toggle: onToggleLuvviXThink,
      isPro: true
    }
  ];

  if (useSentimentAnalysis !== undefined && onToggleSentimentAnalysis) {
    features.push({
      name: "Analyse des sentiments",
      description: "Détection des émotions dans le texte",
      icon: <Heart className="h-4 w-4 text-primary" />,
      isActive: useSentimentAnalysis,
      toggle: onToggleSentimentAnalysis,
      isPro: true
    });
  }

  if (useContextMemory !== undefined && onToggleContextMemory) {
    features.push({
      name: "Mémoire contextuelle",
      description: "Se souvenir des conversations précédentes",
      icon: <Zap className="h-4 w-4 text-primary" />,
      isActive: useContextMemory,
      toggle: onToggleContextMemory,
      isPro: true
    });
  }

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
          <span>Fonctionnalités</span>
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>

        <div className="flex items-center gap-1.5">
          {features.slice(0, 3).map((feature, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={feature.isActive ? "default" : "outline"}
                    className={cn(
                      "h-7 w-7 rounded-full p-0",
                      feature.isActive ? "bg-primary/90 hover:bg-primary" : "border-muted-foreground/30",
                      feature.isPro && !isPro && "opacity-50"
                    )}
                    onClick={feature.toggle}
                    disabled={feature.isPro && !isPro}
                  >
                    {index === 0 && <Globe className="h-3.5 w-3.5" />}
                    {index === 1 && <BrainCircuit className="h-3.5 w-3.5" />}
                    {index === 2 && <Lightbulb className="h-3.5 w-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{feature.name} {feature.isActive ? "(activé)" : "(désactivé)"}</p>
                  {feature.isPro && !isPro && <p className="text-xs text-amber-500">Fonctionnalité Pro</p>}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
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
              {features.map((feature, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <div className="flex items-center gap-2">
                      <div>
                        <h3 className="text-sm font-medium">{feature.name}</h3>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                      {feature.isPro && !isPro && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1 border-amber-500/50 text-amber-500">PRO</Badge>
                      )}
                    </div>
                  </div>
                  <Switch 
                    checked={feature.isActive} 
                    onCheckedChange={feature.toggle} 
                    disabled={feature.isPro && !isPro} 
                  />
                </div>
              ))}
              
              {!isPro && (
                <>
                  <Separator />
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full text-xs border-amber-500/30 text-amber-500 hover:bg-amber-500/10 mt-2"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Débloquer toutes les fonctionnalités
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
