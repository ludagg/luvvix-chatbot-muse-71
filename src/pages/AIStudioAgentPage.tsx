import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EmbedChat from "@/components/ai-studio/EmbedChat";
import EmbedCodeGenerator from "@/components/ai-studio/EmbedCodeGenerator";
import {
  Bot,
  ChevronLeft,
  ExternalLink,
  MessageSquare,
  Share2,
  Star,
  ThumbsUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const AIStudioAgentPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent] = useState<any | null>(null);
  const [creator, setCreator] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    document.title = agent?.name
      ? `${agent.name} - LuvviX AI Studio`
      : "AI Agent - LuvviX AI Studio";
  }, [agent]);

  useEffect(() => {
    const fetchAgentDetails = async () => {
      try {
        if (!agentId) return;

        const { data: agentData, error: agentError } = await supabase
          .from("ai_agents")
          .select("*")
          .eq("id", agentId)
          .single();

        if (agentError) throw agentError;

        setAgent(agentData);

        // Fetch creator info
        if (agentData.user_id) {
          const { data: userData, error: userError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", agentData.user_id)
            .single();

          if (!userError) {
            setCreator(userData);
          }
        }
      } catch (error) {
        console.error("Error fetching agent:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load agent information",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentDetails();
  }, [agentId, toast]);

  const getAvatarIcon = (avatarStyle: string) => {
    switch (avatarStyle) {
      case "bot":
        return <Bot className="h-full w-full p-2" />;
      default:
        return <Bot className="h-full w-full p-2" />;
    }
  };

  const getPersonalityText = (personality: string) => {
    switch (personality) {
      case "expert":
        return "Expert";
      case "friendly":
        return "Amical";
      case "concise":
        return "Concis";
      case "empathetic":
        return "Empathique";
      default:
        return personality;
    }
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: agent?.name || "AI Agent",
        text: agent?.objective || "Check out this AI agent!",
        url: window.location.href,
      }).catch((error) => console.log("Error sharing", error));
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "Lien copié",
          description: "Le lien a été copié dans votre presse-papiers",
        });
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin">
          <Bot size={32} className="text-violet-600" />
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24">
        <div className="container mx-auto px-4 py-12 text-center">
          <Bot size={48} className="mx-auto text-slate-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Agent non trouvé</h1>
          <p className="text-slate-500 mb-6">
            Cet agent n'existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link to="/ai-studio/marketplace">
              <ChevronLeft size={16} className="mr-2" />
              Retour au marketplace
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-900 pt-24">
        <Navbar />

        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Link
              to="/ai-studio/marketplace"
              className="inline-flex items-center text-sm text-slate-600 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
            >
              <ChevronLeft size={16} className="mr-1" />
              Retour au marketplace
            </Link>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-20 w-20 bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                  <AvatarImage src={agent.avatar_url || ""} />
                  <AvatarFallback>
                    {getAvatarIcon(agent.avatar_style)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{agent.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <Badge variant="secondary" className="font-normal">
                        {getPersonalityText(agent.personality)}
                      </Badge>
                      <div className="flex items-center text-amber-500">
                        <Star className="h-4 w-4 mr-1" />
                        <span>{(agent.rating || 0).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center text-slate-500 dark:text-slate-400">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span>{agent.views || 0} vues</span>
                      </div>
                    </div>

                    {creator && (
                      <Link
                        to={`/ai-studio/creators/${creator.id}`}
                        className="flex items-center text-sm text-violet-600 dark:text-violet-400 hover:underline mb-4"
                      >
                        <Avatar className="h-5 w-5 mr-2">
                          <AvatarImage src={creator.avatar_url || ""} />
                          <AvatarFallback>
                            {creator.username?.charAt(0) ||
                              creator.full_name?.charAt(0) ||
                              "C"}
                          </AvatarFallback>
                        </Avatar>
                        {creator.username || creator.full_name || "Créateur"}
                      </Link>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={handleShareClick}>
                      <Share2 size={16} className="mr-1" />
                      Partager
                    </Button>
                    {agent.is_paid && (
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <ThumbsUp size={16} className="mr-1" />
                        Soutenir ({agent.price}€)
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-300 mb-6 whitespace-pre-line">
                  {agent.objective}
                </p>
              </div>
            </div>
          </div>

          <Card className="mb-6">
            <CardContent className="p-0">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full justify-start rounded-none border-b">
                  <TabsTrigger value="chat" className="rounded-none">
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="embed" className="rounded-none">
                    Intégrer
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="chat" className="p-0 m-0">
                  <div className="h-[600px] md:h-[700px] w-full">
                    <EmbedChat agentId={agentId || ""} isEmbed={false} />
                  </div>
                </TabsContent>
                <TabsContent value="embed" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Intégrer cet agent sur votre site
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Ajoutez cet agent IA à votre site web en copiant le code
                        ci-dessous
                      </p>

                      {agentId && (
                        <EmbedCodeGenerator 
                          agentId={agentId} 
                          agentName={agent?.name || "Agent IA"} 
                          isPublic={agent?.is_public !== false} 
                        />
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">
                        Utilisation de l'API (bientôt disponible)
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Accédez à cet agent via notre API REST pour l'intégrer
                        dans vos applications
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        disabled
                      >
                        <ExternalLink size={16} className="mr-2" />
                        Documentation API
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default AIStudioAgentPage;
