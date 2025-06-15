import React, { useState } from 'react';
import { Heart, MessageCircle, UserPlus, Repeat2, AtSign, Calendar, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";
// Ajout : Récupération auto des notifications table Supabase (type : mention)
interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'retweet' | 'mention' | 'reminder' | 'achievement';
  user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  content?: string;
  post_id?: string;
  created_at: string;
  is_read: boolean;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}
const NotificationCenter = () => {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  React.useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('center_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25);
      setNotifications(data ?? []);
    })();
  }, []);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow': return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'retweet': return <Repeat2 className="w-5 h-5 text-green-500" />;
      case 'mention': return <AtSign className="w-5 h-5 text-blue-500" />;
      case 'reminder': return <Calendar className="w-5 h-5 text-orange-500" />;
      case 'achievement': return <Gift className="w-5 h-5 text-purple-500" />;
      default: return <Heart className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'like':
        return `${notification.user.full_name} a aimé votre post`;
      case 'comment':
        return `${notification.user.full_name} a commenté votre post`;
      case 'follow':
        return `${notification.user.full_name} vous suit maintenant`;
      case 'retweet':
        return `${notification.user.full_name} a retweeté votre post`;
      case 'mention':
        return `${notification.user.full_name} vous a mentionné`;
      case 'reminder':
        return `Rappel : ${notification.content}`;
      case 'achievement':
        return `Félicitations ! ${notification.content}`;
      default:
        return notification.content || 'Nouvelle notification';
    }
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <button 
              onClick={() => {}}
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
            Toutes
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`pb-2 border-b-2 font-medium text-sm transition-colors relative ${
              filter === 'unread'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            Non lues
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="divide-y divide-gray-100">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Heart className="w-8 h-8 text-gray-400" />
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
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                !notification.is_read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
              onClick={() => {}}
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
                    {format(new Date(notification.created_at), 'dd MMM à HH:mm', { locale: fr })}
                  </p>
                </div>
                
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
