
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AlignLeft, 
  List, 
  ListChecks, 
  Calendar, 
  Mail, 
  Globe, 
  Phone, 
  Hash, 
  ChevronDown,
  Info 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { FormQuestion } from "@/services/forms-service";

interface QuestionType {
  id: FormQuestion["question_type"];
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface QuestionCreatorProps {
  formId?: string;
  onAddQuestion: (type: FormQuestion["question_type"]) => Promise<void>;
}

const QuestionCreator = ({ formId, onAddQuestion }: QuestionCreatorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const questionTypes: QuestionType[] = [
    {
      id: "text",
      label: "Texte court",
      icon: <AlignLeft className="h-5 w-5" />,
      description: "Réponse courte d'une ligne"
    },
    {
      id: "textarea",
      label: "Texte long",
      icon: <AlignLeft className="h-5 w-5" />,
      description: "Réponse sur plusieurs lignes"
    },
    {
      id: "multipleChoice",
      label: "Choix multiple",
      icon: <List className="h-5 w-5" />,
      description: "Sélection d'une seule option"
    },
    {
      id: "checkboxes",
      label: "Cases à cocher",
      icon: <ListChecks className="h-5 w-5" />,
      description: "Sélection de plusieurs options"
    },
    {
      id: "dropdown",
      label: "Liste déroulante",
      icon: <ChevronDown className="h-5 w-5" />,
      description: "Menu déroulant avec options"
    },
    {
      id: "email",
      label: "Email",
      icon: <Mail className="h-5 w-5" />,
      description: "Adresse email avec validation"
    },
    {
      id: "number",
      label: "Nombre",
      icon: <Hash className="h-5 w-5" />,
      description: "Valeur numérique"
    },
    {
      id: "date",
      label: "Date",
      icon: <Calendar className="h-5 w-5" />,
      description: "Sélection d'une date"
    },
    {
      id: "phone",
      label: "Téléphone",
      icon: <Phone className="h-5 w-5" />,
      description: "Numéro de téléphone"
    },
    {
      id: "url",
      label: "URL",
      icon: <Globe className="h-5 w-5" />,
      description: "Adresse web"
    }
  ];
  
  const handleAddQuestion = async (type: FormQuestion["question_type"]) => {
    if (!formId) return;
    
    setIsLoading(true);
    try {
      await onAddQuestion(type);
      toast.success(`Question de type ${type} ajoutée`);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la question:", error);
      toast.error("Impossible d'ajouter la question");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="p-6 my-8 border-2 border-dashed border-gray-200 hover:border-purple-300 transition-colors">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium mb-2">Ajouter une nouvelle question</h3>
        <p className="text-gray-500">Choisissez le type de question à ajouter à votre formulaire</p>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800">
                <Info className="h-4 w-4 mr-1" />
                <span>Astuce pour les options multiples</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs p-3 bg-white border shadow-lg rounded-md text-sm">
              <p>Pour ajouter plusieurs options dans les questions à choix, utilisez <strong>Shift+Entrée</strong> pour créer une nouvelle ligne.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {questionTypes.map((type) => (
          <Button
            key={type.id}
            variant="outline"
            className="h-auto flex flex-col items-center justify-center p-3 hover:bg-purple-50 hover:border-purple-300 transition-colors"
            onClick={() => handleAddQuestion(type.id)}
            disabled={isLoading}
          >
            <div className="text-purple-500 mb-2">{type.icon}</div>
            <span className="text-sm font-medium">{type.label}</span>
            <span className="text-xs text-gray-500 mt-1 hidden md:block">{type.description}</span>
          </Button>
        ))}
      </div>
      
      <div className="mt-6 flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Plus d'options
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleAddQuestion("text")}>
              Question avec logique conditionnelle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddQuestion("grid")}>
              Grille d'évaluation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddQuestion("text")}>
              Téléchargement de fichier
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};

export default QuestionCreator;
