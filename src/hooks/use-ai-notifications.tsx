
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AINotification {
  id: string;
  title: string;
  message: string;
  type: string;
  source_service: string;
  data: any;
  read: boolean;
  created_at: string;
}

export const useAINotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AINotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('luvvix-ai-notifications', {
        method: 'GET',
        body: new URLSearchParams({ action: 'get_notifications' })
      });

      if (data?.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: AINotification) => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { data } = await supabase.functions.invoke('luvvix-ai-notifications', {
        method: 'POST',
        body: new URLSearchParams({ 
          action: 'mark_read',
          id: notificationId
        })
      });

      if (data?.success) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const generateSmartNotification = async (context: string, service: string) => {
    if (!user) return;

    try {
      const { data } = await supabase.functions.invoke('luvvix-ai-notifications', {
        method: 'POST',
        body: JSON.stringify({
          action: 'generate_smart_notification',
          context,
          service
        })
      });

      if (data?.success) {
        await fetchNotifications();
        return data.notification;
      }
    } catch (error) {
      console.error('Error generating smart notification:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Set up real-time subscription for notifications
      const subscription = supabase
        .channel('ai_notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchNotifications();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    generateSmartNotification,
    refreshNotifications: fetchNotifications
  };
};
