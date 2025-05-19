
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseNotificationsResult {
  notificationsSupported: boolean;
  notificationsEnabled: boolean;
  requestPermission: () => Promise<void>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
}

export function useNotifications(): UseNotificationsResult {
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the browser supports notifications
    if ("Notification" in window) {
      setNotificationsSupported(true);
      
      // Check if permission is already granted
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  const requestPermission = async () => {
    if (!notificationsSupported) {
      toast({
        title: "Erreur",
        description: "Votre navigateur ne supporte pas les notifications.",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        setNotificationsEnabled(true);
        toast({
          title: "Notifications activées",
          description: "Vous recevrez des notifications pour les événements importants.",
        });
      } else {
        toast({
          title: "Notifications désactivées",
          description: "Vous ne recevrez pas de notifications.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la demande d'autorisation de notification:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'activer les notifications.",
        variant: "destructive",
      });
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (notificationsSupported && notificationsEnabled) {
      try {
        new Notification(title, options);
      } catch (error) {
        console.error("Erreur lors de l'envoi de la notification:", error);
      }
    }
  };

  return {
    notificationsSupported,
    notificationsEnabled,
    requestPermission,
    sendNotification,
  };
}
