
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Sparkles, MessageSquare, Star } from "lucide-react";
import FavoriteButton from "@/components/ai-studio/FavoriteButton";

interface FeaturedAgentsProps {
  limit?: number;
  showHeading?: boolean;
  className?: string;
}

const FeaturedAgents = ({ limit = 3, showHeading = true, className = "" }: FeaturedAgentsProps) => {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeaturedAgents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("ai_agents")
          .select("*")
          .eq("is_public", true)
          .order("views", { ascending: false })
          .limit(limit);
          
        if (error) throw error;
        
        setAgents(data || []);
      } catch (error) {
        console.error("Error fetching featured agents:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedAgents();
  }, [limit]);
  
  const getAgentIcon = (avatarStyle: string) => {
    switch (avatarStyle) {
      case "bot":
        return <Bot className="h-full w-full p-1.5" />;
      case "sparkles":
        return <Sparkles className="h-full w-full p-1.5" />;
      default:
        return <Bot className="h-full w-full p-1.5" />;
    }
  };
  
  const getAvatarColor = (avatarStyle: string) => {
    switch (avatarStyle) {
      case "bot":
        return "bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300";
      case "sparkles":
        return "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300";
    }
  };

  return (
    <div className={className}>
      {showHeading && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Agents recommandés</h2>
          <Button variant="outline" asChild>
            <Link to="/ai-studio/marketplace">Voir tout</Link>
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading
          ? Array(limit)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))
          : agents.map((agent) => (
              <Card key={agent.id} className="overflow-hidden hover:shadow-md transition-all group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className={getAvatarColor(agent.avatar_style)}>
                        <AvatarFallback>{getAgentIcon(agent.avatar_style)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <h3 className="font-semibold text-lg flex items-center">
                          {agent.name}
                          {agent.is_paid && (
                            <Badge variant="secondary" className="ml-2 text-xs">Premium</Badge>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">{agent.personality}</p>
                      </div>
                    </div>
                    <FavoriteButton agentId={agent.id} />
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="line-clamp-3 text-slate-600 dark:text-slate-300 mb-4">
                    {agent.objective}
                  </p>
                  
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center mr-4">
                      <Star className="h-4 w-4 mr-1 text-amber-500" />
                      <span>{(agent.rating || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{agent.views || 0} vues</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="pt-2 bg-gray-50 dark:bg-gray-800/50 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full bg-violet-600 hover:bg-violet-700"
                    asChild
                  >
                    <Link to={`/ai-studio/agent/${agent.slug || agent.id}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Essayer
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
      </div>
    </div>
  );
};

export default FeaturedAgents;
