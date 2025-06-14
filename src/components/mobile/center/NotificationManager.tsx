
import React, { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Users, Eye, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  id: string;
  user_id: string;
  actor_id?: string;
  type: 'like' | 'comment' | 'follow' | 'group_invite' | 'group_join' | 'story_view' | 'mention';
  entity_type?: 'post' | 'comment' | 'story' | 'group';
  entity_id?: string;
  message?: string;
  is_read: boolean;
  created_at: string;
  actor_profile?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface NotificationManagerProps {
  onClose: () => void;
}

const NotificationManager = ({ onClose }: NotificationManagerProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('center_notifications')
        .select(`
          *,
          actor_profile:user_profiles!center_notifications_actor_id_fkey(username, full_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('center_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('center_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      
      toast({
        title: "Notifications marquées comme lues",
        description: "Toutes vos notifications ont été marquées comme lues"
      });
    } catch (error) {
      console.error('Erreur marquage notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow': return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'group_invite': 
      case 'group_join': return <Users className="w-5 h-5 text-purple-500" />;
      case 'story_view': return <Eye className="w-5 h-5 text-orange-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const actorName = notification.actor_profile?.full_name || 'Quelqu\'un';
    
    switch (notification.type) {
      case 'like':
        return `${actorName} a aimé votre post`;
      case 'comment':
        return `${actorName} a commenté votre post`;
      case 'follow':
        return `${actorName} vous suit maintenant`;
      case 'group_invite':
        return `${actorName} vous a invité à rejoindre un groupe`;
      case 'group_join':
        return `${actorName} a rejoint votre groupe`;
      case 'story_view':
        return `${actorName} a vu votre story`;
      default:
        return notification.message || 'Nouvelle notification';
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Real-time notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'center_notifications',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead}
              className="text-blue-500 text-sm font-medium"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
        
        {/* Filter tabs */}
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
              filter === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`pb-2 border-b-2 font-medium text-sm transition-colors relative ${
              filter === 'unread'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            Non lues ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {filter === 'unread' ? 'Aucune nouvelle notification' : 'Aucune notification'}
            </h3>
            <p className="text-gray-500 text-sm">
              {filter === 'unread' 
                ? 'Toutes vos notifications sont à jour !' 
                : 'Vous recevrez ici toutes vos notifications'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.is_read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      {getNotificationText(notification)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </div>
                  
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationManager;
