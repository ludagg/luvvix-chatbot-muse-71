
import React from "react";
import { ArrowUp, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface FloatingActionsProps {
  scrollToTop: () => void;
  className?: string;
}

export const FloatingActions = ({ scrollToTop, className }: FloatingActionsProps) => {
  const { createNewConversation, user } = useAuth();
  const { toast } = useToast();

  const handleNewConversation = () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour créer une nouvelle discussion.",
        variant: "destructive",
      });
      return;
    }
    
    const newId = createNewConversation();
    toast({
      title: "Nouvelle discussion créée",
      description: "Vous pouvez commencer à discuter.",
    });
  };

  return (
    <div className={cn("fixed bottom-24 right-4 z-30 flex flex-col gap-2", className)}>
      <Button
        size="icon"
        className="rounded-full bg-primary shadow-lg hover:bg-primary/90"
        onClick={scrollToTop}
        aria-label="Retour en haut"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
      
      <Button
        size="icon"
        className="rounded-full bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/90"
        onClick={handleNewConversation}
        aria-label="Nouvelle discussion"
      >
        <MessageSquarePlus className="h-5 w-5" />
      </Button>
    </div>
  );
};
