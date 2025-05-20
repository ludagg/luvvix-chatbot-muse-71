
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Loader2, Send, User, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    // Create a new conversation when the component mounts
    createConversation();
  }, [agent?.id]);

  const createConversation = async () => {
    if (!agent?.id) return;
    
    try {
      const sessionId = Math.random().toString(36).substring(2, 15);
      
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
      
      // In a real application, here you would call your AI service
      // For now, we'll simulate a response
      setTimeout(async () => {
        const botResponse = {
          role: 'assistant',
          content: `Je suis ${agent.name}, votre assistant IA. Je comprends votre message: "${inputValue}". Dans une vraie application, je vous donnerais une réponse intelligente basée sur mes connaissances et mon objectif: ${agent.objective}.`
        };
        
        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);
        
        // Store bot response in the database
        await supabase
          .from('ai_messages')
          .insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: botResponse.content
          });
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
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
                <div className="flex-1">
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
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputValue.trim()}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
