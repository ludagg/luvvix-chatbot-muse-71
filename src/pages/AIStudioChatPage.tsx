import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  Bot,
  Send,
  ArrowLeft,
  User,
  Loader2,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Share2,
  MessageSquare,
  Star,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
}

const AIStudioChatPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [agent, setAgent] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState<string>(uuidv4());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    document.title = "Chat avec l'IA - LuvviX AI Studio";
    
    const fetchAgent = async () => {
      try {
        if (!agentId) return;
        
        const { data, error } = await supabase
          .from("ai_agents")
          .select("*")
          .eq("id", agentId)
          .single();
          
        if (error) throw error;
        
        setAgent(data);
        
        // Add system message as welcome
        setMessages([
          {
            id: uuidv4(),
            role: "assistant",
            content: `Bonjour, je suis ${data.name}. Comment puis-je vous aider aujourd'hui ?`,
          },
        ]);
      } catch (error) {
        console.error("Error fetching agent:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger l'agent IA.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgent();
  }, [agentId, toast]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim() || sending) return;
    
    const userMessage = input.trim();
    setInput("");
    setSending(true);
    
    // Add user message to chat
    const userMessageObj: Message = {
      id: uuidv4(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessageObj]);
    
    try {
      // Call the AI Studio chat function
      const response = await fetch(
        "https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/ai-studio-chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(user && { Authorization: `Bearer ${supabase.auth.getSession()}` }),
          },
          body: JSON.stringify({
            agentId,
            message: userMessage,
            sessionId,
            conversationId,
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Save conversation ID if it's a new conversation
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
      
      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        },
      ]);
      
      // Focus the input for next message
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content:
            "Désolé, une erreur est survenue lors du traitement de votre message. Veuillez réessayer.",
          timestamp: new Date(),
        },
      ]);
      
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer votre message.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };
  
  const getAvatarForAgent = () => {
    if (!agent) return null;
    
    switch (agent.avatar_style) {
      case "bot":
        return <Bot className="h-full w-full p-2" />;
      case "sparkles":
        return <span className="text-lg">✨</span>;
      case "human-female-1":
        return <span className="text-lg">👩</span>;
      case "human-female-2":
        return <span className="text-lg">👱‍♀️</span>;
      case "human-male-1":
        return <span className="text-lg">👨</span>;
      case "human-male-2":
        return <span className="text-lg">👨‍🦰</span>;
      default:
        return <Bot className="h-full w-full p-2" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-slate-50 dark:bg-slate-900 flex flex-col">
        {/* Chat header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="container mx-auto flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="mr-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              asChild
            >
              <Link to="/ai-studio/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" /> Retour
              </Link>
            </Button>
            
            {loading ? (
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ) : agent ? (
              <div className="flex items-center justify-between flex-grow">
                <div className="flex items-center">
                  <Avatar className="mr-3 h-10 w-10 bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                    <AvatarFallback>
                      {getAvatarForAgent()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="font-medium text-slate-900 dark:text-white">
                      {agent.name}
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {agent.personality === "expert" && "Expert"}
                      {agent.personality === "friendly" && "Amical"}
                      {agent.personality === "concise" && "Concis"}
                      {agent.personality === "empathetic" && "Empathique"}
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-slate-500">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                  <FavoriteButton agentId={agentId || ""} size="sm" />
                </div>
              </div>
            ) : (
              <div className="flex items-center">
                <Avatar className="mr-3">
                  <AvatarFallback>
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <h1 className="font-medium text-slate-900 dark:text-white">
                  Agent introuvable
                </h1>
              </div>
            )}
          </div>
        </header>
        
        {/* Chat messages */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
          <div className="container mx-auto max-w-3xl">
            {agent && messages.length === 1 && (
              <div className="bg-violet-50 dark:bg-violet-900/20 rounded-lg p-4 mb-6 border border-violet-100 dark:border-violet-800/40">
                <h3 className="font-semibold text-violet-800 dark:text-violet-300 mb-2 flex items-center">
                  <Bot className="h-5 w-5 mr-2" />
                  À propos de {agent.name}
                </h3>
                <p className="text-violet-700 dark:text-violet-200 text-sm mb-2">
                  {agent.objective}
                </p>
                <div className="flex items-center space-x-2 text-xs text-violet-600 dark:text-violet-300">
                  <span className="flex items-center">
                    <Star className="h-3.5 w-3.5 mr-1" />
                    {(agent.rating || 0).toFixed(1)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    {agent.views || 0} vues
                  </span>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-6 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[80%] md:max-w-[70%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  } group`}
                >
                  <div
                    className={`flex-shrink-0 ${
                      message.role === "user" ? "ml-3" : "mr-3"
                    }`}
                  >
                    <Avatar>
                      {message.role === "user" ? (
                        <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      ) : (
                        <AvatarFallback className="bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                          {getAvatarForAgent()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  
                  <div
                    className={`rounded-2xl p-4 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {message.role === "assistant" && (
                      <div className="flex items-center justify-end mt-2 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                          onClick={() => {
                            navigator.clipboard.writeText(message.content);
                            toast({
                              title: "Copié",
                              description: "Message copié dans le presse-papier",
                              duration: 2000,
                            });
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          <span className="sr-only">Copier</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span className="sr-only">J'aime</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                        >
                          <ThumbsDown className="h-3 w-3" />
                          <span className="sr-only">Je n'aime pas</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {sending && (
              <div className="flex mb-6 justify-start">
                <div className="flex max-w-[80%] md:max-w-[70%] flex-row">
                  <div className="flex-shrink-0 mr-3">
                    <Avatar>
                      <AvatarFallback className="bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                        {getAvatarForAgent()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="rounded-2xl p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                      <p className="text-slate-500">En train d'écrire...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Suggestion chips - new feature */}
        {agent && messages.length > 0 && !sending && (
          <div className="px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700">
            <div className="container mx-auto max-w-3xl overflow-x-auto flex space-x-2 pb-2 scrollbar-thin">
              {[
                "Dis m'en plus sur ce sujet",
                "Peux-tu expliquer plus simplement?",
                "Quelles sont les prochaines étapes?",
                "Donne-moi des exemples"
              ].map((suggestion, i) => (
                <Button 
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="flex-shrink-0 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Input area */}
        <div className="sticky bottom-0 z-10 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="container mx-auto max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex space-x-2"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez votre message..."
                className="flex-grow shadow-sm dark:bg-slate-700 dark:border-slate-600"
                autoComplete="off"
                disabled={loading || !agent}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || sending || loading || !agent}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </form>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
              LuvviX AI n'est pas parfait et peut parfois générer des informations incorrectes
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AIStudioChatPage;
