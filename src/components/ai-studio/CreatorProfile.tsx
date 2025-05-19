
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, MessageSquare, Star, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export default function CreatorProfile() {
  const { creatorId } = useParams<{ creatorId: string }>();
  const [creator, setCreator] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [stats, setStats] = useState({ agents: 0, followers: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userSession, setUserSession] = useState<any>(null);

  useEffect(() => {
    const fetchCreator = async () => {
      try {
        // Check current session
        const { data: session } = await supabase.auth.getSession();
        setUserSession(session?.session?.user || null);
        
        // Fetch creator profile
        const { data: creatorData, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", creatorId)
          .single();
          
        if (error) throw error;
        setCreator(creatorData);
        
        // Fetch creator's agents
        const { data: agentsData, error: agentsError } = await supabase
          .from("ai_agents")
          .select("*")
          .eq("user_id", creatorId)
          .eq("is_public", true)
          .order("views", { ascending: false });
          
        if (agentsError) throw agentsError;
        setAgents(agentsData || []);
        
        // Calculate stats
        const totalAgents = agentsData?.length || 0;
        const totalViews = agentsData?.reduce((sum, agent) => sum + (agent.views || 0), 0) || 0;
        
        // Get follower count
        const { count: followersCount, error: followersError } = await supabase
          .from("ai_follows")
          .select("*", { count: "exact", head: true })
          .eq("creator_id", creatorId);
          
        if (followersError) throw followersError;
        
        setStats({
          agents: totalAgents,
          followers: followersCount || 0,
          totalViews: totalViews
        });
        
        // Check if current user follows this creator
        if (session?.session?.user?.id) {
          const { data: followData, error: followError } = await supabase
            .from("ai_follows")
            .select("*")
            .eq("creator_id", creatorId)
            .eq("follower_id", session.session.user.id)
            .maybeSingle();
            
          if (!followError) {
            setIsFollowing(!!followData);
          }
        }
      } catch (error) {
        console.error("Error fetching creator data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (creatorId) {
      fetchCreator();
    }
  }, [creatorId]);

  const handleFollowToggle = async () => {
    if (!userSession) {
      // Redirect to login
      window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from("ai_follows")
          .delete()
          .eq("creator_id", creatorId)
          .eq("follower_id", userSession.id);
          
        setStats(prev => ({
          ...prev,
          followers: Math.max(0, prev.followers - 1)
        }));
      } else {
        // Follow
        await supabase
          .from("ai_follows")
          .insert({
            creator_id: creatorId,
            follower_id: userSession.id
          });
          
        setStats(prev => ({
          ...prev,
          followers: prev.followers + 1
        }));
      }
      
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error updating follow status:", error);
    }
  };

  const getAvatarIcon = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "C";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-6 mb-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-5 w-full max-w-md" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-40 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Créateur non trouvé</h1>
          <p className="text-muted-foreground mb-8">
            Le profil du créateur que vous recherchez n'existe pas ou n'est pas accessible.
          </p>
          <Button asChild>
            <Link to="/ai-studio/marketplace">Retour au marketplace</Link>
          </Button>
        </div>
      </div>
    );
  }

  const displayName = creator.username || creator.full_name || "Créateur anonyme";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Creator header */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-24 w-24 border">
              {creator.avatar_url ? (
                <AvatarImage src={creator.avatar_url} alt={displayName} />
              ) : (
                <AvatarFallback className="text-2xl bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                  {getAvatarIcon(displayName)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{displayName}</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Créateur d'agents IA
              </p>
              
              {userSession?.id !== creatorId && (
                <Button 
                  onClick={handleFollowToggle}
                  variant={isFollowing ? "outline" : "default"}
                  className={isFollowing ? "" : "bg-violet-600 hover:bg-violet-700"}
                >
                  {isFollowing ? "Ne plus suivre" : "Suivre"}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Bot className="mr-2 h-4 w-4 text-violet-500" />
                Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.agents}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="mr-2 h-4 w-4 text-blue-500" />
                Abonnés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.followers}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="mr-2 h-4 w-4 text-green-500" />
                Vues totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalViews}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Agents */}
        <Tabs defaultValue="agents" className="space-y-4">
          <TabsList>
            <TabsTrigger value="agents">Agents ({agents.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agents">
            {agents.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-10">
                  <p className="text-muted-foreground">
                    Ce créateur n'a pas encore publié d'agents IA.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {agents.map(agent => (
                  <Card key={agent.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start">
                        <Avatar className="mr-3 h-10 w-10 bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                          <AvatarFallback>
                            {agent.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-xl">{agent.name}</CardTitle>
                          <CardDescription>
                            {agent.personality === "expert" && "Expert"}
                            {agent.personality === "friendly" && "Amical"}
                            {agent.personality === "concise" && "Concis"}
                            {agent.personality === "empathetic" && "Empathique"}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-3">
                        {agent.objective}
                      </p>
                      
                      <div className="flex items-center mt-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center mr-4">
                          <Star className="h-4 w-4 mr-1 text-amber-500" />
                          <span>{(agent.rating || 0).toFixed(1)}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          <span>{agent.views || 0} vues</span>
                        </div>
                        {agent.is_paid && (
                          <div className="ml-auto font-medium text-green-600">
                            {agent.price}€
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button asChild className="w-full bg-violet-600 hover:bg-violet-700">
                        <Link to={`/ai-studio/agents/${agent.id}`}>
                          Voir et discuter
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
