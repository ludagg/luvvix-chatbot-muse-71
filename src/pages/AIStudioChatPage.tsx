
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bot,
  Send,
  ArrowLeft,
  User,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Share2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  isError?: boolean;
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
  const [errorState, setErrorState] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3); // Maximum number of retries
  
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
  
  const handleRetry = async () => {
    setErrorState(null);
    setRetryCount(0); // Reset retry count
    if (messages.length > 0) {
      // Get the last user message
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === "user");
      if (lastUserMessage) {
        // Retry with the last user message
        const userMessage = lastUserMessage.content;
        await handleSendMessage(userMessage);
      }
    }
  };
  
  const handleSendMessage = async (text?: string) => {
    const userMessage = text || input.trim();
    if (!userMessage || sending) return;
    
    setInput("");
    setSending(true);
    setErrorState(null);
    
    // Add user message to chat
    const userMessageObj: Message = {
      id: uuidv4(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessageObj]);
    
    try {
      console.log("Calling cerebras-chat with:", {
        agentId,
        message: userMessage,
        sessionId,
        conversationId,
        userId: user?.id || null
      });
      
      // Call the Cerebras chat function
      const response = await fetch(
        "https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/cerebras-chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentId,
            message: userMessage,
            sessionId,
            conversationId,
            userId: user?.id || null
          }),
          signal: AbortSignal.timeout(15000) // 15 second timeout
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la communication avec l'IA");
      }
      
      const data = await response.json();
      console.log("Cerebras chat response:", data);
      
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
          content: data.reply || "Je n'ai pas pu générer de réponse.",
          timestamp: new Date(),
        },
      ]);
      
      // Reset retry count on success
      setRetryCount(0);
      
      // Focus the input for next message
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Fallback to ai-studio-chat if cerebras-chat fails
      if (retryCount < maxRetries) {
        setRetryCount(prevCount => prevCount + 1);
        try {
          console.log(`Retry attempt ${retryCount + 1}/${maxRetries} - Using ai-studio-chat as fallback...`);
          
          const fallbackResponse = await fetch('https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/ai-studio-chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              agentId,
              message: userMessage,
              sessionId,
              conversationId,
              userId: user?.id || null
            }),
            signal: AbortSignal.timeout(15000) // 15 second timeout
          });
          
          if (!fallbackResponse.ok) {
            const fallbackErrorData = await fallbackResponse.json();
            console.error("Error from ai-studio-chat fallback:", fallbackErrorData);
            throw new Error(fallbackErrorData.error || `Fallback failed: ${fallbackResponse.status}`);
          }
          
          const fallbackData = await fallbackResponse.json();
          console.log("ai-studio-chat fallback response:", fallbackData);
          
          if (fallbackData.error) {
            throw new Error(fallbackData.error);
          }
          
          // Save conversation ID if it's a new conversation
          if (fallbackData.conversationId && !conversationId) {
            setConversationId(fallbackData.conversationId);
          }
          
          // Add AI response to chat
          setMessages((prev) => [
            ...prev,
            {
              id: uuidv4(),
              role: "assistant",
              content: fallbackData.response || "Je n'ai pas pu générer de réponse.",
              timestamp: new Date(),
            },
          ]);
          
          setErrorState(null);
          setRetryCount(0); // Reset retry count on success
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          
          setErrorState('Impossible de communiquer avec l\'agent IA après plusieurs tentatives.');
          
          // Add error message to chat
          setMessages((prev) => [
            ...prev,
            {
              id: uuidv4(),
              role: "assistant",
              content:
                "Désolé, une erreur est survenue lors du traitement de votre message. Veuillez cliquer sur le bouton réessayer.",
              timestamp: new Date(),
              isError: true
            },
          ]);
        }
      } else {
        setErrorState('Impossible de communiquer avec l\'agent IA.');
        
        // Add error message to chat
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: "assistant",
            content:
              "Désolé, une erreur est survenue lors du traitement de votre message. Veuillez cliquer sur le bouton réessayer.",
            timestamp: new Date(),
            isError: true
          },
        ]);
      }
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
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow bg-slate-50 dark:bg-slate-900 flex flex-col">
          {/* Chat header */}
          <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
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
              {errorState && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between w-full">
                    {errorState}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-200 bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1 ml-4"
                      onClick={handleRetry}
                    >
                      <RefreshCw className="h-3 w-3" /> Réessayer
                    </Button>
                  </AlertDescription>
                </Alert>
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
                    }`}
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
                          <AvatarFallback className={`${message.isError ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : 'bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300'}`}>
                            {message.isError ? <AlertCircle className="h-5 w-5" /> : getAvatarForAgent()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                    
                    <div
                      className={`rounded-2xl p-4 ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : message.isError
                          ? "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                          : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      
                      {message.role === "assistant" && !message.isError && (
                        <div className="flex items-center justify-end mt-2 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                          >
                            <Share2 className="h-3 w-3" />
                            <span className="sr-only">Partager</span>
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
          
          {/* Input area */}
          <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
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
                  className="flex-grow"
                  autoComplete="off"
                  disabled={loading || !agent || sending}
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
    </TooltipProvider>
  );
};

export default AIStudioChatPage;
