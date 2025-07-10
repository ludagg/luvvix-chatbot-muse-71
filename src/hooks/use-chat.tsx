
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Contact {
  id: string;
  user_id: string;
  contact_user_id: string;
  contact_name?: string;
  added_at: string;
  is_blocked: boolean;
  user_profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  id: string;
  type: 'private' | 'group';
  name?: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  participants?: Participant[];
  last_message?: ChatMessage;
  unread_count?: number;
}

export interface Participant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  last_read_at: string;
  is_muted: boolean;
  user_profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: 'text' | 'voice' | 'image' | 'video' | 'document' | 'contact' | 'location' | 'sticker' | 'gif';
  content?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  duration?: number;
  reply_to?: string;
  is_edited: boolean;
  sent_at: string;
  edited_at?: string;
  is_deleted: boolean;
  sender_profile?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  reactions?: MessageReaction[];
  status?: 'sent' | 'delivered' | 'read';
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: ChatMessage[] }>({});
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  // Charger les conversations avec une approche simplifiée
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Loading conversations for user:', user.id);
      
      // Requête simplifiée pour éviter les problèmes de récursion
      const { data: conversationsData, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('created_by', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        throw error;
      }

      console.log('Conversations loaded:', conversationsData);
      setConversations(conversationsData || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive"
      });
    }
  }, [user]);

  // Charger les contacts avec une approche simplifiée
  const loadContacts = useCallback(async () => {
    if (!user) return;

    try {
      console.log('Loading contacts for user:', user.id);
      
      const { data: contactsData, error } = await supabase
        .from('user_contacts')
        .select(`
          *,
          user_profiles!user_contacts_contact_user_id_fkey(
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .eq('is_blocked', false)
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error loading contacts:', error);
        throw error;
      }

      console.log('Contacts loaded:', contactsData);
      setContacts(contactsData || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les contacts",
        variant: "destructive"
      });
    }
  }, [user]);

  // Charger les messages d'une conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      console.log('Loading messages for conversation:', conversationId);
      
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          user_profiles!chat_messages_sender_id_fkey(
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('sent_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error loading messages:', error);
        throw error;
      }

      console.log('Messages loaded:', messagesData);
      setMessages(prev => ({
        ...prev,
        [conversationId]: messagesData || []
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
    if (!user) return;

    try {
      console.log('Sending message:', { conversationId, messageType, content });
      
      const { data: messageData, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          message_type: messageType,
          content,
          file_url: fileUrl,
          file_name: fileName,
          file_size: fileSize,
          duration,
          reply_to: replyTo
        })
        .select()
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      console.log('Message sent:', messageData);
      
      // Recharger les messages et conversations
      await loadMessages(conversationId);
      await loadConversations();

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès"
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    }
  }, [user, loadMessages, loadConversations]);

  // Créer une conversation privée
  const createPrivateConversation = useCallback(async (participantId: string) => {
    if (!user) return null;

    try {
      console.log('Creating private conversation with:', participantId);
      
      // Créer une nouvelle conversation
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          type: 'private',
          created_by: user.id,
          name: `Conversation privée`
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        throw convError;
      }

      console.log('Private conversation created:', conversation);
      await loadConversations();
      
      toast({
        title: "Conversation créée",
        description: "Nouvelle conversation privée créée"
      });

      return conversation.id;
    } catch (error) {
      console.error('Error creating private conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive"
      });
      return null;
    }
  }, [user, loadConversations]);

  // Créer un groupe
  const createGroup = useCallback(async (name: string, description: string, participantIds: string[]) => {
    if (!user) return null;

    try {
      console.log('Creating group:', { name, description, participantIds });
      
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          type: 'group',
          name,
          description,
          created_by: user.id
        })
        .select()
        .single();

      if (convError) {
        console.error('Error creating group:', convError);
        throw convError;
      }

      console.log('Group created:', conversation);
      await loadConversations();
      
      toast({
        title: "Groupe créé",
        description: `Le groupe "${name}" a été créé avec succès`
      });

      return conversation.id;
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le groupe",
        variant: "destructive"
      });
      return null;
    }
  }, [user, loadConversations]);

  // Ajouter un contact
  const addContact = useCallback(async (contactUserId: string, contactName?: string) => {
    if (!user) return;

    try {
      console.log('Adding contact:', { contactUserId, contactName });
      
      const { error } = await supabase
        .from('user_contacts')
        .insert({
          user_id: user.id,
          contact_user_id: contactUserId,
          contact_name: contactName
        });

      if (error) {
        console.error('Error adding contact:', error);
        throw error;
      }

      console.log('Contact added successfully');
      await loadContacts();
      
      toast({
        title: "Contact ajouté",
        description: "Le contact a été ajouté avec succès"
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le contact",
        variant: "destructive"
      });
    }
  }, [user, loadContacts]);

  // Rechercher des utilisateurs
  const searchUsers = useCallback(async (query: string) => {
    try {
      console.log('Searching users:', query);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, username, full_name, avatar_url')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(20);

      if (error) {
        console.error('Error searching users:', error);
        throw error;
      }

      console.log('Users found:', data);
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }, []);

  // Initialisation
  useEffect(() => {
    if (user) {
      console.log('Initializing chat for user:', user.id);
      setLoading(true);
      Promise.all([
        loadConversations(),
        loadContacts()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [user, loadConversations, loadContacts]);

  // Real-time subscriptions simplifiées
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscriptions for user:', user.id);

    // Écouter les nouveaux messages
    const messagesChannel = supabase
      .channel('chat_messages_' + user.id)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, (payload) => {
        console.log('New message received:', payload);
        const newMessage = payload.new as any;
        if (newMessage.conversation_id === activeConversation) {
          loadMessages(newMessage.conversation_id);
        }
        loadConversations();
      })
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(messagesChannel);
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
