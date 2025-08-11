
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { messengerLuvvixService, MessengerMessage } from "@/services/messengerLuvvixService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type UseDirectChatReturn = {
  conversationId: string | null;
  messages: MessengerMessage[];
  loading: boolean;
  startChat: (targetUserId: string) => Promise<void>;
  send: (text: string) => Promise<void>;
  refetch: () => Promise<void>;
};

export function useDirectChat(): UseDirectChatReturn {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessengerMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const subscriptionRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const canOperate = useMemo(() => !!user, [user]);

  const subscribeRealtime = (convId: string) => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    const channel = supabase
      .channel(`messenger:${convId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messenger_luvvix_messages",
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          console.log("[useDirectChat] Realtime INSERT", payload);
          const newMsg = payload.new as MessengerMessage;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe((status) => {
        console.log("[useDirectChat] subscription status:", status);
      });

    subscriptionRef.current = channel;
  };

  const refetch = async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const data = await messengerLuvvixService.fetchMessages(conversationId);
      setMessages(data);
    } catch (err: any) {
      console.error("[useDirectChat] refetch error:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err?.message || "Impossible de charger les messages",
      });
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (targetUserId: string) => {
    if (!canOperate) {
      toast({
        variant: "destructive",
        title: "Connexion requise",
        description: "Veuillez vous connecter pour démarrer une conversation.",
      });
      return;
    }

    setLoading(true);
    try {
      const convId = await messengerLuvvixService.getOrCreateDirectConversation(targetUserId);
      setConversationId(convId);
      subscribeRealtime(convId);
      const data = await messengerLuvvixService.fetchMessages(convId);
      setMessages(data);
      toast({
        title: "Conversation prête",
        description: "Vous pouvez maintenant envoyer des messages.",
      });
    } catch (err: any) {
      console.error("[useDirectChat] startChat error:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err?.message || "Impossible de démarrer la conversation",
      });
    } finally {
      setLoading(false);
    }
  };

  const send = async (text: string) => {
    if (!conversationId || !text.trim()) return;
    try {
      await messengerLuvvixService.sendMessage({
        conversationId,
        content: text.trim(),
      });
      // Le temps réel ajoutera le message, mais on peut aussi rafraîchir rapidement
      // await refetch();
    } catch (err: any) {
      console.error("[useDirectChat] send error:", err);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: err?.message || "Impossible d'envoyer le message",
      });
    }
  };

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);

  return {
    conversationId,
    messages,
    loading,
    startChat,
    send,
    refetch,
  };
}
