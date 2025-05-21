
import React, { useState, useEffect } from "react";
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
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Consider the top position to be when scroll is less than 100px
      setIsAtTop(window.scrollY < 100);
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleScrollToggle = () => {
    // Make sure we're calling scrollToTop correctly
    if (typeof scrollToTop === 'function') {
      scrollToTop();
    } else {
      console.error("scrollToTop is not a function:", scrollToTop);
      // Fallback scrolling behavior
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  };

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
        onClick={handleScrollToggle}
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
