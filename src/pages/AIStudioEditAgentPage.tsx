
import { useParams, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const AIStudioEditAgentPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  
  useEffect(() => {
    const fetchAgent = async () => {
      if (!user || !agentId) {
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("ai_agents")
          .select("*")
          .eq("id", agentId)
          .single();
          
        if (error) {
          setNotFound(true);
          return;
        }
        
        if (data.user_id !== user.id) {
          setUnauthorized(true);
          return;
        }
        
        setAgent(data);
      } catch (error) {
        console.error("Error fetching agent:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgent();
  }, [agentId, user]);
  
  if (notFound) {
    return <Navigate to="/ai-studio/dashboard" />;
  }
  
  if (unauthorized) {
    return <Navigate to="/ai-studio/dashboard" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-slate-50 dark:bg-slate-900 py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl font-bold mb-6">
                Modifier l'agent : {agent?.name}
              </h1>
              <p className="mb-8 text-slate-600 dark:text-slate-400">
                Cette fonctionnalité sera bientôt disponible. Revenez plus tard pour personnaliser votre agent IA.
              </p>
              <Button asChild className="bg-violet-600 hover:bg-violet-700">
                <a href="/ai-studio/dashboard">Retourner au dashboard</a>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AIStudioEditAgentPage;
