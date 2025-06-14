
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Heart, MessageCircle, Users, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface NotificationManagerProps {
  onClose: () => void;
}

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
    full_name?: string;
    avatar_url?: string;
  };
}

const NotificationManager = ({ onClose }: NotificationManagerProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('center_notifications')
        .select(`
          *,
          actor_profile:user_profiles!actor_id(username, full_name, avatar_url)
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
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Erreur marquage lecture:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('center_notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (error) {
      console.error('Erreur marquage toutes lues:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'group_invite':
      case 'group_join':
        return <Users className="w-5 h-5 text-purple-500" />;
      case 'story_view':
        return <Bell className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationMessage = (notification: Notification) => {
    const actorName = notification.actor_profile?.full_name || 
                    notification.actor_profile?.username || 
                    'Quelqu\'un';

    switch (notification.type) {
      case 'like':
        return `${actorName} a aimé votre publication`;
      case 'comment':
        return `${actorName} a commenté votre publication`;
      case 'follow':
        return `${actorName} a commencé à vous suivre`;
      case 'group_invite':
        return `${actorName} vous a invité à rejoindre un groupe`;
      case 'group_join':
        return `${actorName} a rejoint votre groupe`;
      case 'story_view':
        return `${actorName} a vu votre story`;
      case 'mention':
        return `${actorName} vous a mentionné`;
      default:
        return notification.message || 'Nouvelle notification';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-blue-600 text-sm font-medium hover:text-blue-800"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Aucune notification
            </h3>
            <p className="text-gray-500 text-sm">
              Vous n'avez aucune notification pour le moment
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  !notification.is_read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {notification.actor_profile ? (
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {notification.actor_profile.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''}`}>
                          {getNotificationMessage(notification)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-2">
                        {getNotificationIcon(notification.type)}
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
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
