
import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Bot, User, ExternalLink, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<string | null>(null);
  
  // Generate a unique session ID for guest users
  useEffect(() => {
    if (!sessionId) {
      setSessionId(crypto.randomUUID());
    }
    
    if (startMessage && !messages.length) {
      handleSend(startMessage);
    }
  }, []);

  // Fetch agent information
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_agents')
          .select('*')
          .eq('id', agentId)
          .single();
          
        if (error) {
          console.error("Error fetching agent:", error);
          throw error;
        }
        
        setAgent(data);
        
        // Add system message
        setMessages([
          { 
            role: 'system', 
            content: `Agent initialized: ${data.name}`
          }
        ]);
        
        // Increment views counter
        try {
          // Directly update the views counter instead of using RPC
          await supabase
            .from('ai_agents')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', agentId);
        } catch (viewError) {
          console.error('Error incrementing agent views:', viewError);
          // Continue even if view counting fails
        }
      } catch (error) {
        console.error('Error fetching agent:', error);
        setErrorState('Could not load the agent. Please try again later.');
        setMessages([
          { 
            role: 'system', 
            content: 'Error: Could not load the agent. Please try again later.',
            isError: true
          }
        ]);
      } finally {
        setIsFetching(false);
      }
    };

    fetchAgent();
  }, [agentId]);

  // Scroll to bottom when messages change
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
        console.error("Error creating conversation:", error);
        throw error;
      }
      
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const saveMessage = async (message: Message, convId: string) => {
    if (message.isError) return; // Don't save error messages
    
    try {
      await supabase
        .from('ai_messages')
        .insert({
          conversation_id: convId,
          content: message.content,
          role: message.role
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleRetry = async () => {
    setErrorState(null);
    await handleSend();
  };

  const handleSend = async (text?: string): Promise<void> => {
    const userMessage = text || input;
    if (!userMessage.trim()) return;
    
    setErrorState(null);
    
    // Create a conversation if it doesn't exist
    if (!conversationId) {
      const newConversationId = await createConversation();
      setConversationId(newConversationId);
    }
    
    try {
      setIsLoading(true);
      setInput('');
      
      // Add user message to the UI
      const newUserMessage = { 
        role: 'user' as const, 
        content: userMessage,
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      
      // Save user message to the database if we have a conversation ID
      if (conversationId) {
        await saveMessage(newUserMessage, conversationId);
      }
      
      // Call the AI function
      console.log("Calling cerebras-chat with:", {
        agentId,
        message: userMessage,
        sessionId,
        conversationId,
        embedded: isEmbed,
        userId: user?.id || null
      });
      
      // Try with cerebras-chat endpoint first
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
          conversationId,
          embedded: isEmbed
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error from cerebras-chat endpoint:", errorData);
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Cerebras chat response:", data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Add assistant message to the UI
      const assistantMessage = { 
        role: 'assistant' as const, 
        content: data.reply || 'Sorry, I could not generate a response.',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      // Update conversation ID if it was created by the function
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
      
      // Reset retry count on success
      setRetryCount(0);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback to ai-studio-chat if cerebras-chat fails
      if (retryCount < 1) {
        setRetryCount(prevCount => prevCount + 1);
        try {
          console.log("Trying ai-studio-chat as fallback...");
          
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
          
          // Add assistant message to the UI
          const assistantMessage = { 
            role: 'assistant' as const, 
            content: fallbackData.response || 'Sorry, I could not generate a response.',
            timestamp: new Date()
          };
          
          setMessages(prevMessages => [...prevMessages, assistantMessage]);
          setErrorState(null);
          
          // Update conversation ID if it was created by the function
          if (fallbackData.conversationId && !conversationId) {
            setConversationId(fallbackData.conversationId);
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          
          setErrorState('Failed to get a response from the agent after multiple attempts.');
          
          setMessages(prevMessages => [
            ...prevMessages, 
            { 
              role: 'assistant', 
              content: 'Sorry, I encountered an error processing your request. Please try again by clicking the retry button.',
              isError: true
            }
          ]);
        }
      } else {
        setErrorState('Failed to get a response from the agent. Please try again.');
        
        setMessages(prevMessages => [
          ...prevMessages, 
          { 
            role: 'assistant', 
            content: 'Sorry, I encountered an error processing your request. Please try again by clicking the retry button.',
            isError: true
          }
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`flex flex-col h-full overflow-hidden ${theme === 'dark' ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
    >
      {agent && (
        <div className="flex items-center border-b px-4 py-3" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
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
              <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-md flex items-center text-red-800 dark:text-red-200 text-sm mb-4">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>{errorState}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-auto bg-red-100 dark:bg-red-800 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700 flex items-center gap-1"
                  onClick={handleRetry}
                >
                  <RefreshCw className="h-3 w-3" /> Retry
                </Button>
              </div>
            )}
            
            {messages.map((message, i) => (
              message.role !== 'system' && (
                <div 
                  key={i} 
                  className={`flex items-start gap-3 ${
                    message.role === 'assistant' 
                      ? 'text-gray-800 dark:text-gray-200' 
                      : ''
                  } ${
                    message.isError 
                      ? 'opacity-70' 
                      : ''
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={agent?.avatar_url || ''} />
                      <AvatarFallback 
                        style={{ backgroundColor: message.isError ? '#ef4444' : accentColor }}
                        className="text-white"
                      >
                        {message.isError ? <AlertCircle size={16} /> : (agent?.name?.charAt(0) || <Bot size={16} />)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
                      <AvatarFallback className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
                        <User size={16} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`${message.role === 'assistant' ? 'prose dark:prose-invert prose-sm max-w-none' : ''}`}>
                    <ReactMarkdown>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
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
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="resize-none h-10 min-h-10 py-2"
            style={{
              borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
              backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb'
            }}
            disabled={isLoading || isFetching}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading || isFetching}
            style={{ backgroundColor: accentColor }}
            className="h-10 px-3"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        
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
