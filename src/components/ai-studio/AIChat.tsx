
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Loader2, Send, User, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { showToast } from '@/utils/toast-utils';

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

  return (
    <div className={`flex flex-col h-full ${className} ${embedded ? 'bg-transparent' : 'bg-gray-50 dark:bg-gray-900'}`}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.role !== 'user' && (
                  <Avatar className="w-6 h-6 mt-1">
                    <div className="flex items-center justify-center w-full h-full bg-gray-300 dark:bg-gray-600 rounded-full">
                      <Bot className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                    </div>
                  </Avatar>
                )}
                <div className="flex-1 whitespace-pre-wrap">
                  {message.content}
                </div>
                {message.role === 'user' && (
                  <Avatar className="w-6 h-6 mt-1">
                    <div className="flex items-center justify-center w-full h-full bg-blue-700 rounded-full">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </Avatar>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg p-3">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className={`p-4 border-t ${embedded ? 'bg-transparent' : 'bg-white dark:bg-gray-800'} border-gray-200 dark:border-gray-700`}>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Écrivez votre message..."
            className="flex-1"
            disabled={isLoading || !agent}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputValue.trim() || !agent}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
