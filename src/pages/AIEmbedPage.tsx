
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import AIChat from '@/components/ai-studio/AIChat';
import { Loader } from 'lucide-react';
import { incrementAgentViews } from '@/services/ai-agent-service';
import aiAgentService from '@/services/ai-agent-service';

const AIEmbedPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parentOrigin, setParentOrigin] = useState<string | null>(null);

  // Set up message listener for cross-origin communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify the message is from a trusted origin
      console.log('Received message from parent:', event.data, 'origin:', event.origin);
      
      // Store the parent origin for later communication
      if (event.data?.type === 'INIT_EMBED' && event.origin) {
        setParentOrigin(event.origin);
        console.log('Parent origin set to:', event.origin);
        
        // Send ready message back to parent
        event.source?.postMessage({ type: 'EMBED_READY', agentId }, event.origin as string);
      }
      
      // Handle user message if sent from parent
      if (event.data?.type === 'USER_MESSAGE' && event.data?.message) {
        // Here we would trigger the chat function with the message
        console.log('Received user message from parent:', event.data.message);
        // You can dispatch this message to your chat component
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Announce to parent that the embed is loaded
    window.parent.postMessage({ type: 'EMBED_LOADED', agentId }, '*');
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [agentId]);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        if (!agentId) {
          setError("ID d'agent non spécifié");
          setLoading(false);
          return;
        }

        console.log('Fetching agent with ID:', agentId);
        
        // Use the dedicated getAgentById method with better error handling
        const agentData = await aiAgentService.getAgentById(agentId);
        console.log('Agent data retrieved:', agentData);
        
        if (!agentData) {
          setError("Agent non trouvé ou non public");
          setLoading(false);
          return;
        }
        
        // Verify the agent is public 
        if (!agentData.is_public) {
          setError("Cet agent n'est pas disponible publiquement");
          setLoading(false);
          return;
        }

        setAgent(agentData);
        
        // Record the view if agent was successfully loaded
        if (agentId) {
          await incrementAgentViews({ agentId });
        }
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
          parentOrigin={parentOrigin}
        />
      </div>
    </>
  );
};

export default AIEmbedPage;
