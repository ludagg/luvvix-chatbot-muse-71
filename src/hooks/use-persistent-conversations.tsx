
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export const usePersistentConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);

  // Charger les conversations de l'utilisateur
  const loadConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: conversationsData, error } = await supabase
        .from('ai_assistant_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const conversationsWithMessages = await Promise.all(
        conversationsData.map(async (conv) => {
          const { data: messagesData, error: messagesError } = await supabase
            .from('ai_assistant_messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: true });

          if (messagesError) throw messagesError;

          return {
            id: conv.id,
            title: conv.title,
            createdAt: new Date(conv.created_at),
            updatedAt: new Date(conv.updated_at),
            messages: messagesData.map(msg => ({
              id: msg.id,
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
              imageUrl: msg.image_url || undefined,
              createdAt: new Date(msg.created_at)
            }))
          };
        })
      );

      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      toast.error('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  // Créer une nouvelle conversation
  const createConversation = async (firstMessage?: string): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('ai_assistant_conversations')
        .insert({
          user_id: user.id,
          title: firstMessage ? firstMessage.slice(0, 50) + '...' : 'Nouvelle conversation'
        })
        .select()
        .single();

      if (error) throw error;

      const newConversation: Conversation = {
        id: data.id,
        title: data.title,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        messages: []
      };

      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      
      return data.id;
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      toast.error('Erreur lors de la création de la conversation');
      return null;
    }
  };

  // Sauvegarder un message
  const saveMessage = async (conversationId: string, message: Omit<Message, 'id' | 'createdAt'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('ai_assistant_messages')
        .insert({
          conversation_id: conversationId,
          role: message.role,
          content: message.content,
          image_url: message.imageUrl || null
        })
        .select()
        .single();

      if (error) throw error;

      const savedMessage: Message = {
        id: data.id,
        role: data.role,
        content: data.content,
        imageUrl: data.image_url || undefined,
        createdAt: new Date(data.created_at)
      };

      // Mettre à jour la conversation locale
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: [...conv.messages, savedMessage],
            updatedAt: new Date()
          };
        }
        return conv;
      }));

      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => prev ? {
          ...prev,
          messages: [...prev.messages, savedMessage],
          updatedAt: new Date()
        } : null);
      }

      return savedMessage;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du message:', error);
      toast.error('Erreur lors de la sauvegarde du message');
      return null;
    }
  };

  // Charger une conversation spécifique
  const loadConversation = (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  // Supprimer une conversation
  const deleteConversation = async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ai_assistant_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }

      toast.success('Conversation supprimée');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Créer une nouvelle conversation vide
  const startNewConversation = () => {
    setCurrentConversation(null);
  };

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  return {
    conversations,
    currentConversation,
    loading,
    createConversation,
    saveMessage,
    loadConversation,
    deleteConversation,
    startNewConversation,
    loadConversations
  };
};
