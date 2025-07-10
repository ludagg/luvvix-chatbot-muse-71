
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface SimpleMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'voice';
  sent_at: string;
  sender_profile?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface SimpleConversation {
  id: string;
  name?: string;
  type: 'private' | 'group';
  created_by: string;
  created_at: string;
  updated_at: string;
  participants?: SimpleParticipant[];
  last_message?: SimpleMessage;
}

export interface SimpleParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user_profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface SimpleContact {
  id: string;
  user_id: string;
  contact_user_id: string;
  contact_name?: string;
  added_at: string;
  user_profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export const useSimpleChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<SimpleConversation[]>([]);
  const [contacts, setContacts] = useState<SimpleContact[]>([]);
  const [messages, setMessages] = useState<{ [key: string]: SimpleMessage[] }>({});
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  // Charger les conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select(`
          *,
          chat_participants(
            user_id,
            role,
            user_profiles(username, full_name, avatar_url)
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setConversations(data || []);
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
      const { data, error } = await supabase
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
        .order('added_at', { ascending: false });

      if (error) throw error;

      setContacts(data || []);
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
      const { data, error } = await supabase
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
        .order('sent_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [conversationId]: data || []
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
  const sendMessage = useCallback(async (conversationId: string, content: string) => {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      // Recharger les messages
      await loadMessages(conversationId);

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
  }, [user, loadMessages]);

  // Créer une conversation privée
  const createPrivateConversation = useCallback(async (participantId: string) => {
    if (!user) return null;

    try {
      // Créer la conversation
      const { data: conversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          type: 'private',
          created_by: user.id
        })
        .select()
        .single();

      if (convError) throw convError;

      // Ajouter les participants
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert([
          { conversation_id: conversation.id, user_id: user.id, role: 'admin' },
          { conversation_id: conversation.id, user_id: participantId, role: 'member' }
        ]);

      if (participantsError) throw participantsError;

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

  // Ajouter un contact
  const addContact = useCallback(async (contactUserId: string, contactName?: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_contacts')
        .insert({
          user_id: user.id,
          contact_user_id: contactUserId,
          contact_name: contactName
        });

      if (error) throw error;

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

  // Real-time pour les nouveaux messages
  useEffect(() => {
    if (!user) return;

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

    return () => {
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
    addContact,
    loadConversations,
    loadContacts
  };
};
