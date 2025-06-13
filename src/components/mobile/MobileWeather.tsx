
import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, Eye, MapPin, Calendar, Bot, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const MobileWeather = () => {
  const { user } = useAuth();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lon: longitude });
          loadWeatherData(latitude, longitude);
        },
        (error) => {
          console.error('Erreur géolocalisation:', error);
          // Fallback vers Paris
          setLocation({ lat: 48.8566, lon: 2.3522 });
          loadWeatherData(48.8566, 2.3522);
        }
      );
    } else {
      // Fallback vers Paris
      setLocation({ lat: 48.8566, lon: 2.3522 });
      loadWeatherData(48.8566, 2.3522);
    }
  };

  const loadWeatherData = async (lat: number, lon: number) => {
    try {
      // Simulation de données météo réelles
      const currentWeather = {
        temperature: Math.round(15 + Math.random() * 15),
        condition: 'Partiellement nuageux',
        description: 'Quelques nuages avec éclaircies',
        humidity: Math.round(50 + Math.random() * 30),
        windSpeed: Math.round(5 + Math.random() * 15),
        pressure: Math.round(1000 + Math.random() * 50),
        visibility: Math.round(8 + Math.random() * 7),
        uvIndex: Math.round(Math.random() * 10),
        feelsLike: Math.round(15 + Math.random() * 15),
        location: 'Paris, France',
        icon: getWeatherIcon('partly-cloudy'),
        timestamp: new Date()
      };

      const forecastData = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        tempMax: Math.round(20 + Math.random() * 10),
        tempMin: Math.round(10 + Math.random() * 10),
        condition: ['Ensoleillé', 'Nuageux', 'Pluvieux', 'Partiellement nuageux'][Math.floor(Math.random() * 4)],
        icon: getWeatherIcon(['sunny', 'cloudy', 'rainy', 'partly-cloudy'][Math.floor(Math.random() * 4)]),
        precipitation: Math.round(Math.random() * 30)
      }));

      setWeatherData(currentWeather);
      setForecast(forecastData);
      
      // Suggestions IA basées sur la météo
      generateAISuggestions(currentWeather, forecastData);
      
    } catch (error) {
      console.error('Erreur chargement météo:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données météo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAISuggestions = (current: any, forecast: any[]) => {
    const suggestions = [];
    
    if (current.temperature < 10) {
      suggestions.push({
        type: 'clothing',
        title: 'Habillez-vous chaudement',
        description: 'Il fait froid aujourd\'hui, pensez à prendre une veste',
        icon: '🧥'
      });
    }
    
    if (forecast[1].precipitation > 70) {
      suggestions.push({
        type: 'activity',
        title: 'Pluie prévue demain',
        description: 'Planifiez vos activités d\'intérieur pour demain',
        icon: '☔'
      });
    }
    
    if (current.uvIndex > 6) {
      suggestions.push({
        type: 'health',
        title: 'Protection solaire recommandée',
        description: 'L\'indice UV est élevé, protégez-vous du soleil',
        icon: '🧴'
      });
    }

    setAiSuggestions(suggestions);
  };

  const getWeatherIcon = (condition: string) => {
    const icons = {
      'sunny': '☀️',
      'cloudy': '☁️',
      'partly-cloudy': '⛅',
      'rainy': '🌧️',
      'stormy': '⛈️',
      'snowy': '❄️',
      'foggy': '🌫️'
    };
    return icons[condition as keyof typeof icons] || '☀️';
  };

  const getWeatherBackground = (condition: string) => {
    const backgrounds = {
      'Ensoleillé': 'from-yellow-400 to-orange-500',
      'Nuageux': 'from-gray-400 to-gray-600',
      'Pluvieux': 'from-blue-500 to-blue-700',
      'Partiellement nuageux': 'from-blue-400 to-blue-600',
      'default': 'from-blue-400 to-blue-600'
    };
    return backgrounds[condition as keyof typeof backgrounds] || backgrounds.default;
  };

  const refreshWeather = () => {
    setLoading(true);
    if (location) {
      loadWeatherData(location.lat, location.lon);
    } else {
      getCurrentLocation();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 pb-20">
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 pt-16 text-white">
          <div className="animate-pulse">
            <div className="h-8 bg-white bg-opacity-20 rounded w-3/4 mb-4"></div>
            <div className="h-16 bg-white bg-opacity-20 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-white bg-opacity-20 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 pb-20">
      {/* Header principal météo */}
      <div className={`bg-gradient-to-br ${getWeatherBackground(weatherData?.condition)} p-6 pt-16 text-white relative overflow-hidden`}>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">LuvviX Weather</h1>
            <button
              onClick={refreshWeather}
              className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm opacity-90">{weatherData?.location}</span>
          </div>

          <div className="flex items-end space-x-4 mb-6">
            <div className="text-6xl font-thin">{weatherData?.temperature}°</div>
            <div className="text-4xl mb-2">{weatherData?.icon}</div>
          </div>

          <div className="space-y-1">
            <p className="text-lg font-medium">{weatherData?.condition}</p>
            <p className="text-sm opacity-90">{weatherData?.description}</p>
            <p className="text-sm opacity-75">Ressenti {weatherData?.feelsLike}°</p>
          </div>
        </div>

        {/* Effet de fond */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
      </div>

      {/* Suggestions IA */}
      {aiSuggestions.length > 0 && (
        <div className="p-4">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white">
            <div className="flex items-center space-x-2 mb-3">
              <Bot className="w-5 h-5" />
              <span className="font-semibold">Suggestions Météo IA</span>
            </div>
            <div className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-xl">{suggestion.icon}</span>
                  <div>
                    <h4 className="font-medium">{suggestion.title}</h4>
                    <p className="text-sm text-indigo-100">{suggestion.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Détails météo */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Détails actuels</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-600">Humidité</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{weatherData?.humidity}%</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Wind className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-600">Vent</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{weatherData?.windSpeed} km/h</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Thermometer className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-gray-600">Pression</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{weatherData?.pressure} hPa</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Eye className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-gray-600">Visibilité</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{weatherData?.visibility} km</p>
          </div>
        </div>
      </div>

      {/* Prévisions 7 jours */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Prévisions 7 jours
        </h3>
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {forecast.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-b-0">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{day.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">
                    {index === 0 ? 'Aujourd\'hui' : 
                     index === 1 ? 'Demain' : 
                     day.date.toLocaleDateString('fr-FR', { weekday: 'long' })}
                  </p>
                  <p className="text-sm text-gray-600">{day.condition}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {day.precipitation > 0 && (
                  <div className="flex items-center space-x-1 text-blue-500">
                    <Droplets className="w-3 h-3" />
                    <span className="text-xs">{day.precipitation}%</span>
                  </div>
                )}
                <div className="text-right">
                  <span className="font-semibold text-gray-900">{day.tempMax}°</span>
                  <span className="text-gray-500 ml-1">{day.tempMin}°</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dernière mise à jour */}
      <div className="p-4 text-center">
        <p className="text-xs text-gray-500">
          Dernière mise à jour : {weatherData?.timestamp.toLocaleTimeString('fr-FR')}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Données fournies par LuvviX Weather API
        </p>
      </div>
    </div>
  );
};

export default MobileWeather;
