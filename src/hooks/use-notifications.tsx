
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export const useNotifications = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  });

  useEffect(() => {
    const supported = 'Notification' in window;
    setNotificationsSupported(supported);
    
    if (supported) {
      const currentPermission = Notification.permission;
      setPermission({
        granted: currentPermission === 'granted',
        denied: currentPermission === 'denied',
        default: currentPermission === 'default'
      });
      setNotificationsEnabled(currentPermission === 'granted');
    }
  }, []);

  const requestPermission = async () => {
    if (!notificationsSupported) {
      toast({
        title: "Non supporté",
        description: "Les notifications ne sont pas supportées sur ce navigateur",
        variant: "destructive"
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      
      setPermission({
        granted,
        denied: permission === 'denied',
        default: permission === 'default'
      });
      setNotificationsEnabled(granted);

      if (granted) {
        toast({
          title: "Notifications activées",
          description: "Vous recevrez désormais les notifications importantes",
        });
      } else {
        toast({
          title: "Notifications refusées",
          description: "Vous pouvez les activer plus tard dans les paramètres du navigateur",
          variant: "destructive"
        });
      }

      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!notificationsEnabled) return false;

    try {
      new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        ...options
      });
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  };

  const sendWeatherAlert = (weather: { temperature: number; condition: string; location: string }) => {
    if (!notificationsEnabled) return false;

    const isExtreme = weather.temperature < 0 || weather.temperature > 35;
    if (isExtreme) {
      sendNotification(`Alerte météo à ${weather.location}`, {
        body: `${weather.temperature}°C - ${weather.condition}`,
        tag: 'weather-alert'
      });
    }
  };

  const sendCalendarReminder = (event: { title: string; time: string }) => {
    if (!notificationsEnabled) return false;

    sendNotification(`Rappel: ${event.title}`, {
      body: `Événement prévu à ${event.time}`,
      tag: 'calendar-reminder'
    });
  };

  const sendTranslationComplete = (sourceText: string, translatedText: string) => {
    if (!notificationsEnabled) return false;

    sendNotification('Traduction terminée', {
      body: `"${sourceText}" → "${translatedText}"`,
      tag: 'translation-complete'
    });
  };

  return {
    notificationsEnabled,
    notificationsSupported,
    permission,
    requestPermission,
    sendNotification,
    sendWeatherAlert,
    sendCalendarReminder,
    sendTranslationComplete,
  };
};
