
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Loader2, Send, User, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showToast } from '@/utils/toast-utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIChatProps {
  agent: any;
  embedded?: boolean;
  className?: string;
}

const AIChat: React.FC<AIChatProps> = ({ agent, embedded = false, className = '' }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sessionId] = useState<string>(() => Math.random().toString(36).substring(2, 15));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Create a new conversation when the component mounts
    if (agent?.id) {
      createConversation();
    }
  }, [agent?.id]);

  const createConversation = async () => {
    if (!agent?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          agent_id: agent.id,
          is_guest: true,
          session_id: sessionId
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setConversationId(data.id);
      
      // Add a welcome message
      const welcomeMessage = {
        role: 'assistant',
        content: `Bonjour ! Je suis ${agent.name}. ${agent.objective}. Comment puis-je vous aider aujourd'hui ?`
      };
      
      setMessages([welcomeMessage]);
      
      // Store welcome message in the database
      await supabase
        .from('ai_messages')
        .insert({
          conversation_id: data.id,
          role: 'assistant',
          content: welcomeMessage.content
        });
      
    } catch (error) {
      console.error('Error creating conversation:', error);
      showToast.error('Erreur', 'Impossible de créer une conversation');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !conversationId) return;
    
    const userMessage = {
      role: 'user',
      content: inputValue
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Store user message in the database
      await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: userMessage.content
        });
      
      // Call the Cerebras chat Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cerebras-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agentId: agent.id,
            message: inputValue,
            sessionId,
            conversationId,
            embedded
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la communication avec l\'IA');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Add AI response to chat
      const botResponse = {
        role: 'assistant',
        content: data.reply || "Je n'ai pas pu générer de réponse."
      };
      
      setMessages(prev => [...prev, botResponse]);
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Désolé, une erreur est survenue lors du traitement de votre message. Veuillez réessayer."
        }
      ]);
      
      showToast.error('Erreur', error.message || 'Impossible d\'envoyer votre message');
    } finally {
      setIsLoading(false);
      // Focus back on input after sending a message
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get avatar based on agent type
  const getAgentAvatar = () => {
    if (!agent) return <Bot className="w-4 h-4 text-white" />;
    
    switch (agent?.avatar_style) {
      case "human-female-1":
        return <span className="text-xs">👩</span>;
      case "human-female-2":
        return <span className="text-xs">👱‍♀️</span>;
      case "human-male-1":
        return <span className="text-xs">👨</span>;
      case "human-male-2":
        return <span className="text-xs">👨‍🦰</span>;
      case "sparkles":
        return <span className="text-xs">✨</span>;
      default:
        return <Bot className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div 
      className={`flex flex-col h-full ${className} ${
        embedded ? 'bg-transparent' : 'bg-slate-50 dark:bg-slate-900'
      }`}
    >
      {/* Chat header - Only shown when not embedded */}
      {!embedded && agent && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center">
          <Avatar className="h-8 w-8 mr-3 bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
            <div className="flex items-center justify-center w-full h-full rounded-full">
              {getAgentAvatar()}
            </div>
          </Avatar>
          <div>
            <h2 className="font-medium text-sm text-slate-900 dark:text-white">
              {agent.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {agent.personality === "expert" && "Expert"}
              {agent.personality === "friendly" && "Amical"}
              {agent.personality === "concise" && "Concis"}
              {agent.personality === "empathetic" && "Empathique"}
            </p>
          </div>
        </div>
      )}
      
      {/* Messages container */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="flex-1 p-3 md:p-5 space-y-5">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex animate-fade-in ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`flex items-start max-w-[85%] group ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className={`h-8 w-8 shrink-0 ${message.role === 'user' ? 'ml-3' : 'mr-3'}`}>
                  <div className={`flex items-center justify-center w-full h-full rounded-full ${
                    message.role === 'user' 
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                      : 'bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      getAgentAvatar()
                    )}
                  </div>
                </Avatar>
                
                <div 
                  className={`rounded-2xl p-3 shadow-sm ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading indicator when waiting for AI */}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-start max-w-[85%] group">
                <Avatar className="h-8 w-8 mr-3 shrink-0">
                  <div className="flex items-center justify-center w-full h-full rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                    {getAgentAvatar()}
                  </div>
                </Avatar>
                
                <div className="rounded-2xl p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-violet-500 dark:text-violet-400" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">En train d'écrire...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input area */}
      <div className={`p-4 border-t ${
        embedded ? 'bg-transparent border-slate-200 dark:border-slate-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      }`}>
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message..."
            className="flex-1 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-violet-400 dark:focus:border-violet-500"
            disabled={isLoading || !agent}
            autoComplete="off"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputValue.trim() || !agent}
            size="icon"
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
