
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, MessageSquare } from "lucide-react";
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
      } catch (error) {
        console.error("Error fetching agent:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgent();
  }, [agentId]);

  return (
      <div className="pt-24 flex-1">
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow bg-slate-50 dark:bg-slate-900 py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
              </div>
            ) : agent ? (
              <div className="max-w-4xl mx-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
                    <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                    <TabsTrigger value="integration">Intégration</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
                      <div className="p-8">
                        <h1 className="text-3xl font-bold mb-4">{agent.name}</h1>
                        
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-6">
                          <div className="mr-4">
                            {agent.personality === "expert" && "Expert"}
                            {agent.personality === "friendly" && "Amical"}
                            {agent.personality === "concise" && "Concis"}
                            {agent.personality === "empathetic" && "Empathique"}
                          </div>
                          <div>{agent.views} vues</div>
                        </div>
                        
                        <p className="text-lg mb-8">{agent.objective}</p>
                        
                        <Button asChild className="bg-violet-600 hover:bg-violet-700">
                          <Link to={`/ai-studio/chat/${agent.id}`}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Discuter avec cet agent
                          </Link>
                        </Button>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-8">
                        <h2 className="text-xl font-semibold mb-4">À propos de cet agent</h2>
                        <p>
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
    </TooltipProvider>
</div>
  );
};

export default AIStudioAgentPage;
