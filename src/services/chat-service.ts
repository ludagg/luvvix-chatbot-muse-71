
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from './auth-utils';

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

class ChatService {
  // Gestion des contacts
  async getContacts(): Promise<Contact[]> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

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
      .eq('is_blocked', false)
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
    return data || [];
  }

  async addContact(contactUserId: string, contactName?: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

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
  }

  // Gestion des conversations
  async getConversations(): Promise<Conversation[]> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('chat_conversations')
      .select(`
        *,
        chat_participants(
          user_id,
          role,
          last_read_at,
          user_profiles(username, full_name, avatar_url)
        )
      `)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }

    return data || [];
  }

  async createPrivateConversation(participantId: string): Promise<string> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Créer une nouvelle conversation
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .insert({
        type: 'private',
        created_by: user.id
      })
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      throw convError;
    }

    // Ajouter les participants
    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert([
        { conversation_id: conversation.id, user_id: user.id, role: 'admin' },
        { conversation_id: conversation.id, user_id: participantId, role: 'member' }
      ]);

    if (participantsError) {
      console.error('Error adding participants:', participantsError);
      throw participantsError;
    }

    return conversation.id;
  }

  // Gestion des messages
  async getMessages(conversationId: string, limit: number = 50): Promise<ChatMessage[]> {
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
      .eq('is_deleted', false)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return (data || []).reverse();
  }

  async sendMessage(
    conversationId: string,
    messageType: ChatMessage['message_type'],
    content?: string,
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    duration?: number,
    replyTo?: string
  ): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
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
      });

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    // Mettre à jour la conversation
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  }

  // Recherche d'utilisateurs
  async searchUsers(query: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, username, full_name, avatar_url')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error('Error searching users:', error);
      throw error;
    }
    return data || [];
  }
}

export const chatService = new ChatService();
