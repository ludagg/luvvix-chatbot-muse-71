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
    // Détection robuste et fiable
    const detectSupport = () => {
      // Vérification navigateur standard
      const browserNotifications = 'Notification' in window && typeof Notification !== 'undefined';
      
      // Vérification Capacitor
      const capacitorAvailable = !!(window as any).Capacitor;
      
      // Support si au moins une méthode existe
      const hasSupport = browserNotifications || capacitorAvailable;
      
      console.log('🔔 Détection notifications:', {
        browser: browserNotifications,
        capacitor: capacitorAvailable,
        supported: hasSupport,
        userAgent: navigator.userAgent.substring(0, 50)
      });
      
      return hasSupport;
    };

    const isSupported = detectSupport();
    
    // Marquer TOUJOURS comme supporté si détection positive
    setNotificationsSupported(isSupported);
    
    // Gérer les permissions uniquement si supporté
    if (isSupported && 'Notification' in window) {
      try {
        const currentPermission = Notification.permission;
        const permissionState = {
          granted: currentPermission === 'granted',
          denied: currentPermission === 'denied',
          default: currentPermission === 'default'
        };
        
        setPermission(permissionState);
        setNotificationsEnabled(permissionState.granted);
        
        if (currentPermission !== 'default') {
          setPermissionRequested(true);
        }
        
        console.log('✅ Permissions configurées:', permissionState);
      } catch (error) {
        console.error('Erreur permissions:', error);
      }
    }
  }, []);

  const requestPermission = async () => {
    console.log('🚀 Demande permission - État:', { notificationsSupported, permission });
    
    // Vérification stricte du support
    if (!notificationsSupported) {
      console.error('❌ Notifications réellement non supportées');
      toast.error("Votre appareil ne supporte pas les notifications");
      return false;
    }

    // Éviter les demandes répétées
    if (permissionRequested && permission.denied) {
      toast.error("Notifications refusées. Réactivez-les dans les paramètres.");
      return false;
    }

    if (permission.granted) {
      toast.success("Notifications déjà activées !");
      return true;
    }

    try {
      setPermissionRequested(true);
      
      // Essayer Capacitor en premier sur mobile
      if ((window as any).Capacitor && (window as any).Capacitor.isNativePlatform) {
        try {
          console.log('📱 Tentative Capacitor...');
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
          
          const message = granted ? "✅ Notifications mobiles activées" : "❌ Notifications refusées";
          granted ? toast.success(message) : toast.error(message);
          
          return granted;
        } catch (capacitorError) {
          console.warn('⚠️ Capacitor échec, fallback navigateur:', capacitorError);
        }
      }
      
      // Fallback navigateur standard
      if ('Notification' in window) {
        console.log('🌐 Tentative navigateur...');
        const permission = await Notification.requestPermission();
        const granted = permission === 'granted';
        
        setPermission({
          granted,
          denied: permission === 'denied',
          default: permission === 'default'
        });
        setNotificationsEnabled(granted);

        const message = granted ? "✅ Notifications navigateur activées" : "❌ Notifications refusées";
        granted ? toast.success(message) : toast.error(message);

        return granted;
      }
      
      // Aucune méthode disponible
      console.error('❌ Aucune méthode de notification trouvée');
      toast.error("Impossible d'activer les notifications");
      return false;
      
    } catch (error) {
      console.error('💥 Erreur demande permission:', error);
      toast.error("Erreur lors de l'activation des notifications");
      return false;
    }
  };

  const sendNotification = async (title: string, options?: NotificationOptions) => {
    if (!notificationsEnabled) {
      console.log('🔕 Notifications désactivées');
      return false;
    }

    try {
      // Méthode Capacitor en priorité
      if ((window as any).Capacitor && (window as any).Capacitor.isNativePlatform) {
        try {
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
          console.log('📱 Notification Capacitor envoyée');
          return true;
        } catch (error) {
          console.warn('⚠️ Capacitor notification échec:', error);
        }
      }
      
      // Fallback navigateur
      if ('Notification' in window) {
        new Notification(title, {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          ...options
        });
        console.log('🌐 Notification navigateur envoyée');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('💥 Erreur envoi notification:', error);
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
