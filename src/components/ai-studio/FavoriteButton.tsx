
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FavoriteButtonProps {
  agentId: string;
  initialIsFavorite?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
}

const FavoriteButton = ({ 
  agentId, 
  initialIsFavorite = false, 
  size = "md", 
  variant = "outline" 
}: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        
        // Check if this agent is already favorited
        if (!initialIsFavorite) {
          const { data, error } = await supabase
            .from('ai_favorites')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('agent_id', agentId)
            .maybeSingle();
            
          if (!error && data) {
            setIsFavorite(true);
          }
        }
      }
    };
    
    checkAuth();
  }, [agentId, initialIsFavorite]);

  const toggleFavorite = async () => {
    if (!userId) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des agents aux favoris",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('ai_favorites')
          .delete()
          .eq('user_id', userId)
          .eq('agent_id', agentId);
          
        if (error) throw error;
        
        toast({
          title: "Retiré des favoris",
          description: "L'agent a été retiré de vos favoris"
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('ai_favorites')
          .insert({
            user_id: userId,
            agent_id: agentId
          });
          
        if (error) throw error;
        
        toast({
          title: "Ajouté aux favoris",
          description: "L'agent a été ajouté à vos favoris"
        });
      }
      
      setIsFavorite(!isFavorite);
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const buttonSize = {
    sm: "h-8 px-2",
    md: "h-9 px-3",
    lg: "h-10 px-4"
  }[size];
  
  return (
    <Button
      variant={variant}
      className={`${buttonSize} ${isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-yellow-500"}`}
      onClick={toggleFavorite}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Star className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
      )}
    </Button>
  );
};

export default FavoriteButton;
