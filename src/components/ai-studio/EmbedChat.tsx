import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, RefreshCw, Bot, User, Info, ExternalLink } from "lucide-react";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  
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
        await supabase.rpc('increment_agent_views', { agent_id: agentId });
      } catch (error) {
        console.error('Error fetching agent:', error);
        setMessages([
          { 
            role: 'system', 
            content: 'Error: Could not load the agent. Please try again later.' 
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
        
      if (error) throw error;
      
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const saveMessage = async (message: Message, convId: string) => {
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

  // Fix the type error by properly typing the function parameter
  const handleSend = async (text?: string) => {
    const userMessage = text || input;
    if (!userMessage.trim()) return;
    
    // Create a conversation if it doesn't exist
    if (!conversationId) {
      const newConversationId = await createConversation();
      setConversationId(newConversationId);
    }
    
    try {
      setIsLoading(true);
      setInput('');
      
      // Add user message to the UI
      const newUserMessage = { role: 'user' as const, content: userMessage };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      
      // Save user message to the database if we have a conversation ID
      if (conversationId) {
        await saveMessage(newUserMessage, conversationId);
      }
      
      // Call the AI function
      const response = await fetch('/api/v1/cerebras-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: agentId,
          message: userMessage,
          sessionId: sessionId,
          userId: user?.id || null
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Add assistant message to the UI
      const assistantMessage = { 
        role: 'assistant' as const, 
        content: data.response || 'Sorry, I could not generate a response.'
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      // Save assistant message to the database
      if (conversationId) {
        await saveMessage(assistantMessage, conversationId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response from the agent."
      });
      
      setMessages(prevMessages => [
        ...prevMessages, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error processing your request. Please try again later.'
        }
      ]);
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
          messages.map((message, i) => (
            message.role !== 'system' && (
              <div key={i} className={`flex items-start gap-3 ${message.role === 'assistant' ? 'text-gray-800 dark:text-gray-200' : ''}`}>
                {message.role === 'assistant' ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={agent?.avatar_url || ''} />
                    <AvatarFallback 
                      style={{ backgroundColor: accentColor }}
                      className="text-white"
                    >
                      {agent?.name?.charAt(0) || <Bot size={16} />}
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
          ))
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
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
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
