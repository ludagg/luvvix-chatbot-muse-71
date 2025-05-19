import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, Code, MessageSquare, Pencil, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import FavoriteButton from "@/components/ai-studio/FavoriteButton";
import FollowButton from "@/components/ai-studio/FollowButton";

const AIStudioAgentPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMyAgent, setIsMyAgent] = useState(false);
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [usage, setUsage] = useState<any>(null);
  const [sessionId, setSessionId] = useState(localStorage.getItem('session_id') || null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    const fetchAgent = async () => {
      setLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        
        const { data, error } = await supabase
          .from('ai_agents')
          .select('*')
          .eq('id', agentId)
          .single();
          
        if (error) throw error;
        
        setAgent(data);
        setIsMyAgent(data.user_id === userId);
      } catch (error) {
        console.error("Error fetching agent:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les informations de l'agent.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgent();
  }, [agentId]);
  
  useEffect(() => {
    // Générer un identifiant de session si nécessaire
    if (!sessionId) {
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      localStorage.setItem('session_id', newSessionId);
    }
  }, [sessionId]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    // Ajouter le message à la conversation locale
    const tempConversation = [...conversation, { role: 'user', content: message }];
    setConversation(tempConversation);
    setMessage("");
    
    try {
      const { data, error } = await fetch('/functions/cerebras-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          agentId: agentId,
          conversation: tempConversation,
          sessionId: sessionId,
          conversationId: conversationId,
          embedded: embedded
        }),
      }).then(res => res.json());
      
      if (error) throw error;
      
      setReply(data.reply);
      setUsage(data.usage);
      setConversationId(data.conversationId);
      
      // Ajouter la réponse à la conversation
      setConversation([...tempConversation, { role: 'assistant', content: data.reply }]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'envoi du message.",
        variant: "destructive"
      });
    }
  };
  
  const getAgentInitial = () => {
    return agent?.name ? agent.name[0].toUpperCase() : "A";
  };
  
  const getAvatarColor = (style: string) => {
    const colors: {[key: string]: string} = {
      'professional': 'bg-blue-600',
      'friendly': 'bg-green-600',
      'creative': 'bg-purple-600',
      'technical': 'bg-gray-700',
      'assistant': 'bg-indigo-600',
    };
    
    return colors[style] || 'bg-violet-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
            <p className="mt-4 text-purple-600">Chargement...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Agent introuvable</CardTitle>
              <CardDescription>
                L'agent que vous recherchez n'existe pas ou a été supprimé.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Veuillez vérifier l'URL ou retourner au marketplace.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate("/ai-studio/marketplace")} className="w-full">
                Retourner au marketplace
              </Button>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className={`h-14 w-14 ${getAvatarColor(agent?.avatar_style)}`}>
                <AvatarFallback>{getAgentInitial()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{agent?.name}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <p>{agent?.personality}</p>
                  <span>•</span>
                  <p>{agent?.views || 0} vues</p>
                  {agent?.rating > 0 && (
                    <>
                      <span>•</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1">{agent?.rating.toFixed(1)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <FavoriteButton agentId={agentId} />
              <FollowButton creatorId={agent?.user_id} showLabel />
              {isMyAgent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/ai-studio/edit/${agentId}`)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Sparkles className="mr-2 h-5 w-5" />
                  {agent?.name}
                </CardTitle>
                <CardDescription>
                  {agent?.objective}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="chat" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chat" className="text-sm">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger value="details" className="text-sm">
                      <Code className="mr-2 h-4 w-4" />
                      Détails
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="chat" className="space-y-4">
                    <div className="space-y-2">
                      {conversation.map((msg, index) => (
                        <div key={index} className={`p-3 rounded-md ${msg.role === 'user' ? 'bg-gray-100 text-gray-800' : 'bg-purple-100 text-purple-800'}`}>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      ))}
                      {reply && (
                        <div className="p-3 rounded-md bg-purple-100 text-purple-800">
                          <p className="text-sm">{reply}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Textarea
                        placeholder="Votre message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-grow"
                      />
                      <Button onClick={sendMessage}>Envoyer</Button>
                    </div>
                    
                    {usage && (
                      <div className="text-sm text-gray-500">
                        Tokens utilisés: {usage.total_tokens}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Paramètres</h3>
                      <p className="text-sm text-gray-500">
                        Voici les paramètres de configuration de cet agent.
                      </p>
                      <pre className="bg-gray-100 rounded-md p-4 text-sm">
                        <code>
                          {JSON.stringify(agent.parameters, null, 2)}
                        </code>
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AIStudioAgentPage;
