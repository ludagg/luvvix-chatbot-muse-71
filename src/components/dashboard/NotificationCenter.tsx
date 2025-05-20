
import React, { useState, useEffect } from "react";
import { Bell, X, Settings, Check } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/use-notifications";

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { notificationsSupported, notificationsEnabled, requestPermission } = useNotifications();

  // Demo notifications pour la présentation
  useEffect(() => {
    const demoNotifications: Notification[] = [
      {
        id: "1",
        title: "Bienvenue sur LuvviX Dashboard",
        message: "Découvrez toutes les nouvelles fonctionnalités disponibles.",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        isRead: false,
        type: 'info'
      },
      {
        id: "2",
        title: "Mise à jour du système",
        message: "Une nouvelle mise à jour est disponible. Cliquez pour l'installer.",
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        isRead: false,
        type: 'success'
      },
      {
        id: "3",
        title: "Alerte de sécurité",
        message: "Une connexion inhabituelle a été détectée sur votre compte.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        isRead: true,
        type: 'warning'
      }
    ];

    setNotifications(demoNotifications);
    setHasUnread(demoNotifications.some(notification => !notification.isRead));
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
    
    // Vérifier s'il y a encore des notifications non lues
    const stillHasUnread = notifications.some(
      notification => notification.id !== id && !notification.isRead
    );
    setHasUnread(stillHasUnread);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    setHasUnread(false);
    toast({
      title: "Notifications",
      description: "Toutes les notifications ont été marquées comme lues."
    });
  };

  const removeNotification = (id: string) => {
    const newNotifications = notifications.filter(notification => notification.id !== id);
    setNotifications(newNotifications);
    
    // Vérifier s'il y a encore des notifications non lues
    const stillHasUnread = newNotifications.some(notification => !notification.isRead);
    setHasUnread(stillHasUnread);
  };
  
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (60 * 1000));
    
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    
    return date.toLocaleDateString('fr-FR');
  };
  
  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative bg-slate-800/50 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/50 rounded-xl"
          >
            <Bell className="h-5 w-5" />
            {hasUnread && (
              <span className="absolute top-0 right-0 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-80 bg-slate-800 border border-slate-700 shadow-xl rounded-xl backdrop-blur-lg"
          align="end"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
            <h5 className="text-sm font-medium text-slate-200">Notifications</h5>
            <div className="flex space-x-1">
              {hasUnread && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                  onClick={markAllAsRead}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {notifications.length > 0 ? (
            <div className="overflow-hidden max-h-[60vh] overflow-y-auto scrollbar-thin">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`relative p-3 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${!notification.isRead ? 'bg-slate-700/20' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-1.5 rounded-full ${getNotificationColor(notification.type)}`} />
                    <div className="flex-1" onClick={() => markAsRead(notification.id)}>
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-medium ${!notification.isRead ? 'text-white' : 'text-slate-300'}`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-slate-500">{formatTime(notification.timestamp)}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{notification.message}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400">
              <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-full bg-slate-700/50 mb-3">
                <Bell className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm">Aucune notification</p>
              <p className="text-xs mt-1">Vous serez informé des événements importants ici</p>
            </div>
          )}
          
          <DropdownMenuSeparator className="bg-slate-700" />
          
          {!notificationsEnabled && notificationsSupported && (
            <div className="p-3 border-t border-slate-700 bg-slate-800/80">
              <p className="text-xs text-slate-400 mb-2">Activez les notifications pour recevoir des alertes même lorsque vous n'êtes pas sur l'application</p>
              <Button 
                size="sm" 
                variant="outline"
                className="w-full text-xs border-slate-600 hover:bg-slate-700 text-slate-300"
                onClick={requestPermission}
              >
                Activer les notifications
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default NotificationCenter;
