
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/services/auth-utils';

export interface MessengerUser {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  last_seen: string;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  participants?: Participant[];
  last_message?: Message;
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
  is_pinned: boolean;
  user?: MessengerUser;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'voice_note' | 'sticker' | 'emoji_reaction';
  media_url?: string;
  media_metadata: Record<string, any>;
  reply_to_message_id?: string;
  is_edited: boolean;
  is_deleted: boolean;
  delivery_status: 'sent' | 'delivered' | 'read';
  created_at: string;
  updated_at: string;
  sender?: MessengerUser;
  reactions?: MessageReaction[];
  reply_to?: Message;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: MessengerUser;
}

export interface Call {
  id: string;
  conversation_id: string;
  caller_id: string;
  call_type: 'voice' | 'video';
  status: 'calling' | 'ringing' | 'active' | 'ended' | 'missed' | 'declined';
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  participants: any[];
}

export class MessengerLuvvixService {
  // Gestion des utilisateurs
  static async getCurrentMessengerUser(): Promise<MessengerUser | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('messenger_luvvix_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching messenger user:', error);
      return null;
    }

    return data;
  }

  static async updateUserStatus(status: MessengerUser['status']): Promise<void> {
    const user = await getCurrentUser();
    if (!user) return;

    const { error } = await supabase
      .from('messenger_luvvix_users')
      .update({ 
        status, 
        last_seen: new Date().toISOString() 
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating user status:', error);
    }
  }

  static async searchUsers(query: string): Promise<MessengerUser[]> {
    const { data, error } = await supabase
      .from('messenger_luvvix_users')
      .select('*')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return data || [];
  }

  // Gestion des conversations
  static async getConversations(): Promise<Conversation[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('messenger_luvvix_conversations')
      .select(`
        *,
        participants:messenger_luvvix_participants!inner(
          *,
          user:messenger_luvvix_users(*)
        )
      `)
      .eq('participants.user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    return data || [];
  }

  static async createDirectConversation(otherUserId: string): Promise<Conversation | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    // Vérifier si une conversation directe existe déjà
    const { data: existing } = await supabase
      .from('messenger_luvvix_conversations')
      .select(`
        *,
        participants:messenger_luvvix_participants(user_id)
      `)
      .eq('type', 'direct');

    const existingConv = existing?.find(conv => {
      const userIds = conv.participants.map((p: any) => p.user_id);
      return userIds.includes(user.id) && userIds.includes(otherUserId) && userIds.length === 2;
    });

    if (existingConv) {
      return existingConv;
    }

    // Créer nouvelle conversation
    const { data: conversation, error } = await supabase
      .from('messenger_luvvix_conversations')
      .insert({
        type: 'direct',
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    // Ajouter les participants
    const { error: participantsError } = await supabase
      .from('messenger_luvvix_participants')
      .insert([
        { conversation_id: conversation.id, user_id: user.id, role: 'admin' },
        { conversation_id: conversation.id, user_id: otherUserId, role: 'member' }
      ]);

    if (participantsError) {
      console.error('Error adding participants:', participantsError);
      return null;
    }

    return conversation;
  }

  static async createGroupConversation(name: string, description: string, participantIds: string[]): Promise<Conversation | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data: conversation, error } = await supabase
      .from('messenger_luvvix_conversations')
      .insert({
        type: 'group',
        name,
        description,
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating group:', error);
      return null;
    }

    // Ajouter le créateur comme admin
    const participants = [
      { conversation_id: conversation.id, user_id: user.id, role: 'admin' },
      ...participantIds.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: 'member'
      }))
    ];

    const { error: participantsError } = await supabase
      .from('messenger_luvvix_participants')
      .insert(participants);

    if (participantsError) {
      console.error('Error adding participants:', participantsError);
      return null;
    }

    return conversation;
  }

  // Gestion des messages
  static async getMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messenger_luvvix_messages')
      .select(`
        *,
        sender:messenger_luvvix_users!sender_id(*),
        reactions:messenger_luvvix_message_reactions(*, user:messenger_luvvix_users(*)),
        reply_to:messenger_luvvix_messages!reply_to_message_id(*)
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return (data || []).reverse();
  }

  static async sendMessage(
    conversationId: string,
    content: string,
    messageType: Message['message_type'] = 'text',
    mediaUrl?: string,
    replyToId?: string
  ): Promise<Message | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('messenger_luvvix_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
        message_type: messageType,
        media_url: mediaUrl,
        reply_to_message_id: replyToId
      })
      .select(`
        *,
        sender:messenger_luvvix_users!sender_id(*)
      `)
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return null;
    }

    // Mettre à jour la conversation
    await supabase
      .from('messenger_luvvix_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  }

  static async editMessage(messageId: string, newContent: string): Promise<void> {
    const { error } = await supabase
      .from('messenger_luvvix_messages')
      .update({ 
        content: newContent, 
        is_edited: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (error) {
      console.error('Error editing message:', error);
    }
  }

  static async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messenger_luvvix_messages')
      .update({ 
        is_deleted: true,
        content: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
    }
  }

  // Gestion des réactions
  static async addReaction(messageId: string, emoji: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) return;

    const { error } = await supabase
      .from('messenger_luvvix_message_reactions')
      .insert({
        message_id: messageId,
        user_id: user.id,
        emoji
      });

    if (error) {
      console.error('Error adding reaction:', error);
    }
  }

  static async removeReaction(messageId: string, emoji: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) return;

    const { error } = await supabase
      .from('messenger_luvvix_message_reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji);

    if (error) {
      console.error('Error removing reaction:', error);
    }
  }

  // Gestion des appels
  static async initiateCall(conversationId: string, callType: 'voice' | 'video'): Promise<Call | null> {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('messenger_luvvix_calls')
      .insert({
        conversation_id: conversationId,
        caller_id: user.id,
        call_type: callType,
        status: 'calling'
      })
      .select()
      .single();

    if (error) {
      console.error('Error initiating call:', error);
      return null;
    }

    return data;
  }

  static async updateCallStatus(callId: string, status: Call['status'], duration?: number): Promise<void> {
    const updateData: any = { status };
    
    if (status === 'ended' && duration !== undefined) {
      updateData.ended_at = new Date().toISOString();
      updateData.duration_seconds = duration;
    }

    const { error } = await supabase
      .from('messenger_luvvix_calls')
      .update(updateData)
      .eq('id', callId);

    if (error) {
      console.error('Error updating call status:', error);
    }
  }

  // Gestion du blocage
  static async blockUser(userId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) return;

    const { error } = await supabase
      .from('messenger_luvvix_blocked_users')
      .insert({
        blocker_id: user.id,
        blocked_id: userId
      });

    if (error) {
      console.error('Error blocking user:', error);
    }
  }

  static async unblockUser(userId: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) return;

    const { error } = await supabase
      .from('messenger_luvvix_blocked_users')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', userId);

    if (error) {
      console.error('Error unblocking user:', error);
    }
  }

  static async getBlockedUsers(): Promise<MessengerUser[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('messenger_luvvix_blocked_users')
      .select(`
        blocked:messenger_luvvix_users!blocked_id(*)
      `)
      .eq('blocker_id', user.id);

    if (error) {
      console.error('Error fetching blocked users:', error);
      return [];
    }

    return data?.map(item => item.blocked).filter(Boolean) || [];
  }

  // Upload de fichiers
  static async uploadFile(file: File, conversationId: string): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `conversations/${conversationId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('center-media')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('center-media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error in file upload:', error);
      return null;
    }
  }
}
