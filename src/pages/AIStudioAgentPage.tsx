
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MessageSquare, Share, Info, Star, Users, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import EmbedCodeGenerator from "@/components/ai-studio/EmbedCodeGenerator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const AIStudioAgentPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    const fetchAgent = async () => {
      if (!agentId) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("ai_agents")
          .select("*, user_profiles(*)")
          .eq("id", agentId)
          .single();
          
        if (error) throw error;
        
        if (!data.is_public) {
          throw new Error("Cet agent n'est pas public");
        }
        
        setAgent(data);
        
        // Incrémenter directement la vue dans la table ai_agents plutôt que d'utiliser la fonction RPC
        // Cela évite le problème de typage avec la fonction RPC
        try {
          const { error: updateError } = await supabase
            .from('ai_agents')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', agentId);
          
          if (updateError) console.error("Error incrementing views:", updateError);
        } catch (updateError) {
          console.error("Update Error:", updateError);
        }
        
      } catch (error) {
        console.error("Error fetching agent:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgent();
  }, [agentId]);

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 to-slate-950">
        <Navbar />
        
        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
              </div>
            ) : agent ? (
              <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg mb-6 overflow-hidden">
                  <div className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="bg-violet-600/20 rounded-xl p-4 flex items-center justify-center">
                        <div className="text-4xl">
                          {agent.avatar_style === "bot" && "🤖"}
                          {agent.avatar_style === "sparkles" && "✨"}
                          {!agent.avatar_style && "🧠"}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2 text-slate-100">{agent.name}</h1>
                        
                        <div className="flex items-center text-sm text-slate-400 mb-2">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Créé {formatDistanceToNow(new Date(agent.created_at), { addSuffix: true, locale: fr })}</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center text-sm gap-2">
                          <Badge variant="outline" className="bg-slate-800/70 text-slate-300 border-slate-600">
                            {agent.personality === "expert" && "Expert"}
                            {agent.personality === "friendly" && "Amical"}
                            {agent.personality === "concise" && "Concis"}
                            {agent.personality === "empathetic" && "Empathique"}
                          </Badge>
                          <Badge variant="outline" className="bg-slate-800/70 text-slate-300 border-slate-600">
                            <Users className="h-3 w-3 mr-1" />
                            <span>{agent.views || 0} vues</span>
                          </Badge>
                          {agent.rating > 0 && (
                            <Badge variant="outline" className="bg-amber-900/20 text-amber-300 border-amber-800/30">
                              <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
                              {agent.rating.toFixed(1)}
                            </Badge>
                          )}
                          {agent.is_paid && (
                            <Badge className="bg-emerald-900/30 text-emerald-400 border-emerald-800/30">
                              {agent.price}€
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-lg mb-8 text-slate-300">{agent.objective}</p>
                    
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        asChild 
                        className="bg-violet-600 hover:bg-violet-700 shadow-md hover:shadow-violet-600/20 transition-all"
                      >
                        <Link to={`/ai-studio/chat/${agent.id}`}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Discuter avec cet agent
                        </Link>
                      </Button>
                      
                      <Button 
                        onClick={() => setActiveTab("integration")}
                        variant="outline" 
                        className="border-slate-600 bg-slate-800/50 hover:bg-slate-700 text-slate-200"
                      >
                        <Share className="mr-2 h-4 w-4" />
                        Partager cet agent
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-1">
                    <TabsTrigger 
                      value="overview"
                      className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg"
                    >
                      <Info className="h-4 w-4 mr-2" />
                      Présentation
                    </TabsTrigger>
                    <TabsTrigger 
                      value="integration"
                      className="data-[state=active]:bg-violet-600 data-[state=active]:text-white rounded-lg"
                    >
                      <Share className="h-4 w-4 mr-2" />
                      Intégration
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview">
                    <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg overflow-hidden">
                      <div className="p-8">
                        <h2 className="text-xl font-semibold mb-4 text-slate-100">À propos de cet agent</h2>
                        <p className="text-slate-300 mb-6">
                          Cet agent a été conçu pour vous aider dans son domaine d'expertise.
                          Vous pouvez discuter avec lui pour obtenir des informations, des conseils
                          ou simplement pour avoir une conversation intéressante.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-700/30 rounded-xl p-5">
                            <h3 className="text-lg font-medium mb-3 text-slate-200">Personnalité</h3>
                            <div className="space-y-2">
                              <div className="flex items-center text-slate-300">
                                {agent.personality === "expert" && (
                                  <>
                                    <span className="bg-blue-500/20 text-blue-400 p-1 rounded mr-2">🎓</span>
                                    <div>
                                      <p className="font-medium">Expert</p>
                                      <p className="text-sm text-slate-400">Répond avec précision et autorité professionnelle</p>
                                    </div>
                                  </>
                                )}
                                {agent.personality === "friendly" && (
                                  <>
                                    <span className="bg-green-500/20 text-green-400 p-1 rounded mr-2">😊</span>
                                    <div>
                                      <p className="font-medium">Amical</p>
                                      <p className="text-sm text-slate-400">Répond de manière chaleureuse et conviviale</p>
                                    </div>
                                  </>
                                )}
                                {agent.personality === "concise" && (
                                  <>
                                    <span className="bg-purple-500/20 text-purple-400 p-1 rounded mr-2">📋</span>
                                    <div>
                                      <p className="font-medium">Concis</p>
                                      <p className="text-sm text-slate-400">Répond de façon directe et sans détour</p>
                                    </div>
                                  </>
                                )}
                                {agent.personality === "empathetic" && (
                                  <>
                                    <span className="bg-pink-500/20 text-pink-400 p-1 rounded mr-2">💖</span>
                                    <div>
                                      <p className="font-medium">Empathique</p>
                                      <p className="text-sm text-slate-400">Répond avec compréhension et compassion</p>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-slate-700/30 rounded-xl p-5">
                            <h3 className="text-lg font-medium mb-3 text-slate-200">Utilisation</h3>
                            <p className="text-slate-300 text-sm">
                              Pour interagir avec cet agent, cliquez simplement sur le bouton "Discuter avec cet agent" 
                              et commencez à poser vos questions. L'agent répondra en fonction 
                              de sa programmation et de son domaine d'expertise.
                            </p>
                            
                            <Button 
                              asChild 
                              className="mt-4 bg-violet-600 hover:bg-violet-700"
                              size="sm"
                            >
                              <Link to={`/ai-studio/chat/${agent.id}`}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Commencer une discussion
                              </Link>
                            </Button>
                          </div>
                        </div>
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
            ) : (
              <div className="max-w-3xl mx-auto text-center bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-lg p-12">
                <h1 className="text-3xl font-bold mb-6 text-slate-100">
                  Agent introuvable
                </h1>
                <p className="mb-8 text-slate-400">
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
    </TooltipProvider>
  );
};

export default AIStudioAgentPage;
