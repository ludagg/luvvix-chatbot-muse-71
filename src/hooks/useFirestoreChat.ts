
import { useState, useEffect, useCallback } from 'react';
import { FirestoreChatService, FirestoreConversation, FirestoreMessage } from '@/services/firestore-chat';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useFirestoreChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<FirestoreConversation[]>([]);
  const [currentMessages, setCurrentMessages] = useState<FirestoreMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Écouter les conversations de l'utilisateur
  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);
    
    const unsubscribe = FirestoreChatService.subscribeToUserConversations(
      user.id,
      (conversations) => {
        setConversations(conversations);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  // Écouter les messages de la conversation active
  useEffect(() => {
    if (!activeConversationId) {
      setCurrentMessages([]);
      return;
    }

    const unsubscribe = FirestoreChatService.subscribeToMessages(
      activeConversationId,
      (messages) => {
        setCurrentMessages(messages);
      }
    );

    return () => unsubscribe();
  }, [activeConversationId]);

  // Créer une nouvelle conversation
  const createConversation = useCallback(async (participantIds: string[], isGroup: boolean = false, groupName?: string) => {
    if (!user?.id) return null;

    try {
      const conversationId = await FirestoreChatService.createConversation(
        [...participantIds, user.id],
        isGroup,
        groupName
      );
      toast.success('Conversation créée');
      return conversationId;
    } catch (error) {
      toast.error('Erreur lors de la création de la conversation');
      console.error(error);
      return null;
    }
  }, [user?.id]);

  // Envoyer un message
  const sendMessage = useCallback(async (conversationId: string, content: string, type: 'text' | 'image' | 'file' | 'voice' = 'text', mediaUrl?: string) => {
    if (!user?.id) return null;

    try {
      const messageId = await FirestoreChatService.sendMessage(
        conversationId,
        user.id,
        content,
        type,
        mediaUrl
      );
      return messageId;
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message');
      console.error(error);
      return null;
    }
  }, [user?.id]);

  // Marquer les messages comme lus
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!user?.id) return;

    try {
      await FirestoreChatService.markMessagesAsRead(conversationId, user.id);
    } catch (error) {
      console.error('Erreur marquer comme lu:', error);
    }
  }, [user?.id]);

  // Supprimer une conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      await FirestoreChatService.deleteConversation(conversationId);
      toast.success('Conversation supprimée');
      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    }
  }, [activeConversationId]);

  return {
    conversations,
    currentMessages,
    loading,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    sendMessage,
    markAsRead,
    deleteConversation
  };
};
