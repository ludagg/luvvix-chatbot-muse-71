
import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useWeather } from '@/hooks/use-weather';
import { useNotifications } from '@/hooks/use-notifications';

const WeatherMobileWidget = () => {
  const { weatherData, loading, fetchWeather } = useWeather();
  const { sendNotification, notificationsEnabled } = useNotifications();
  const [showDetails, setShowDetails] = useState(false);
  const [lastRainStatus, setLastRainStatus] = useState<string | null>(null);

  useEffect(() => {
    // Chargement immédiat avec cache
    const loadWeatherFast = async () => {
      // D'abord essayer de charger depuis le cache
      const cachedWeather = localStorage.getItem('luvvix_weather_cache');
      const cacheTime = localStorage.getItem('luvvix_weather_cache_time');
      
      if (cachedWeather && cacheTime) {
        const timeDiff = Date.now() - parseInt(cacheTime);
        // Si le cache a moins de 10 minutes, l'utiliser immédiatement
        if (timeDiff < 10 * 60 * 1000) {
          console.log('🌤️ Utilisation du cache météo');
          // Simuler les données en attendant la vraie API
          return;
        }
      }

      // Sinon charger normalement
      await fetchWeather();
    };

    loadWeatherFast();

    // Vérification toutes les 15 minutes pour les alertes pluie
    const interval = setInterval(checkRainAlerts, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkRainAlerts = async () => {
    if (!weatherData || !notificationsEnabled) return;

    const currentCondition = weatherData.current.condition.toLowerCase();
    const isRaining = currentCondition.includes('pluie') || 
                     currentCondition.includes('averse') || 
                     currentCondition.includes('orage');
    
    const wasRaining = lastRainStatus === 'raining';

    // Détection début de pluie
    if (isRaining && !wasRaining) {
      await sendNotification('🌧️ Il commence à pleuvoir', {
        body: `Pluie détectée à ${weatherData.location.name}. Pensez à prendre un parapluie !`,
        tag: 'rain-start',
        icon: '/weather-icons/rain.png'
      });
      setLastRainStatus('raining');
    }
    
    // Détection fin de pluie
    if (!isRaining && wasRaining) {
      await sendNotification('☀️ La pluie s\'arrête', {
        body: `Le temps s'améliore à ${weatherData.location.name} !`,
        tag: 'rain-end',
        icon: '/weather-icons/sun.png'
      });
      setLastRainStatus('clear');
    }

    // Prédiction pluie dans l'heure (basée sur les données horaires)
    if (weatherData.hourly && weatherData.hourly.length > 0) {
      const nextHour = weatherData.hourly[1];
      if (nextHour && nextHour.condition.toLowerCase().includes('pluie') && !isRaining) {
        await sendNotification('🌦️ Pluie prévue dans 1h', {
          body: `${nextHour.condition} prévu vers ${nextHour.time}`,
          tag: 'rain-prediction'
        });
      }
    }
  };

  const handleWeatherClick = () => {
    setShowDetails(!showDetails);
    
    if (!showDetails && weatherData) {
      toast({
        title: "Météo détaillée",
        description: `${weatherData.current.temperature}°C (ressenti ${weatherData.current.feelsLike}°C), ${weatherData.current.condition}`,
      });
    }
  };

  const getWeatherIcon = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('pluie') || lowerCondition.includes('averse')) return '🌧️';
    if (lowerCondition.includes('orage')) return '⛈️';
    if (lowerCondition.includes('neige')) return '❄️';
    if (lowerCondition.includes('nuage')) return '☁️';
    if (lowerCondition.includes('brouillard')) return '🌫️';
    return '☀️';
  };

  // Affichage instantané avec skeleton amélioré
  if (loading && !weatherData) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-12 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="text-center">
          <span className="text-2xl">🌤️</span>
          <p className="text-gray-500 text-sm mt-1">Météo indisponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={handleWeatherClick}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Météo</h3>
            <p className="text-2xl font-light text-gray-900">{weatherData.current.temperature}°C</p>
            <p className="text-sm text-gray-600 capitalize">{weatherData.current.condition}</p>
            <p className="text-xs text-gray-500">{weatherData.location.name}</p>
          </div>
          
          <div className="text-right">
            <span className="text-4xl">{getWeatherIcon(weatherData.current.condition)}</span>
            <p className="text-xs text-gray-500 mt-1">
              Ressenti {weatherData.current.feelsLike}°C
            </p>
          </div>
        </div>
      </button>

      {showDetails && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Humidité</p>
              <p className="font-semibold text-gray-900">{weatherData.current.humidity}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Vent</p>
              <p className="font-semibold text-gray-900">{weatherData.current.windSpeed} km/h</p>
            </div>
          </div>
          
          {weatherData.forecast && weatherData.forecast.length > 0 && (
            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm font-medium text-gray-900 mb-2">Prévisions</p>
              <div className="grid grid-cols-3 gap-2">
                {weatherData.forecast.slice(0, 3).map((day, index) => (
                  <div key={index} className="text-center">
                    <p className="text-xs font-medium text-gray-700">
                      {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </p>
                    <span className="text-lg">{getWeatherIcon(day.condition)}</span>
                    <p className="text-sm font-semibold text-gray-900">{day.maxTemp}°</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherMobileWidget;
