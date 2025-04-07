
import { motion } from "framer-motion";
import { WorldState } from "@/pages/LuvviXWorld";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorldTooltipProps {
  type: string;
  worldState: WorldState;
  onClose: () => void;
}

export const WorldTooltip = ({ type, worldState, onClose }: WorldTooltipProps) => {
  const getTooltipContent = () => {
    switch (type) {
      case "planet":
        return {
          title: "Planète de la Conscience",
          description: "Cette planète représente votre conscience. Elle évolue avec vos interactions et se développe au fil du temps.",
          stat: `Interactions: ${worldState.interactions}`,
        };
      case "tree":
        return {
          title: "Arbres de Connaissance",
          description: "Ces arbres symbolisent votre savoir. Ils grandissent à mesure que vous apprenez et posez des questions.",
          stat: `Savoir: ${worldState.knowledge}%`,
        };
      case "mirror":
        return {
          title: "Miroir de l'Âme",
          description: "Ce miroir reflète votre état émotionnel actuel, changeant de couleur selon votre humeur.",
          stat: `État émotionnel: ${worldState.emotionalState}%`,
        };
      case "tower":
        return {
          title: "Tour de Concentration",
          description: "Cette tour symbolise votre concentration. Elle s'élève avec la régularité de vos interactions.",
          stat: `Concentration: ${worldState.concentration}%`,
        };
      case "portal":
        return {
          title: "Portail des Rêves",
          description: "Ce portail s'ouvre progressivement à mesure que vous atteignez vos objectifs.",
          stat: `Objectifs atteints: ${worldState.goalsAchieved}%`,
        };
      case "info":
        return {
          title: "LuvviX World",
          description: "Bienvenue dans votre univers mental ! Ce monde évolue avec vous et reflète votre progression intellectuelle, émotionnelle et spirituelle. Interagissez avec les éléments pour voir comment votre monde change.",
          stat: "Créé avec ❤️ par LuvviX AI",
        };
      default:
        return {
          title: "Élément inconnu",
          description: "Cet élément n'a pas encore de description.",
          stat: "",
        };
    }
  };
  
  const content = getTooltipContent();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-xs p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-lg shadow-lg border border-white/30 dark:border-white/10 z-50"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-sm font-medium">{content.title}</h3>
        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={onClose}>
          <X className="h-3 w-3" />
        </Button>
      </div>
      <p className="text-xs text-foreground/80 mt-1">{content.description}</p>
      {content.stat && (
        <p className="text-xs font-medium mt-2 text-primary">{content.stat}</p>
      )}
    </motion.div>
  );
};
