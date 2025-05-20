import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Star, MessageCircle, UserRound, Heart, ExternalLink, Share2, Copy, CheckCheck } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import EmbedChat from "@/components/ai-studio/EmbedChat";
import EmbedCodeGenerator from "@/components/ai-studio/EmbedCodeGenerator";
import { TooltipProvider } from "@/components/ui/tooltip";

// Define the types for better type safety
interface AgentReview {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
}

interface Agent {
  id: string;
  name: string;
  objective: string;
  personality: string;
  avatar_url?: string;
  avatar_style: string;
  is_public: boolean;
  parameters: {
    knowledge_domains?: string[];
    [key: string]: any;
  };
  created_at: string;
  user_profiles: UserProfile;
  ai_agent_reviews: AgentReview[];
}

// Create a separate interface for EmbedCodeGenerator props
interface EmbedCodeGeneratorProps {
  agentId: string;
  agentName: string;
  isPublic: boolean;
}

const AIStudioAgentPage = () => {
  const { agentId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedTab, setSelectedTab] = useState("chat");
  
  // Add a type guard to check if agentId is defined
  if (!agentId) {
    return <div>Agent ID is required</div>;
  }
  
  // Query to fetch the agent data
  const { data: agent, isLoading } = useQuery({
    queryKey: ["agent", agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_agents")
        .select(`
          *,
          user_profiles(id, full_name, username, avatar_url),
          ai_agent_reviews(id, user_id, rating, comment, created_at)
        `)
        .eq("id", agentId)
        .eq("is_public", true)
        .single();
      
      if (error) throw error;
      // Use type casting with a type check to ensure we handle potential missing properties
      const agentData = data as unknown as Agent;
      return agentData;
    },
    enabled: !!agentId,
  });

  // Check if the user has favorited this agent
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !agentId) return;
      
      const { data } = await supabase
        .from("ai_favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("agent_id", agentId)
        .maybeSingle();
        
      setIsFavorited(!!data);
    };
    
    checkFavorite();
  }, [user, agentId]);

  // Toggle favorite status
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user || !agentId) throw new Error("User or agent ID missing");
      
      if (isFavorited) {
        // Remove favorite
        const { error } = await supabase
          .from("ai_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("agent_id", agentId);
          
        if (error) throw error;
      } else {
        // Add favorite
        const { error } = await supabase
          .from("ai_favorites")
          .insert({
            user_id: user.id,
            agent_id: agentId
          });
          
        if (error) throw error;
      }
      
      setIsFavorited(!isFavorited);
      return !isFavorited;
    },
    onSuccess: (newStatus) => {
      toast({
        title: newStatus ? "Added to favorites" : "Removed from favorites",
        description: newStatus ? "This agent has been added to your favorites." : "This agent has been removed from your favorites."
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem updating your favorites."
      });
    }
  });
  
  const copyShareLink = () => {
    try {
      navigator.clipboard.writeText(`https://luvvix.it.com/ai-studio/agents/${agentId}`);
      setCopySuccess(true);
      toast({
        title: "Link copied",
        description: "Share link has been copied to clipboard."
      });
      
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Could not copy the link to clipboard."
      });
    }
  };
  
  if (isLoading) {
    return (
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-grow flex items-center justify-center">
            <div className="animate-spin">
              <Bot size={32} className="text-primary" />
            </div>
          </div>
          <Footer />
        </div>
      </TooltipProvider>
    );
  }
  
  if (!agent) {
    return (
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-grow flex items-center justify-center p-4">
            <Card className="max-w-md w-full">
              <CardContent className="pt-6 text-center">
                <Bot size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Agent Not Found</h2>
                <p className="text-gray-500 mb-6">
                  The agent you're looking for doesn't exist or is not public.
                </p>
                <Button asChild>
                  <Link to="/ai-studio/marketplace">Back to Marketplace</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
          <Footer />
        </div>
      </TooltipProvider>
    );
  }

  const creator = agent.user_profiles;
  const reviews = agent.ai_agent_reviews || [];
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  document.title = `${agent.name} - LuvviX AI Studio`;
  
  return (
    <TooltipProvider>
      <div className="pt-24 flex-1">
        <div className="min-h-screen flex flex-col">
          <Navbar />
          
          <main className="flex-grow container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Agent Info Column */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={agent.avatar_url} />
                          <AvatarFallback 
                            className="bg-primary text-primary-foreground"
                          >
                            {agent.name?.charAt(0) || <Bot className="h-6 w-6" />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h1 className="text-2xl font-bold">{agent.name}</h1>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
                            <span>{avgRating.toFixed(1)}</span>
                            <span>({reviews.length} reviews)</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleFavoriteMutation.mutate()}
                        disabled={!user || toggleFavoriteMutation.isPending}
                      >
                        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 stroke-red-500' : ''}`} />
                      </Button>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                      {agent.objective}
                    </p>
                    
                    {agent.personality && (
                      <div className="mb-6">
                        <h3 className="font-medium mb-2">Personality</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {agent.personality}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mb-6 flex-wrap">
                      {agent.parameters?.knowledge_domains?.map((domain: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {domain}
                        </Badge>
                      ))}
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex items-center gap-3 mt-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={creator?.avatar_url || ''} />
                        <AvatarFallback className="bg-gray-200 text-gray-800">
                          <UserRound className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          Created by{' '}
                          <Link to={`/ai-studio/creators/${creator?.id}`} className="text-primary hover:underline">
                            {creator?.username || creator?.full_name || 'Unknown'}
                          </Link>
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(agent.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <Button
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={copyShareLink}
                      >
                        {copySuccess ? (
                          <>
                            <CheckCheck className="mr-1 h-4 w-4" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Share2 className="mr-1 h-4 w-4" />
                            Share
                          </>
                        )}
                      </Button>
                      
                      <Link to={`/ai-studio/chat/${agentId}`} className="w-full">
                        <Button 
                          size="sm"
                          className="w-full"
                        >
                          <MessageCircle className="mr-1 h-4 w-4" />
                          Chat
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-bold mb-4">Embed this agent on your website</h2>
                    <EmbedCodeGenerator 
                      agentId={agentId} 
                      agentName={agent.name}
                      isPublic={agent.is_public}
                    />
                    <Button asChild className="w-full mt-4" variant="outline">
                      <Link to="https://docs.luvvix.it.com/ai-studio/embedding" target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Embedding Documentation
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {/* Chat Column */}
              <div className="md:col-span-2 h-[700px] flex flex-col">
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
                    <TabsTrigger value="code">Embed Code</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="chat" className="flex-grow">
                    <Card className="h-full">
                      <EmbedChat 
                        agentId={agentId} 
                        isEmbed={false}
                      />
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="flex-grow overflow-auto">
                    <Card className="h-full">
                      <CardContent className="pt-6">
                        {reviews.length > 0 ? (
                          <div className="space-y-4">
                            {reviews.map((review) => (
                              <div key={review.id} className="border-b pb-4 last:border-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                      <Star 
                                        key={i} 
                                        className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 stroke-yellow-400' : 'text-gray-300'}`} 
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-medium mb-2">No reviews yet</h3>
                            <p className="text-gray-500">
                              Be the first to review this agent
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="code" className="flex-grow">
                    <Card className="h-full">
                      <CardContent className="pt-6">
                        <div className="mb-6">
                          <h3 className="font-bold mb-2">Standard Embed</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Add this code to your HTML page where you want the chat interface to appear.
                          </p>
                          <div className="relative">
                            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                              <code>
{`<div id="luvvix-ai-container"></div>
<script src="https://luvvix.it.com/api/embed.js" data-agent-id="${agentId}"></script>`}
                              </code>
                            </pre>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                navigator.clipboard.writeText(`<div id="luvvix-ai-container"></div>\n<script src="https://luvvix.it.com/api/embed.js" data-agent-id="${agentId}"></script>`);
                                toast({ title: "Copied to clipboard" });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h3 className="font-bold mb-2">Popup Button Embed</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Add a button that opens a chat popup when clicked.
                          </p>
                          <div className="relative">
                            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                              <code>
{`<button data-agent-id="${agentId}">Chat with ${agent.name}</button>
<script src="https://luvvix.it.com/api/embed-popup.js"></script>`}
                              </code>
                            </pre>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                navigator.clipboard.writeText(`<button data-agent-id="${agentId}">Chat with ${agent.name}</button>\n<script src="https://luvvix.it.com/api/embed-popup.js"></script>`);
                                toast({ title: "Copied to clipboard" });
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-bold mb-2">Customization Options</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            You can customize the appearance by adding these attributes:
                          </p>
                          <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                            <li><code>data-theme="dark"</code> - For dark mode</li>
                            <li><code>data-accent-color="#ff0000"</code> - Change accent color</li>
                            <li><code>data-hide-credit="true"</code> - Hide the "Powered by" credit</li>
                            <li><code>data-start-message="Hello"</code> - Set an initial message</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>
          
          <Footer />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default AIStudioAgentPage;
