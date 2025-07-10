
import { useState, useEffect, useCallback } from 'react';
import { chatService, type Conversation, type ChatMessage, type Contact } from '@/services/chat-service';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: ChatMessage[] }>({});
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  // Charger les conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive"
      });
    }
  }, [user]);

  // Charger les contacts
  const loadContacts = useCallback(async () => {
    if (!user) return;

    try {
      const data = await chatService.getContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  }, [user]);

  // Charger les messages d'une conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const data = await chatService.getMessages(conversationId);
      setMessages(prev => ({
        ...prev,
        [conversationId]: data
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive"
      });
    }
  }, []);

  // Envoyer un message
  const sendMessage = useCallback(async (
    conversationId: string,
    messageType: ChatMessage['message_type'],
    content?: string,
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    duration?: number,
    replyTo?: string
  ) => {
    try {
      await chatService.sendMessage(
        conversationId,
        messageType,
        content,
        fileUrl,
        fileName,
        fileSize,
        duration,
        replyTo
      );
      
      // Recharger les messages
      await loadMessages(conversationId);
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    }
  }, [loadMessages, loadConversations]);

  // Créer une conversation privée
  const createPrivateConversation = useCallback(async (participantId: string) => {
    try {
      const conversationId = await chatService.createPrivateConversation(participantId);
      await loadConversations();
      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive"
      });
      return null;
    }
  }, [loadConversations]);

  // Créer un groupe
  const createGroup = useCallback(async (name: string, description: string, participantIds: string[]) => {
    try {
      const conversationId = await chatService.createGroupConversation(name, description, participantIds);
      await loadConversations();
      return conversationId;
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le groupe",
        variant: "destructive"
      });
      return null;
    }
  }, [loadConversations]);

  // Ajouter un contact
  const addContact = useCallback(async (contactUserId: string, contactName?: string) => {
    try {
      await chatService.addContact(contactUserId, contactName);
      await loadContacts();
      toast({
        title: "Succès",
        description: "Contact ajouté avec succès"
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le contact",
        variant: "destructive"
      });
    }
  }, [loadContacts]);

  // Rechercher des utilisateurs
  const searchUsers = useCallback(async (query: string) => {
    try {
      return await chatService.searchUsers(query);
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }, []);

  // Initialisation
  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([
        loadConversations(),
        loadContacts()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [user, loadConversations, loadContacts]);

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Écouter les nouveaux messages
    const messagesChannel = supabase
      .channel('chat_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        const newMessage = payload.new as any;
        if (newMessage.conversation_id === activeConversation) {
          loadMessages(newMessage.conversation_id);
        }
        loadConversations();
      })
      .subscribe();

    // Écouter les changements de conversations
    const conversationsChannel = supabase
      .channel('chat_conversations')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_conversations'
      }, () => {
        loadConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(conversationsChannel);
    };
  }, [user, activeConversation, loadMessages, loadConversations]);

  return {
    conversations,
    contacts,
    messages,
    loading,
    activeConversation,
    setActiveConversation,
    loadMessages,
    sendMessage,
    createPrivateConversation,
    createGroup,
    addContact,
    searchUsers,
    loadConversations,
    loadContacts
  };
};
