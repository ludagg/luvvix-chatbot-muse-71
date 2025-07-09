
import { useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/use-notifications';
import { useWeather, WeatherData } from '@/hooks/use-weather';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useWeatherNotifications = () => {
  const { sendNotification, notificationsEnabled } = useNotifications();
  const { weatherData } = useWeather();
  const { user } = useAuth();
  const [lastWeatherCheck, setLastWeatherCheck] = useState<string | null>(null);

  // Vérifier les alertes pluie toutes les 15 minutes
  useEffect(() => {
    if (!weatherData || !notificationsEnabled || !user) return;

    const checkWeatherAlerts = async () => {
      const currentCondition = weatherData.current.condition.toLowerCase();
      const isRaining = currentCondition.includes('pluie') || 
                       currentCondition.includes('averse') || 
                       currentCondition.includes('bruine');

      // Clé unique pour éviter les notifications répétées
      const weatherKey = `${weatherData.location.name}-${weatherData.current.condition}-${new Date().getHours()}`;
      
      if (weatherKey === lastWeatherCheck) return;
      setLastWeatherCheck(weatherKey);

      // Notification début de pluie
      if (isRaining) {
        await sendNotification('🌧️ Il pleut actuellement', {
          body: `Pluie détectée à ${weatherData.location.name}. Prenez un parapluie !`,
          tag: 'current-rain',
          icon: '/weather-icons/rain.png'
        });

        console.log('☔ Notification pluie envoyée');
      }

      // Vérifier la prévision pluie dans l'heure
      if (weatherData.hourly && weatherData.hourly.length > 1) {
        const nextHour = weatherData.hourly[1];
        const willRain = nextHour && nextHour.condition.toLowerCase().includes('pluie');
        
        if (willRain && !isRaining) {
          await sendNotification('🌦️ Pluie prévue dans 1h', {
            body: `${nextHour.condition} prévu vers ${nextHour.time}`,
            tag: 'rain-forecast'
          });

          console.log('🌦️ Notification prévision pluie envoyée');
        }
      }

      // Température extrême
      if (weatherData.current.temperature < 0) {
        await sendNotification('🥶 Alerte gel', {
          body: `${weatherData.current.temperature}°C à ${weatherData.location.name}. Attention au verglas !`,
          tag: 'freeze-alert'
        });
      } else if (weatherData.current.temperature > 30) {
        await sendNotification('🌡️ Forte chaleur', {
          body: `${weatherData.current.temperature}°C à ${weatherData.location.name}. Hydratez-vous !`,
          tag: 'heat-alert'
        });
      }
    };

    // Vérification immédiate puis toutes les 15 minutes
    checkWeatherAlerts();
    const interval = setInterval(checkWeatherAlerts, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [weatherData, notificationsEnabled, user, lastWeatherCheck]);

  // Charger le briefing météo matinal
  const loadMorningBriefing = async () => {
    if (!user) return null;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_weather_briefings')
        .select('*')
        .eq('user_id', user.id)
        .gte('sent_at', `${today}T00:00:00.000Z`)
        .lt('sent_at', `${today}T23:59:59.999Z`)
        .order('sent_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Erreur chargement briefing météo:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Erreur:', error);
      return null;
    }
  };

  return {
    loadMorningBriefing
  };
};
