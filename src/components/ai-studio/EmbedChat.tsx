
import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User, ExternalLink, AlertCircle } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { Badge } from "@/components/ui/badge";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
  isError?: boolean;
}

interface EmbedChatProps {
  agentId: string;
  theme?: 'light' | 'dark';
  accentColor?: string;
  hideCredit?: boolean;
  startMessage?: string;
  isEmbed?: boolean;
}

const EmbedChat: React.FC<EmbedChatProps> = ({ 
  agentId, 
  theme = 'light', 
  accentColor = '#6366f1',
  hideCredit = false,
  startMessage = '',
  isEmbed = true
}) => {
  const [agent, setAgent] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  // Générer un ID de session unique pour les utilisateurs invités
  useEffect(() => {
    if (!sessionId) {
      setSessionId(crypto.randomUUID());
    }
    
    if (startMessage && !messages.length) {
      handleSend(startMessage);
    }
  }, []);

  // Récupérer les informations de l'agent
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_agents')
          .select('*')
          .eq('id', agentId)
          .single();
          
        if (error) {
          console.error("Erreur lors de la récupération de l'agent:", error);
          throw error;
        }
        
        if (!data) {
          throw new Error("Agent non trouvé");
        }
        
        setAgent(data);
        
        // Ajouter un message système
        setMessages([
          { 
            role: 'system', 
            content: `Agent initialisé: ${data.name}`
          }
        ]);
        
        // Incrémenter le compteur de vues
        try {
          // Mettre à jour directement le compteur de vues
          await supabase
            .from('ai_agents')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', agentId);
        } catch (viewError) {
          console.error('Erreur lors de l\'incrémentation des vues de l\'agent:', viewError);
          // Continuer même si le comptage des vues échoue
        }
      } catch (error: any) {
        console.error('Erreur lors de la récupération de l\'agent:', error);
        setErrorState('Impossible de charger l\'agent. Veuillez réessayer plus tard.');
        setMessages([
          { 
            role: 'system', 
            content: 'Erreur: Impossible de charger l\'agent. Veuillez réessayer plus tard.',
            isError: true
          }
        ]);
      } finally {
        setIsFetching(false);
      }
    };

    fetchAgent();
  }, [agentId]);

  // Faire défiler vers le bas lorsque les messages changent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          agent_id: agentId,
          user_id: user?.id || null,
          is_guest: !user,
          session_id: sessionId
        })
        .select('id')
        .single();
        
      if (error) {
        console.error("Erreur lors de la création de la conversation:", error);
        throw error;
      }
      
      return data.id;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      return null;
    }
  };

  const saveMessage = async (message: Message, convId: string) => {
    if (message.isError || message.role === 'system') return; // Ne pas enregistrer les messages d'erreur ou système
    
    try {
      await supabase
        .from('ai_messages')
        .insert({
          conversation_id: convId,
          content: message.content,
          role: message.role
        });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du message:', error);
    }
  };

  const handleRetry = async () => {
    setErrorState(null);
    setRetryCount(0); // Réinitialiser le compteur de tentatives
    await handleSend();
  };

  const handleSend = async (text?: string): Promise<void> => {
    const userMessage = text || input;
    if (!userMessage.trim() || isLoading) return;
    
    setErrorState(null);
    
    // Créer une conversation si elle n'existe pas
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const newConversationId = await createConversation();
      currentConversationId = newConversationId;
      if (newConversationId) {
        setConversationId(newConversationId);
      }
    }
    
    try {
      setIsLoading(true);
      setInput('');
      
      // Ajouter le message de l'utilisateur à l'interface
      const newUserMessage = { 
        role: 'user' as const, 
        content: userMessage,
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      
      // Enregistrer le message de l'utilisateur dans la base de données si nous avons un ID de conversation
      if (currentConversationId) {
        await saveMessage(newUserMessage, currentConversationId);
      }
      
      // Appeler d'abord la fonction cerebras-chat
      console.log("Appel de cerebras-chat avec:", {
        agentId,
        message: userMessage,
        sessionId,
        conversationId: currentConversationId,
        embedded: isEmbed,
        userId: user?.id || null
      });
      
      const response = await fetch('https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/cerebras-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          message: userMessage,
          sessionId,
          userId: user?.id || null,
          conversationId: currentConversationId,
          embedded: isEmbed,
          maxTokens: 2000
        }),
        signal: AbortSignal.timeout(20000) // 20 secondes de timeout
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur de l'endpoint cerebras-chat:", errorData);
        throw new Error(errorData.error || `Erreur: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Réponse de cerebras chat:", data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Ajouter le message de l'assistant à l'interface
      const assistantMessage = { 
        role: 'assistant' as const, 
        content: data.reply || 'Désolé, je n\'ai pas pu générer de réponse.',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      // Mettre à jour l'ID de conversation s'il a été créé par la fonction
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
      
      // Réinitialiser le compteur de tentatives en cas de succès
      setRetryCount(0);
      
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      // Fallback vers ai-studio-chat si cerebras-chat échoue et que nous n'avons pas dépassé les tentatives
      if (retryCount < maxRetries) {
        try {
          setRetryCount(prevCount => prevCount + 1);
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
              conversationId: currentConversationId,
              userId: user?.id || null
            }),
            signal: AbortSignal.timeout(20000) // 20 secondes de timeout
          });
          
          if (!fallbackResponse.ok) {
            const fallbackErrorData = await fallbackResponse.json();
            console.error("Erreur du fallback ai-studio-chat:", fallbackErrorData);
            throw new Error(fallbackErrorData.error || `Échec du fallback: ${fallbackResponse.status}`);
          }
          
          const fallbackData = await fallbackResponse.json();
          console.log("Réponse du fallback ai-studio-chat:", fallbackData);
          
          if (fallbackData.error) {
            throw new Error(fallbackData.error);
          }
          
          // Ajouter le message de l'assistant à l'interface
          const assistantMessage = { 
            role: 'assistant' as const, 
            content: fallbackData.response || 'Désolé, je n\'ai pas pu générer de réponse.',
            timestamp: new Date()
          };
          
          setMessages(prevMessages => [...prevMessages, assistantMessage]);
          setErrorState(null);
          
          // Mettre à jour l'ID de conversation s'il a été créé par la fonction
          if (fallbackData.conversationId && !conversationId) {
            setConversationId(fallbackData.conversationId);
          }
          
          // Réinitialiser le compteur de tentatives en cas de succès avec le fallback
          setRetryCount(0);
        } catch (fallbackError: any) {
          console.error('Le fallback a également échoué:', fallbackError);
          
          setErrorState('Impossible de communiquer avec l\'agent IA après plusieurs tentatives.');
          
          setMessages(prevMessages => [
            ...prevMessages, 
            { 
              role: 'assistant', 
              content: 'Désolé, une erreur est survenue lors du traitement de votre message. Veuillez cliquer sur le bouton réessayer.',
              isError: true,
              timestamp: new Date()
            }
          ]);
        }
      } else {
        setErrorState('Impossible de communiquer avec l\'agent IA.');
        
        setMessages(prevMessages => [
          ...prevMessages, 
          { 
            role: 'assistant', 
            content: 'Désolé, une erreur est survenue lors du traitement de votre message. Veuillez cliquer sur le bouton réessayer.',
            isError: true,
            timestamp: new Date()
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`flex flex-col h-full overflow-hidden ${theme === 'dark' ? 'dark' : ''} ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}
    >
      {agent && (
        <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
          <div className="flex items-center">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={agent.avatar_url || ''} />
              <AvatarFallback 
                style={{ backgroundColor: accentColor }}
                className="text-white"
              >
                {agent.name?.charAt(0) || <Bot size={16} />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{agent.name}</span>
              {agent.objective && (
                <span className="text-xs opacity-70 truncate max-w-[180px]">{agent.objective}</span>
              )}
            </div>
          </div>
          
          <Badge 
            variant="outline" 
            className={`text-xs uppercase ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
          >
            {agent.personality === "expert" && "Expert"}
            {agent.personality === "friendly" && "Amical"}
            {agent.personality === "concise" && "Concis"}
            {agent.personality === "empathetic" && "Empathique"}
          </Badge>
        </div>
      )}
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {isFetching ? (
          <>
            <div className="flex items-start gap-3 animate-pulse">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </>
        ) : (
          <>
            {errorState && (
              <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-md flex items-center justify-between text-red-800 dark:text-red-200 text-sm mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{errorState}</span>
                </div>
              </div>
            )}
            
            {messages.map((message, i) => (
              message.role !== 'system' && (
                <ChatMessage 
                  key={i} 
                  message={message} 
                  agentName={agent?.name}
                  agentAvatar={agent?.avatar_url}
                  accentColor={accentColor}
                  onRetry={message.isError ? handleRetry : undefined}
                />
              )
            ))}
          </>
        )}
        
        {isLoading && (
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={agent?.avatar_url || ''} />
              <AvatarFallback 
                style={{ backgroundColor: accentColor }}
                className="text-white"
              >
                {agent?.name?.charAt(0) || <Bot size={16} />}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-pulse"></div>
              <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div 
        className="border-t p-3 pb-4" 
        style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
      >
        <ChatInput
          onSendMessage={handleSend}
          isLoading={isLoading}
          disabled={isFetching}
          placeholder="Tapez un message..."
        />
        
        {!hideCredit && isEmbed && (
          <div className="flex items-center justify-center mt-2 text-xs text-gray-500 dark:text-gray-400">
            <a 
              href="https://luvvix.it.com/ai-studio" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center hover:text-gray-700 dark:hover:text-gray-300"
            >
              Powered by LuvviX AI Studio
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        )}
      </div>
      
      <style>
        {`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          .prose img {
            margin: 0;
          }
          
          .prose :where(code):not(:where([class~="not-prose"],[class~="not-prose"] *)) {
            background-color: ${theme === 'dark' ? 'rgba(226, 232, 240, 0.1)' : 'rgba(226, 232, 240, 0.5)'};
            border-radius: 0.25rem;
            padding: 0.125rem 0.25rem;
          }
          
          /* Hide scrollbar for Chrome, Safari and Opera */
          .overflow-y-auto::-webkit-scrollbar {
            display: none;
          }
          
          /* Hide scrollbar for IE, Edge and Firefox */
          .overflow-y-auto {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}
      </style>
    </div>
  );
};

export default EmbedChat;
