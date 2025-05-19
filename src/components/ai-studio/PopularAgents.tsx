
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

interface PopularAgentsProps {
  limit?: number;
  showTitle?: boolean;
  sortBy?: "views" | "rating";
}

export default function PopularAgents({ 
  limit = 3, 
  showTitle = true,
  sortBy = "views"
}: PopularAgentsProps) {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularAgents = async () => {
      try {
        const { data, error } = await supabase
          .from("ai_agents")
          .select("id, name, objective, personality, views, rating, avatar_style, user_id")
          .eq("is_public", true)
          .order(sortBy, { ascending: false })
          .limit(limit);
          
        if (error) throw error;

        // Fetch creator names for each agent
        if (data && data.length > 0) {
          const creatorIds = data.map(agent => agent.user_id);
          const { data: creatorData, error: creatorError } = await supabase
            .from("user_profiles")
            .select("id, username, full_name")
            .in("id", creatorIds);

          if (creatorError) throw creatorError;

          // Map creator data to agents
          const agentsWithCreators = data.map(agent => ({
            ...agent,
            creator: creatorData?.find(creator => creator.id === agent.user_id)
          }));

          setAgents(agentsWithCreators);
        } else {
          setAgents(data || []);
        }
      } catch (error) {
        console.error("Error fetching popular agents:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPopularAgents();
  }, [limit, sortBy]);

  const getAvatarIcon = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "A";
  };

  const getPersonalityText = (personality: string) => {
    switch (personality) {
      case "expert": return "Expert";
      case "friendly": return "Amical";
      case "concise": return "Concis";
      case "empathetic": return "Empathique";
      default: return personality;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {showTitle && <h2 className="text-xl font-semibold mb-4">Agents populaires</h2>}
        {Array(limit).fill(0).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <Skeleton className="h-12 w-full" />
            </CardContent>
            <CardFooter>
              <div className="flex justify-between w-full items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-9 w-28" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (agents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <h2 className="text-xl font-semibold mb-4">
          {sortBy === "views" ? "Agents populaires" : "Agents les mieux notés"}
        </h2>
      )}
      
      {agents.map(agent => (
        <Card key={agent.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-start">
              <Avatar className="mr-3 h-10 w-10 bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                <AvatarFallback>
                  {getAvatarIcon(agent.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{agent.name}</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {getPersonalityText(agent.personality)}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pb-2">
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
              {agent.objective}
            </p>
            
            {agent.creator && (
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <span>Par </span>
                <Link 
                  to={`/ai-studio/creators/${agent.user_id}`} 
                  className="ml-1 font-medium hover:underline text-violet-600 dark:text-violet-400"
                >
                  {agent.creator.username || agent.creator.full_name || "Créateur anonyme"}
                </Link>
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <div className="flex justify-between w-full items-center">
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center mr-3">
                  <Star className="h-3.5 w-3.5 mr-1 text-amber-500" />
                  <span>{(agent.rating || 0).toFixed(1)}</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-3.5 w-3.5 mr-1" />
                  <span>{agent.views || 0}</span>
                </div>
              </div>
              
              <Button asChild size="sm" variant="secondary">
                <Link to={`/ai-studio/agents/${agent.id}`}>
                  Voir
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
      
      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link to="/ai-studio/marketplace">
            Voir plus d'agents
          </Link>
        </Button>
      </div>
    </div>
  );
}
