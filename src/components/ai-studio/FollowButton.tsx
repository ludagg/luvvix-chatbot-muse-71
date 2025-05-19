
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FollowButtonProps {
  creatorId: string;
  initialIsFollowing?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  showLabel?: boolean;
}

const FollowButton = ({ 
  creatorId, 
  initialIsFollowing = false, 
  size = "md", 
  variant = "outline",
  showLabel = false
}: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        
        // Don't follow yourself
        if (session.user.id === creatorId) {
          return;
        }
        
        // Check if already following this creator
        if (!initialIsFollowing) {
          const { data, error } = await supabase
            .from('ai_follows')
            .select('id')
            .eq('follower_id', session.user.id)
            .eq('creator_id', creatorId)
            .maybeSingle();
            
          if (!error && data) {
            setIsFollowing(true);
          }
        }
      }
    };
    
    checkAuth();
  }, [creatorId, initialIsFollowing]);

  const toggleFollow = async () => {
    if (!userId) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour suivre des créateurs",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }
    
    // Don't allow following yourself
    if (userId === creatorId) {
      toast({
        title: "Action impossible",
        description: "Vous ne pouvez pas vous suivre vous-même",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('ai_follows')
          .delete()
          .eq('follower_id', userId)
          .eq('creator_id', creatorId);
          
        if (error) throw error;
        
        toast({
          title: "Désabonnement",
          description: "Vous ne suivez plus ce créateur"
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('ai_follows')
          .insert({
            follower_id: userId,
            creator_id: creatorId
          });
          
        if (error) throw error;
        
        toast({
          title: "Abonnement",
          description: "Vous suivez maintenant ce créateur"
        });
      }
      
      setIsFollowing(!isFollowing);
    } catch (error: any) {
      console.error("Error toggling follow:", error);
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
    sm: showLabel ? "h-8 px-3" : "h-8 w-8 p-0",
    md: showLabel ? "h-9 px-4" : "h-9 w-9 p-0",
    lg: showLabel ? "h-10 px-5" : "h-10 w-10 p-0"
  }[size];
  
  // Don't show for your own profile
  if (userId === creatorId) {
    return null;
  }
  
  return (
    <Button
      variant={variant}
      className={buttonSize}
      onClick={toggleFollow}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {isFollowing ? (
            <UserCheck className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {showLabel && (
            <span className="ml-2">{isFollowing ? "Abonné" : "Suivre"}</span>
          )}
        </>
      )}
    </Button>
  );
};

export default FollowButton;
