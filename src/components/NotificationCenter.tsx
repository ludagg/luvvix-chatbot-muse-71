
import { useState, useEffect } from "react";
import { Bell, Check, Trash, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  timestamp: number;
  read: boolean;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Load existing notifications from localStorage on component mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications);
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.filter((n: Notification) => !n.read).length);
    }

    // Simulate a welcome notification if no notifications exist
    const timer = setTimeout(() => {
      if (notifications.length < 1) {
        addNotification({
          title: "Bienvenue sur LuvviX",
          message: "Découvrez toutes les nouvelles fonctionnalités de l'application.",
          type: "info"
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Update localStorage and unread count when notifications change
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const addNotification = ({ 
    title, 
    message, 
    type = "info" 
  }: {
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "error";
  }) => {
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      message,
      type,
      timestamp: Date.now(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Also show a toast for new notifications
    toast({
      title,
      description: message,
      variant: type === "error" ? "destructive" : "default"
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const formatTime = (timestamp: number) => {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min`;
    } else if (diffHours < 24) {
      return `${diffHours} h`;
    } else {
      return `${diffDays} j`;
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "warning":
        return <Badge variant="outline" className="h-6 w-6 rounded-full p-1 border-yellow-500 bg-yellow-500/10"><Info className="h-4 w-4 text-yellow-500" /></Badge>;
      case "success":
        return <Badge variant="outline" className="h-6 w-6 rounded-full p-1 border-green-500 bg-green-500/10"><Check className="h-4 w-4 text-green-500" /></Badge>;
      case "error":
        return <Badge variant="destructive" className="h-6 w-6 rounded-full p-1"><X className="h-4 w-4" /></Badge>;
      default:
        return <Badge variant="secondary" className="h-6 w-6 rounded-full p-1"><Info className="h-4 w-4" /></Badge>;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-[1rem] px-1 flex items-center justify-center text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" alignOffset={-5} className="w-[320px] p-0 rounded-xl border-border/30">
        <div className="flex items-center justify-between border-b border-border/10 p-3">
          <h3 className="font-medium text-sm">Notifications</h3>
          <div className="flex gap-1">
            {notifications.length > 0 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-full" 
                  onClick={markAllAsRead}
                >
                  <Check className="h-3.5 w-3.5" />
                  <span className="sr-only">Tout marquer comme lu</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-full" 
                  onClick={clearAllNotifications}
                >
                  <Trash className="h-3.5 w-3.5" />
                  <span className="sr-only">Tout supprimer</span>
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-full" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Fermer</span>
            </Button>
          </div>
        </div>
        <div className="max-h-[70vh] overflow-y-auto">
          <AnimatePresence>
            {notifications.length > 0 ? (
              <div className="py-1">
                {notifications.map(notification => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "px-3 py-2 hover:bg-muted/50 transition-colors",
                      !notification.read && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{notification.title}</h4>
                          <span className="text-[10px] text-muted-foreground ml-2 whitespace-nowrap">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                      </div>
                      
                      <div className="flex flex-col gap-1 ml-1 flex-shrink-0">
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 rounded-full" 
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3" />
                            <span className="sr-only">Marquer comme lu</span>
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 rounded-full" 
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash className="h-3 w-3" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                  <Bell className="h-6 w-6 text-muted-foreground/70" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Aucune notification
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Les notifications apparaîtront ici
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  );
}
