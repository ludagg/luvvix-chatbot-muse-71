
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Bot, ArrowLeft, AlertCircle } from "lucide-react";
import ChatInput from "@/components/ai-studio/ChatInput";
import ChatMessage from "@/components/ai-studio/ChatMessage";
import ChatToolbar from "@/components/ai-studio/ChatToolbar";
import AnimatedBackground from "@/components/ui/animated-background";
import { useTheme } from "@/hooks/use-theme";

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
  const { resolvedTheme } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [agent, setAgent] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState<string>(uuidv4());
  const [errorState, setErrorState] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);
  const [apiFailures, setApiFailures] = useState(0);
  const [accentColor, setAccentColor] = useState('#6366f1');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
        
        // Personnaliser la couleur d'accent en fonction de la personnalité
        switch (data.personality) {
          case "expert":
            setAccentColor('#3B82F6'); // Bleu
            break;
          case "friendly":
            setAccentColor('#10B981'); // Vert
            break;
          case "concise":
            setAccentColor('#6366F1'); // Violet
            break;
          case "empathetic":
            setAccentColor('#EC4899'); // Rose
            break;
          default:
            setAccentColor('#6366F1'); // Violet par défaut
        }
        
        // Ajouter un message système en guise de bienvenue
        setMessages([
          {
            id: uuidv4(),
            role: "assistant",
            content: `Bonjour, je suis ${data.name}. Comment puis-je vous aider aujourd'hui ?`,
          },
        ]);
      } catch (error) {
        console.error("Erreur lors de la récupération de l'agent:", error);
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
  }, [agentId]);
  
  useEffect(() => {
    // Faire défiler vers le bas lorsque les messages changent
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Fonction pour réinitialiser les états d'erreur avant une nouvelle tentative
  const resetErrorState = () => {
    setErrorState(null);
    setRetryCount(0);
    setApiFailures(0);
  };
  
  // Gérer les tentatives de reconnexion à l'API
  const handleRetry = async () => {
    resetErrorState();
    
    if (messages.length > 0) {
      // Récupérer le dernier message de l'utilisateur
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === "user");
      if (lastUserMessage) {
        // Afficher un message de reconnexion
        toast({
          title: "Reconnexion...",
          description: "Tentative de communication avec l'API...",
        });
        
        // Réessayer avec le dernier message de l'utilisateur
        await handleSendMessage(lastUserMessage.content);
      }
    }
  };
  
  // Analyser les erreurs d'API pour fournir de meilleurs messages
  const parseApiError = (error: any): string => {
    const errorMessage = error?.message || "Une erreur inconnue s'est produite";
    
    // Vérifier les erreurs d'authentification API
    if (errorMessage.includes("401") || 
        errorMessage.includes("403") || 
        errorMessage.includes("authentification") || 
        errorMessage.includes("non autorisé") ||
        errorMessage.includes("API key")) {
      setApiFailures(prev => prev + 1);
      return "Erreur d'authentification avec l'API. Veuillez contacter l'administrateur pour vérifier la clé API.";
    }
    
    // Vérifier les erreurs de timeout
    if (errorMessage.includes("timeout") || 
        errorMessage.includes("délai") || 
        errorMessage.includes("timed out") ||
        errorMessage.includes("AbortError")) {
      return "L'API a mis trop de temps à répondre. Réessayez dans quelques instants.";
    }
    
    // Erreurs réseau
    if (errorMessage.includes("network") || 
        errorMessage.includes("réseau") || 
        errorMessage.includes("connexion")) {
      return "Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.";
    }
    
    return `Erreur: ${errorMessage}`;
  };
  
  const handleSendMessage = async (text?: string) => {
    const userMessage = text?.trim();
    if (!userMessage || sending) return;
    
    setSending(true);
    setErrorState(null);
    
    // Ajouter le message de l'utilisateur au chat
    const userMessageObj: Message = {
      id: uuidv4(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessageObj]);
    
    try {
      console.log("Appel de cerebras-chat avec:", {
        agentId,
        message: userMessage,
        sessionId,
        conversationId,
        userId: user?.id || null
      });
      
      // Premier essai avec cerebras-chat
      try {
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
            signal: AbortSignal.timeout(25000) // 25 secondes de timeout
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erreur lors de la communication avec l'IA");
        }
        
        const data = await response.json();
        console.log("Réponse de cerebras chat:", data);
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (!data.success) {
          throw new Error("Réponse invalide de l'API");
        }
        
        // Enregistrer l'ID de conversation s'il s'agit d'une nouvelle conversation
        if (data.conversationId && !conversationId) {
          setConversationId(data.conversationId);
        }
        
        // Ajouter la réponse de l'IA au chat
        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: "assistant",
            content: data.reply || "Je n'ai pas pu générer de réponse.",
            timestamp: new Date(),
          },
        ]);
        
        // Réinitialiser les compteurs d'erreurs en cas de succès
        resetErrorState();
        
      } catch (primaryError) {
        console.error("Erreur avec cerebras-chat, tentative avec ai-studio-chat:", primaryError);
        
        // Incrémenter le compteur de tentatives
        setRetryCount(prev => prev + 1);
        
        // Fallback vers ai-studio-chat
        if (retryCount < maxRetries) {
          console.log(`Tentative ${retryCount + 1}/${maxRetries} - Utilisation de ai-studio-chat comme fallback...`);
          
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
            signal: AbortSignal.timeout(25000) // 25 secondes de timeout
          });
          
          if (!fallbackResponse.ok) {
            const fallbackErrorData = await fallbackResponse.json();
            console.error("Erreur du fallback ai-studio-chat:", fallbackErrorData);
            throw new Error(fallbackErrorData.error || `Échec du fallback: ${fallbackResponse.status}`);
          }
          
          const fallbackData = await fallbackResponse.json();
          console.log("Réponse du fallback ai-studio-chat:", fallbackData);
          
          if (fallbackData.error || !fallbackData.success) {
            throw new Error(fallbackData.error || "Erreur avec le service de fallback");
          }
          
          // Enregistrer l'ID de conversation s'il s'agit d'une nouvelle conversation
          if (fallbackData.conversationId && !conversationId) {
            setConversationId(fallbackData.conversationId);
          }
          
          // Ajouter la réponse de l'IA au chat
          setMessages((prev) => [
            ...prev,
            {
              id: uuidv4(),
              role: "assistant",
              content: fallbackData.response || "Je n'ai pas pu générer de réponse.",
              timestamp: new Date(),
            },
          ]);
          
          // Si le fallback a réussi, on réinitialise uniquement le compteur d'erreur, pas l'état d'erreur global
          setRetryCount(0);
        } else {
          throw primaryError; // Si le nombre maximum de tentatives est atteint, propager l'erreur
        }
      }
    } catch (error) {
      console.error('Toutes les tentatives ont échoué:', error);
      
      // Analyser l'erreur pour fournir un message plus informatif
      const errorMessage = parseApiError(error);
      setErrorState(errorMessage);
      
      // Ajouter un message d'erreur au chat
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: "assistant",
          content: apiFailures > 1 
            ? "Désolé, il semble y avoir un problème persistant avec l'API. Veuillez contacter l'administrateur du système." 
            : "Désolé, une erreur est survenue lors du traitement de votre message. Vous pouvez cliquer sur le bouton réessayer.",
          timestamp: new Date(),
          isError: true
        },
      ]);
      
      // Si beaucoup d'erreurs d'authentification consécutives, afficher un toast avec des instructions pour l'administrateur
      if (apiFailures > 2) {
        toast({
          title: "Problème d'authentification API",
          description: "Il semble y avoir un problème avec la clé API Cerebras. Si vous êtes administrateur, veuillez vérifier la configuration.",
          variant: "destructive",
          duration: 10000
        });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow bg-slate-50 dark:bg-slate-900 flex flex-col relative">
          {/* Fond d'animation */}
          <AnimatedBackground />
          
          {/* Chat container */}
          <div className="container mx-auto max-w-4xl flex-grow flex flex-col">
            <div className="flex-grow flex flex-col bg-white dark:bg-gray-800 shadow-lg rounded-lg my-4 overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Chat header */}
              {loading ? (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
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
                    <Skeleton className="h-10 w-10 rounded-full mr-3" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              ) : agent ? (
                <ChatToolbar 
                  agentName={agent.name}
                  agentAvatar={agent.avatar_url}
                  agentObjective={agent.objective}
                  accentColor={accentColor}
                  onBackClick={() => window.location.href = "/ai-studio/dashboard"}
                />
              ) : (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
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
                    <Avatar className="mr-3">
                      <AvatarFallback>
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <h1 className="font-medium text-slate-900 dark:text-white">
                      Agent introuvable
                    </h1>
                  </div>
                </div>
              )}
              
              {/* Chat messages */}
              <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6">
                {errorState && (
                  <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-md flex items-center justify-between text-red-800 dark:text-red-200 text-sm mb-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{errorState}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-200 bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1 ml-4 dark:border-red-800 dark:bg-red-900/50 dark:text-red-200 dark:hover:bg-red-800"
                      onClick={handleRetry}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38"/>
                      </svg>
                      Réessayer
                    </Button>
                  </div>
                )}
                
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    agentName={agent?.name}
                    agentAvatar={agent?.avatar_url}
                    userAvatar={user?.user_metadata?.avatar_url}
                    accentColor={accentColor}
                    onRetry={message.isError ? handleRetry : undefined}
                  />
                ))}
                
                {sending && (
                  <div className="flex items-start">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={agent?.avatar_url} />
                      <AvatarFallback style={{ backgroundColor: accentColor }} className="text-white">
                        {agent?.name?.charAt(0) || <Bot size={16} />}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse"></div>
                          <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Input area */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={sending}
                  disabled={loading || !agent || !!errorState}
                  placeholder={errorState ? "Cliquez sur Réessayer pour continuer..." : "Écrivez votre message..."}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                  LuvviX AI n'est pas parfait et peut parfois générer des informations incorrectes
                </p>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default AIStudioChatPage;
