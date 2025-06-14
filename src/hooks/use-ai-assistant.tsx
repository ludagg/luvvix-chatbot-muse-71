
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: Date;
  updated_at: Date;
}

export const useAIAssistant = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();

  const sendMessage = async (content: string, conversationId?: string) => {
    if (!user) return null;

    setIsTyping(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: content,
          conversationId: conversationId || currentConversation?.id,
          context: 'assistant'
        },
      });

      if (error) throw error;

      const newMessage: Message = {
        id: Date.now().toString(),
        content: content,
        role: 'user',
        timestamp: new Date()
      };

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      if (currentConversation) {
        const updatedConversation = {
          ...currentConversation,
          messages: [...currentConversation.messages, newMessage, assistantMessage],
          updated_at: new Date()
        };
        setCurrentConversation(updatedConversation);
      } else {
        const newConversation: Conversation = {
          id: Date.now().toString(),
          title: content.slice(0, 50) + '...',
          messages: [newMessage, assistantMessage],
          created_at: new Date(),
          updated_at: new Date()
        };
        setCurrentConversation(newConversation);
        setConversations(prev => [newConversation, ...prev]);
      }

      return assistantMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsTyping(false);
    }
  };

  const createNewConversation = () => {
    setCurrentConversation(null);
  };

  const loadConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
    toast({
      title: "Conversation supprimée",
      description: "La conversation a été supprimée",
    });
  };

  const getAIRecommendations = async (context: 'weather' | 'calendar' | 'general') => {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: `Génère 3 suggestions utiles pour ${context === 'weather' ? 'la météo' : context === 'calendar' ? 'le calendrier' : 'général'}`,
          context: 'recommendations'
        },
      });

      if (error) throw error;
      return data.suggestions || [];
    } catch (error) {
      console.error('Error getting AI recommendations:', error);
      return [];
    }
  };

  return {
    conversations,
    currentConversation,
    loading,
    isTyping,
    sendMessage,
    createNewConversation,
    loadConversation,
    deleteConversation,
    getAIRecommendations,
  };
};
