import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export const useNotifications = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  });

  useEffect(() => {
    // Améliorer la détection de compatibilité
    const checkSupport = () => {
      // Vérifier les notifications web dans le navigateur
      const browserSupport = 'Notification' in window;
      
      // Vérifier Capacitor (pour mobile)
      const capacitorSupport = !!(window as any).Capacitor;
      
      // Support si l'un des deux est disponible
      const isSupported = browserSupport || capacitorSupport;
      
      console.log('Détection support notifications:', {
        browserSupport,
        capacitorSupport,
        isSupported,
        userAgent: navigator.userAgent
      });
      
      return isSupported;
    };

    const supported = checkSupport();
    setNotificationsSupported(supported);
    
    // Si supporté et que nous avons l'API Notification, vérifier les permissions
    if (supported && 'Notification' in window) {
      const currentPermission = Notification.permission;
      const permissionState = {
        granted: currentPermission === 'granted',
        denied: currentPermission === 'denied',
        default: currentPermission === 'default'
      };
      
      setPermission(permissionState);
      setNotificationsEnabled(permissionState.granted);
      
      // Marquer comme demandé si déjà refusé ou accordé
      if (currentPermission !== 'default') {
        setPermissionRequested(true);
      }
    } else if (supported && (window as any).Capacitor) {
      // Pour Capacitor, on part du principe que c'est supporté
      // Les permissions seront vérifiées lors de la demande
      console.log('Capacitor détecté, notifications supportées');
    }
  }, []);

  const requestPermission = async () => {
    console.log('Demande de permission - État actuel:', {
      notificationsSupported,
      permissionRequested,
      permission
    });

    if (!notificationsSupported) {
      console.error('Notifications non supportées détectées incorrectement');
      toast.error("Les notifications ne sont pas supportées sur cet appareil");
      return false;
    }

    // Éviter les demandes répétées seulement si explicitement refusées
    if (permissionRequested && permission.denied) {
      toast.error("Notifications refusées. Activez-les dans les paramètres de votre navigateur.");
      return false;
    }

    if (permission.granted) {
      toast.success("Les notifications sont déjà activées");
      return true;
    }

    try {
      setPermissionRequested(true);
      
      // Gestion Capacitor avec vérification de disponibilité
      if ((window as any).Capacitor && (window as any).Capacitor.isNativePlatform) {
        try {
          // Import dynamique seulement si on est sur une plateforme native
          const capacitorModule = await import('@capacitor/local-notifications');
          const { LocalNotifications } = capacitorModule;
          const result = await LocalNotifications.requestPermissions();
          const granted = result.display === 'granted';
          
          setPermission({
            granted,
            denied: !granted,
            default: false
          });
          setNotificationsEnabled(granted);
          
          if (granted) {
            toast.success("Notifications activées avec succès");
          } else {
            toast.error("Notifications refusées");
          }
          
          return granted;
        } catch (error) {
          console.error('Erreur Capacitor notifications:', error);
          // Fallback vers les notifications web si Capacitor échoue
        }
      }
      
      // Gestion navigateur standard
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        const granted = permission === 'granted';
        
        setPermission({
          granted,
          denied: permission === 'denied',
          default: permission === 'default'
        });
        setNotificationsEnabled(granted);

        if (granted) {
          toast.success("Notifications activées avec succès");
        } else {
          toast.error("Notifications refusées");
        }

        return granted;
      }
      
      // Si on arrive ici, il y a un problème de détection
      console.error('Aucune méthode de notification disponible');
      toast.error("Erreur: méthode de notification introuvable");
      return false;
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      toast.error("Erreur lors de l'activation des notifications");
      return false;
    }
  };

  const sendNotification = async (title: string, options?: NotificationOptions) => {
    if (!notificationsEnabled) {
      console.log('Notifications désactivées');
      return false;
    }

    try {
      // Gestion Capacitor avec vérification de disponibilité
      if ((window as any).Capacitor && (window as any).Capacitor.isNativePlatform) {
        try {
          // Import dynamique seulement si on est sur une plateforme native
          const capacitorModule = await import('@capacitor/local-notifications');
          const { LocalNotifications } = capacitorModule;
          await LocalNotifications.schedule({
            notifications: [{
              title,
              body: options?.body || '',
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 1000) },
              sound: undefined,
              attachments: undefined,
              actionTypeId: "",
              extra: null
            }]
          });
          return true;
        } catch (error) {
          console.error('Erreur Capacitor sendNotification:', error);
          // Fallback vers les notifications web si Capacitor échoue
        }
      }
      
      // Gestion navigateur standard
      if ('Notification' in window) {
        new Notification(title, {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          ...options
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur envoi notification:', error);
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
    return isExtreme;
  };

  const sendCalendarReminder = (event: { title: string; time: string }) => {
    if (!notificationsEnabled) return false;

    sendNotification(`Rappel: ${event.title}`, {
      body: `Événement prévu à ${event.time}`,
      tag: 'calendar-reminder'
    });
    return true;
  };

  const sendTranslationComplete = (sourceText: string, translatedText: string) => {
    if (!notificationsEnabled) return false;

    sendNotification('Traduction terminée', {
      body: `"${sourceText.substring(0, 30)}..." traduit`,
      tag: 'translation-complete'
    });
    return true;
  };

  return {
    notificationsEnabled,
    notificationsSupported,
    permissionRequested,
    permission,
    requestPermission,
    sendNotification,
    sendWeatherAlert,
    sendCalendarReminder,
    sendTranslationComplete,
  };
};
