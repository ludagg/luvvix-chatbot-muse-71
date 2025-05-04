
import { useState, useEffect } from "react";
import { Bell, Check, Trash, X } from "lucide-react";
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

  // Simulation de la réception de notifications (à connecter à un service réel dans une implémentation complète)
  useEffect(() => {
    // Charger les notifications existantes depuis le localStorage
    const savedNotifications = localStorage.getItem("notifications");
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications);
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.filter((n: Notification) => !n.read).length);
    }

    // Simuler l'arrivée d'une notification après un délai
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

  // Mettre à jour le stockage local à chaque changement de notifications
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
    
    // Afficher également un toast pour les nouvelles notifications
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
      return `Il y a ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} h`;
    } else {
      return `Il y a ${diffDays} j`;
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "warning":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "success":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "error":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
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
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] px-1"
            >
              {unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b p-3">
          <h3 className="font-medium">Notifications</h3>
          <div className="flex gap-1">
            {notifications.length > 0 && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={markAllAsRead}
                >
                  <Check className="h-3.5 w-3.5" />
                  <span className="sr-only">Marquer tout comme lu</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={clearAllNotifications}
                >
                  <Trash className="h-3.5 w-3.5" />
                  <span className="sr-only">Supprimer tout</span>
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Fermer</span>
            </Button>
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          <AnimatePresence>
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "p-3 border-b relative",
                    !notification.read && "bg-muted/50"
                  )}
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span 
                          className={cn(
                            "inline-block w-2 h-2 rounded-full mr-2",
                            notification.type === "info" && "bg-blue-500",
                            notification.type === "warning" && "bg-yellow-500",
                            notification.type === "success" && "bg-green-500",
                            notification.type === "error" && "bg-red-500"
                          )}
                        />
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 ml-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => markAsRead(notification.id)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="p-8 text-center">
                <p className="text-muted-foreground text-sm">
                  Aucune notification
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </PopoverContent>
    </Popover>
  );
}
