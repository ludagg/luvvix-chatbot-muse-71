
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import AIChat from '@/components/ai-studio/AIChat';
import { Loader } from 'lucide-react';

const AIEmbedPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        if (!agentId) {
          setError("ID d'agent non spécifié");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("ai_agents")
          .select(`
            *,
            user_profiles:user_id(full_name, avatar_url, username)
          `)
          .eq("id", agentId)
          .eq("is_public", true)
          .single();

        if (error) throw error;
        if (!data) {
          setError("Agent non trouvé ou non public");
          setLoading(false);
          return;
        }

        setAgent(data);
      } catch (err) {
        console.error("Error fetching agent:", err);
        setError("Impossible de charger l'agent");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [agentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-900/70 to-black/80">
        <Loader className="w-10 h-10 animate-spin text-violet-400" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-900/70 to-black/80 text-white p-6">
        <div className="text-xl font-bold mb-2">Erreur</div>
        <div className="text-gray-300">{error || "Agent non disponible"}</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{agent.name} - LuvviX AI Studio Embed</title>
        <meta name="description" content={agent.objective} />
        <meta name="robots" content="noindex" />
        <style type="text/css">{`
          body {
            margin: 0;
            padding: 0;
            background: transparent;
          }
        `}</style>
      </Helmet>
      <div className="h-screen flex flex-col overflow-hidden bg-transparent">
        <AIChat 
          agent={agent} 
          embedded={true}
          className="h-full"
        />
      </div>
    </>
  );
};

export default AIEmbedPage;
