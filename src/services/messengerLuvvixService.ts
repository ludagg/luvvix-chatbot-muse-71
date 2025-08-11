
import { supabase } from "@/integrations/supabase/client";

export interface MessengerMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  media_url?: string | null;
  delivery_status?: string | null;
  created_at: string;
  // Vous pouvez enrichir selon votre schéma (media_metadata, updated_at, etc.)
}

export const messengerLuvvixService = {
  async getOrCreateDirectConversation(targetUserId: string): Promise<string> {
    console.log("[MessengerService] getOrCreateDirectConversation", targetUserId);
    const { data, error } = await supabase.rpc("messenger_luvvix_get_or_create_direct_conversation", {
      target_user_id: targetUserId,
    });

    if (error) {
      console.error("[MessengerService] RPC get_or_create error:", error);
      throw error;
    }
    console.log("[MessengerService] conversation id:", data);
    return data as string;
  },

  async sendMessage(params: {
    conversationId: string;
    content: string;
    messageType?: string;
    mediaUrl?: string | null;
    mediaMetadata?: Record<string, any>;
  }): Promise<string> {
    const { conversationId, content, messageType = "text", mediaUrl = null, mediaMetadata = {} } = params;
    console.log("[MessengerService] sendMessage", { conversationId, content, messageType });

    const { data, error } = await supabase.rpc("messenger_luvvix_send_message", {
      p_conversation_id: conversationId,
      p_content: content,
      p_message_type: messageType,
      p_media_url: mediaUrl,
      p_media_metadata: mediaMetadata,
    });

    if (error) {
      console.error("[MessengerService] RPC send_message error:", error);
      throw error;
    }
    console.log("[MessengerService] message id:", data);
    return data as string;
  },

  async fetchMessages(conversationId: string): Promise<MessengerMessage[]> {
    console.log("[MessengerService] fetchMessages", conversationId);
    const { data, error } = await supabase
      .from("messenger_luvvix_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("[MessengerService] fetchMessages error:", error);
      throw error;
    }
    return (data || []) as MessengerMessage[];
  },
};
