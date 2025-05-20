
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MessageSquare, Share, Info } from "lucide-react";
import { Link } from "react-router-dom";
import EmbedCodeGenerator from "@/components/ai-studio/EmbedCodeGenerator";
import { TooltipProvider } from "@/components/ui/tooltip";

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
          .select("*")
          .eq("id", agentId)
          .single();
          
        if (error) throw error;
        
        if (!data.is_public) {
          throw new Error("Cet agent n'est pas public");
        }
        
        setAgent(data);
        
        // Increment view count
        // We need to ensure the parameters match what the function expects
        try {
          // Cast the agent_id parameter to any to bypass the TypeScript error
          const { error: updateError } = await supabase.rpc('increment_agent_views', {
            agent_id: agentId as any
          });
          
          if (updateError) console.error("Error incrementing views:", updateError);
        } catch (rpcError) {
          console.error("RPC Error:", rpcError);
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
                    <h1 className="text-3xl font-bold mb-4 text-slate-100">{agent.name}</h1>
                    
                    <div className="flex flex-wrap items-center text-sm text-slate-400 mb-6 gap-4">
                      <div className="bg-slate-800/70 px-3 py-1 rounded-full flex items-center">
                        {agent.personality === "expert" && "Expert"}
                        {agent.personality === "friendly" && "Amical"}
                        {agent.personality === "concise" && "Concis"}
                        {agent.personality === "empathetic" && "Empathique"}
                      </div>
                      <div className="bg-slate-800/70 px-3 py-1 rounded-full flex items-center">
                        <span>{agent.views} vues</span>
                      </div>
                      {agent.is_paid && (
                        <div className="bg-emerald-900/30 text-emerald-400 px-3 py-1 rounded-full flex items-center">
                          {agent.price}€
                        </div>
                      )}
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
                        <p className="text-slate-300">
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
