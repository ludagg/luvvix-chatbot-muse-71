
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
  const inputRef = useRef<HTMLInputElement>(null);

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
    // Focus input after message is sent
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, isLoading]);

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className={`flex flex-col h-full ${className} ${embedded ? 'bg-transparent' : 'bg-gradient-to-b from-[#0f1219] to-[#171c28]'} rounded-lg overflow-hidden`}>
      {/* Chat Header */}
      {!embedded && (
        <div className="p-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              {agent?.avatar_url ? (
                <img src={agent.avatar_url} alt={agent.name} className="object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-luvvix-purple to-luvvix-teal rounded-full">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
            </Avatar>
            <div>
              <h3 className="font-medium text-white">{agent?.name || "Assistant IA"}</h3>
              <p className="text-xs text-white/60">Agent IA de LuvviX</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div 
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-luvvix-purple to-luvvix-darkpurple text-white shadow-lg' 
                    : 'bg-white/10 backdrop-blur-sm border border-white/10 text-white shadow-md'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role !== 'user' && (
                    <Avatar className="w-7 h-7 mt-1 shrink-0">
                      {agent?.avatar_url ? (
                        <img src={agent.avatar_url} alt={agent.name} className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-luvvix-purple to-luvvix-teal rounded-full">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="w-7 h-7 mt-1 shrink-0">
                      <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-luvvix-lightpurple to-luvvix-purple rounded-full">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </Avatar>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div 
              className="flex justify-start"
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-2xl p-4 flex items-center space-x-2">
                <Loader2 className="w-5 h-5 animate-spin text-luvvix-lightpurple" />
                <span className="text-sm text-white/70">En train d'écrire...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className={`p-4 ${embedded ? 'bg-transparent border-t border-white/10' : 'bg-white/5 backdrop-blur-sm border-t border-white/10'}`}>
        <Card className="bg-white/10 backdrop-blur-md border-white/10 p-1">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Écrivez votre message..."
              className="flex-1 bg-transparent border-0 text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || !inputValue.trim()}
              size="icon"
              className={`rounded-full ${!inputValue.trim() ? 'bg-white/20' : 'bg-gradient-to-r from-luvvix-purple to-luvvix-darkpurple text-white'}`}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AIChat;
