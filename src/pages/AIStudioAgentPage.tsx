
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MessageSquare, Heart, User, Star } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import EmbedCodeGenerator from "@/components/ai-studio/EmbedCodeGenerator";
import PopularAgents from "@/components/ai-studio/PopularAgents";

const AIStudioAgentPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [userSession, setUserSession] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  useEffect(() => {
    const fetchAgent = async () => {
      if (!agentId) {
        setLoading(false);
        return;
      }
      
      try {
        // Check auth session
        const { data: session } = await supabase.auth.getSession();
        setUserSession(session?.session?.user || null);
        
        // Fetch agent data
        const { data, error } = await supabase
          .from("ai_agents")
          .select("*")
          .eq("id", agentId)
          .single();
          
        if (error) throw error;
        
        if (!data.is_public) {
          throw new Error("Cet agent n'est pas public");
        }
        
        setAgent(data);
        document.title = `${data.name} - LuvviX AI Studio`;
        
        // Fetch creator info
        if (data.user_id) {
          const { data: creatorData, error: creatorError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", data.user_id)
            .single();
            
          if (!creatorError) {
            setCreator(creatorData);
          }
        }
        
        // Check if favorited by current user
        if (session?.session?.user?.id) {
          const { data: favoriteData, error: favoriteError } = await supabase
            .from("ai_favorites")
            .select("*")
            .eq("agent_id", agentId)
            .eq("user_id", session.session.user.id)
            .maybeSingle();
            
          if (!favoriteError) {
            setIsFavorite(!!favoriteData);
          }
        }
        
        // Increment view counter
        await supabase.rpc('increment_agent_views', { agent_id: agentId });
      } catch (error) {
        console.error("Error fetching agent:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgent();
  }, [agentId]);

  const handleFavoriteToggle = async () => {
    if (!userSession) {
      // Redirect to login
      window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    try {
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from("ai_favorites")
          .delete()
          .eq("agent_id", agentId)
          .eq("user_id", userSession.id);
      } else {
        // Add to favorites
        await supabase
          .from("ai_favorites")
          .insert({
            agent_id: agentId,
            user_id: userSession.id
          });
      }
      
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  return (
    <TooltipProvider>
      <div className="pt-24 flex-1">
        <div className="min-h-screen flex flex-col">
          <Navbar />
          
          <main className="flex-grow bg-slate-50 dark:bg-slate-900 py-12">
            <div className="container mx-auto px-4">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                </div>
              ) : agent ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                      <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
                        <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                        <TabsTrigger value="integration">Intégration</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="overview">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
                          <div className="p-8">
                            <h1 className="text-3xl font-bold mb-4">{agent.name}</h1>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                              <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 space-x-4">
                                <div>
                                  {agent.personality === "expert" && "Expert"}
                                  {agent.personality === "friendly" && "Amical"}
                                  {agent.personality === "concise" && "Concis"}
                                  {agent.personality === "empathetic" && "Empathique"}
                                </div>
                                <div className="flex items-center">
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  <span>{agent.views} vues</span>
                                </div>
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 mr-1 text-amber-500" />
                                  <span>{(agent.rating || 0).toFixed(1)}</span>
                                </div>
                              </div>
                              
                              {creator && (
                                <div className="flex items-center ml-auto">
                                  <Link 
                                    to={`/ai-studio/creators/${creator.id}`} 
                                    className="text-sm text-violet-600 dark:text-violet-400 hover:underline flex items-center"
                                  >
                                    <User className="h-4 w-4 mr-1" />
                                    {creator.username || creator.full_name || "Créateur anonyme"}
                                  </Link>
                                </div>
                              )}
                            </div>
                            
                            <p className="text-lg mb-8">{agent.objective}</p>
                            
                            <div className="flex flex-wrap gap-3">
                              <Button asChild className="bg-violet-600 hover:bg-violet-700">
                                <Link to={`/ai-studio/chat/${agent.id}`}>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Discuter avec cet agent
                                </Link>
                              </Button>
                              
                              <Button 
                                variant="outline"
                                onClick={handleFavoriteToggle}
                                className={isFavorite ? "bg-pink-50 text-pink-600 border-pink-200 hover:bg-pink-100 dark:bg-pink-900/20 dark:border-pink-800" : ""}
                              >
                                <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
                                {isFavorite ? "Retiré des favoris" : "Ajouter aux favoris"}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 dark:bg-slate-900/50 p-8">
                            <h2 className="text-xl font-semibold mb-4">À propos de cet agent</h2>
                            <p className="text-slate-600 dark:text-slate-400">
                              {agent.objective}
                            </p>
                            <p className="mt-4 text-slate-600 dark:text-slate-400">
                              Cet agent a été conçu pour vous aider dans son domaine d'expertise.
                              Vous pouvez discuter avec lui pour obtenir des informations, des conseils
                              ou simplement pour avoir une conversation intéressante.
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="integration">
                        <EmbedCodeGenerator 
                          agentId={agent.id} 
                          agentName={agent.name} 
                          isPublic={agent.is_public} 
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                  
                  <div>
                    <PopularAgents limit={3} sortBy="views" />
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto text-center">
                  <h1 className="text-3xl font-bold mb-6">
                    Agent introuvable
                  </h1>
                  <p className="mb-8 text-slate-600 dark:text-slate-400">
                    Cet agent n'existe pas ou n'est pas public.
                  </p>
                  <Button asChild className="bg-violet-600 hover:bg-violet-700">
                    <Link to="/ai-studio/marketplace">Explorer le marketplace</Link>
                  </Button>
                </div>
              )}
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AIStudioAgentPage;
