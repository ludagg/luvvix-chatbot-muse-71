
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

export interface ChatCall {
  id: string;
  conversation_id: string;
  caller_id: string;
  call_type: 'voice' | 'video' | 'group_voice' | 'group_video';
  status: 'calling' | 'ongoing' | 'ended' | 'missed' | 'rejected';
  started_at: string;
  ended_at?: string;
  duration?: number;
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

    if (error) throw error;
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

    if (error) throw error;
  }

  async removeContact(contactId: string): Promise<void> {
    const { error } = await supabase
      .from('user_contacts')
      .delete()
      .eq('id', contactId);

    if (error) throw error;
  }

  async blockContact(contactId: string): Promise<void> {
    const { error } = await supabase
      .from('user_contacts')
      .update({ is_blocked: true })
      .eq('id', contactId);

    if (error) throw error;
  }

  // Gestion des conversations
  async getConversations(): Promise<Conversation[]> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('chat_conversations')
      .select(`
        *,
        chat_participants!inner(
          user_id,
          role,
          last_read_at,
          user_profiles(username, full_name, avatar_url)
        )
      `)
      .eq('chat_participants.user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Récupérer le dernier message et le nombre de non-lus pour chaque conversation
    const conversationsWithDetails = await Promise.all(
      (data || []).map(async (conv) => {
        const lastMessage = await this.getLastMessage(conv.id);
        const unreadCount = await this.getUnreadCount(conv.id);
        
        return {
          ...conv,
          last_message: lastMessage,
          unread_count: unreadCount
        };
      })
    );

    return conversationsWithDetails;
  }

  async createPrivateConversation(participantId: string): Promise<string> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    // Vérifier si une conversation privée existe déjà
    const { data: existing } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('type', 'private')
      .in('id', 
        supabase
          .from('chat_participants')
          .select('conversation_id')
          .eq('user_id', user.id)
      );

    if (existing && existing.length > 0) {
      // Vérifier si l'autre participant est dans cette conversation
      const { data: otherParticipant } = await supabase
        .from('chat_participants')
        .select('conversation_id')
        .eq('user_id', participantId)
        .in('conversation_id', existing.map(c => c.id));

      if (otherParticipant && otherParticipant.length > 0) {
        return otherParticipant[0].conversation_id;
      }
    }

    // Créer une nouvelle conversation
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

    return conversation.id;
  }

  async createGroupConversation(name: string, description: string, participantIds: string[]): Promise<string> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

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

    if (convError) throw convError;

    // Ajouter le créateur comme admin
    const participants = [
      { conversation_id: conversation.id, user_id: user.id, role: 'admin' },
      ...participantIds.map(id => ({
        conversation_id: conversation.id,
        user_id: id,
        role: 'member' as const
      }))
    ];

    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert(participants);

    if (participantsError) throw participantsError;

    return conversation.id;
  }

  // Gestion des messages
  async getMessages(conversationId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        user_profiles!chat_messages_sender_id_fkey(
          username,
          full_name,
          avatar_url
        ),
        message_reactions(*)
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Récupérer le statut des messages pour l'utilisateur actuel
    const user = await getCurrentUser();
    if (user && data) {
      const messagesWithStatus = await Promise.all(
        data.map(async (message) => {
          if (message.sender_id !== user.id) {
            const { data: status } = await supabase
              .from('message_status')
              .select('status')
              .eq('message_id', message.id)
              .eq('user_id', user.id)
              .single();

            return {
              ...message,
              status: status?.status || 'sent'
            };
          }
          return { ...message, status: 'sent' as const };
        })
      );

      return messagesWithStatus.reverse();
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

    const { data: message, error: messageError } = await supabase
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

    if (messageError) throw messageError;

    // Marquer le message comme envoyé pour tous les participants
    const { data: participants } = await supabase
      .from('chat_participants')
      .select('user_id')
      .eq('conversation_id', conversationId)
      .neq('user_id', user.id);

    if (participants) {
      const statusInserts = participants.map(p => ({
        message_id: message.id,
        user_id: p.user_id,
        status: 'delivered' as const
      }));

      await supabase
        .from('message_status')
        .insert(statusInserts);
    }

    // Mettre à jour la conversation
    await supabase
      .from('chat_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    await supabase
      .from('message_status')
      .update({ status: 'read' })
      .eq('message_id', messageId)
      .eq('user_id', user.id);
  }

  async addReaction(messageId: string, emoji: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    await supabase
      .from('message_reactions')
      .insert({
        message_id: messageId,
        user_id: user.id,
        emoji
      });
  }

  async removeReaction(messageId: string, emoji: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    await supabase
      .from('message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji);
  }

  // Gestion des appels
  async startCall(conversationId: string, callType: ChatCall['call_type']): Promise<string> {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data: call, error } = await supabase
      .from('chat_calls')
      .insert({
        conversation_id: conversationId,
        caller_id: user.id,
        call_type: callType
      })
      .select()
      .single();

    if (error) throw error;

    return call.id;
  }

  async endCall(callId: string): Promise<void> {
    await supabase
      .from('chat_calls')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString()
      })
      .eq('id', callId);
  }

  // Fonctions utilitaires privées
  private async getLastMessage(conversationId: string): Promise<ChatMessage | undefined> {
    const { data } = await supabase
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
      .limit(1)
      .single();

    return data || undefined;
  }

  private async getUnreadCount(conversationId: string): Promise<number> {
    const user = await getCurrentUser();
    if (!user) return 0;

    const { data: participant } = await supabase
      .from('chat_participants')
      .select('last_read_at')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (!participant) return 0;

    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id)
      .gt('sent_at', participant.last_read_at);

    return count || 0;
  }

  // Recherche d'utilisateurs
  async searchUsers(query: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, username, full_name, avatar_url')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(20);

    if (error) throw error;
    return data || [];
  }
}

export const chatService = new ChatService();
