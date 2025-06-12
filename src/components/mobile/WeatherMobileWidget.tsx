
import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface WeatherData {
  temperature: number;
  feelsLike: number;
  condition: string;
  location: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast: {
    day: string;
    temp: number;
    condition: string;
    icon: string;
  }[];
}

const WeatherMobileWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Utiliser notre API météo LuvviX
        const response = await fetch('/api/weather?city=Paris');
        
        if (response.ok) {
          const data = await response.json();
          setWeather({
            temperature: Math.round(data.current?.temperature_2m || 22),
            feelsLike: Math.round(data.current?.apparent_temperature || 24),
            condition: data.current?.weather_description || 'Ensoleillé',
            location: data.location?.name || 'Paris',
            humidity: data.current?.relative_humidity_2m || 65,
            windSpeed: Math.round(data.current?.wind_speed_10m || 15),
            icon: '☀️',
            forecast: [
              { day: 'Demain', temp: 24, condition: 'Ensoleillé', icon: '☀️' },
              { day: 'Mer.', temp: 21, condition: 'Nuageux', icon: '☁️' },
              { day: 'Jeu.', temp: 19, condition: 'Pluvieux', icon: '🌧️' },
            ]
          });
        } else {
          throw new Error('API non disponible');
        }
      } catch (error) {
        console.error('Erreur météo:', error);
        // Données par défaut
        setWeather({
          temperature: 22,
          feelsLike: 24,
          condition: 'Ensoleillé',
          location: 'Paris',
          humidity: 65,
          windSpeed: 15,
          icon: '☀️',
          forecast: [
            { day: 'Demain', temp: 24, condition: 'Ensoleillé', icon: '☀️' },
            { day: 'Mer.', temp: 21, condition: 'Nuageux', icon: '☁️' },
            { day: 'Jeu.', temp: 19, condition: 'Pluvieux', icon: '🌧️' },
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const handleWeatherClick = () => {
    if (weather) {
      setShowDetails(!showDetails);
      
      if (!showDetails) {
        toast({
          title: "Météo détaillée",
          description: `${weather.temperature}°C (ressenti ${weather.feelsLike}°C), humidité ${weather.humidity}%, vent ${weather.windSpeed} km/h`,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p className="text-gray-500 text-sm">Météo indisponible</p>
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
            <p className="text-2xl font-light text-gray-900">{weather.temperature}°C</p>
            <p className="text-sm text-gray-600">{weather.condition}</p>
            <p className="text-xs text-gray-500">{weather.location}</p>
          </div>
          
          <div className="text-right">
            <span className="text-4xl">{weather.icon}</span>
            <p className="text-xs text-gray-500 mt-1">
              Ressenti {weather.feelsLike}°C
            </p>
          </div>
        </div>
      </button>

      {showDetails && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Humidité</p>
              <p className="font-semibold text-gray-900">{weather.humidity}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Vent</p>
              <p className="font-semibold text-gray-900">{weather.windSpeed} km/h</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-3">
            <p className="text-sm font-medium text-gray-900 mb-2">Prévisions</p>
            <div className="grid grid-cols-3 gap-2">
              {weather.forecast.map((day, index) => (
                <div key={index} className="text-center">
                  <p className="text-xs font-medium text-gray-700">{day.day}</p>
                  <span className="text-lg">{day.icon}</span>
                  <p className="text-sm font-semibold text-gray-900">{day.temp}°</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherMobileWidget;
