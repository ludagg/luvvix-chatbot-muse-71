
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MessengerLuvvixService, Conversation, Message, MessengerUser } from '@/services/messengerLuvvixService';
import { toast } from 'sonner';

export const useMessengerLuvvix = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUser, setCurrentUser] = useState<MessengerUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger les conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await MessengerLuvvixService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast.error('Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Charger l'utilisateur courant
  const loadCurrentUser = useCallback(async () => {
    if (!user) return;

    try {
      const messengerUser = await MessengerLuvvixService.getCurrentMessengerUser();
      setCurrentUser(messengerUser);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  }, [user]);

  // Créer une conversation directe
  const createDirectConversation = useCallback(async (otherUserId: string) => {
    try {
      const conversation = await MessengerLuvvixService.createDirectConversation(otherUserId);
      if (conversation) {
        await loadConversations();
        return conversation;
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Erreur lors de la création de la conversation');
    }
    return null;
  }, [loadConversations]);

  // Créer un groupe
  const createGroup = useCallback(async (name: string, description: string, participantIds: string[]) => {
    try {
      const conversation = await MessengerLuvvixService.createGroupConversation(name, description, participantIds);
      if (conversation) {
        await loadConversations();
        return conversation;
      }
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error('Erreur lors de la création du groupe');
    }
    return null;
  }, [loadConversations]);

  // Rechercher des utilisateurs
  const searchUsers = useCallback(async (query: string) => {
    try {
      return await MessengerLuvvixService.searchUsers(query);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }, []);

  // Mettre à jour le statut
  const updateStatus = useCallback(async (status: MessengerUser['status']) => {
    try {
      await MessengerLuvvixService.updateUserStatus(status);
      await loadCurrentUser();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  }, [loadCurrentUser]);

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!user) return;

    const conversationsChannel = supabase
      .channel('messenger_conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messenger_luvvix_conversations'
      }, () => {
        loadConversations();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messenger_luvvix_participants'
      }, () => {
        loadConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [user, loadConversations]);

  // Initialisation
  useEffect(() => {
    if (user) {
      loadCurrentUser();
      loadConversations();
    }
  }, [user, loadCurrentUser, loadConversations]);

  return {
    conversations,
    currentUser,
    loading,
    createDirectConversation,
    createGroup,
    searchUsers,
    updateStatus,
    refreshConversations: loadConversations
  };
};

export const useConversationMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les messages
  const loadMessages = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      setLoading(true);
      const data = await MessengerLuvvixService.getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  }, [conversationId, user]);

  // Envoyer un message
  const sendMessage = useCallback(async (
    content: string,
    messageType: Message['message_type'] = 'text',
    mediaUrl?: string,
    replyToId?: string
  ) => {
    if (!conversationId) return null;

    try {
      const message = await MessengerLuvvixService.sendMessage(conversationId, content, messageType, mediaUrl, replyToId);
      if (message) {
        setMessages(prev => [...prev, message]);
        return message;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    }
    return null;
  }, [conversationId]);

  // Modifier un message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      await MessengerLuvvixService.editMessage(messageId, newContent);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent, is_edited: true }
          : msg
      ));
    } catch (error) {
      console.error('Error editing message:', error);
      toast.error('Erreur lors de la modification du message');
    }
  }, []);

  // Supprimer un message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await MessengerLuvvixService.deleteMessage(messageId);
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: null, is_deleted: true }
          : msg
      ));
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Erreur lors de la suppression du message');
    }
  }, []);

  // Ajouter une réaction
  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await MessengerLuvvixService.addReaction(messageId, emoji);
      // La mise à jour se fera via le temps réel
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Erreur lors de l\'ajout de la réaction');
    }
  }, []);

  // Supprimer une réaction
  const removeReaction = useCallback(async (messageId: string, emoji: string) => {
    try {
      await MessengerLuvvixService.removeReaction(messageId, emoji);
      // La mise à jour se fera via le temps réel
    } catch (error) {
      console.error('Error removing reaction:', error);
      toast.error('Erreur lors de la suppression de la réaction');
    }
  }, []);

  // Upload de fichier
  const uploadFile = useCallback(async (file: File) => {
    if (!conversationId) return null;

    try {
      const url = await MessengerLuvvixService.uploadFile(file, conversationId);
      return url;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erreur lors de l\'upload du fichier');
      return null;
    }
  }, [conversationId]);

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    if (!conversationId || !user) return;

    const messagesChannel = supabase
      .channel(`messages_${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messenger_luvvix_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        // Charger le message complet avec les relations
        MessengerLuvvixService.getMessages(conversationId, 1).then(newMessages => {
          if (newMessages.length > 0) {
            const newMessage = newMessages[0];
            setMessages(prev => {
              // Éviter les doublons
              if (prev.find(msg => msg.id === newMessage.id)) {
                return prev;
              }
              return [...prev, newMessage];
            });
          }
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messenger_luvvix_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, () => {
        loadMessages();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messenger_luvvix_message_reactions'
      }, () => {
        loadMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [conversationId, user, loadMessages]);

  // Initialisation
  useEffect(() => {
    if (conversationId) {
      loadMessages();
    }
  }, [conversationId, loadMessages]);

  return {
    messages,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    uploadFile,
    refreshMessages: loadMessages
  };
};
