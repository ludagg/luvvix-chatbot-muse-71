
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Thermometer, Wind, Droplets, Eye, Settings, RefreshCw, Bell } from 'lucide-react';
import { useWeatherService } from '@/hooks/use-weather-service';
import { useAINotifications } from '@/hooks/use-ai-notifications';
import { toast } from '@/hooks/use-toast';

interface MobileWeatherProps {
  onBack: () => void;
}

const MobileWeather = ({ onBack }: MobileWeatherProps) => {
  const { weatherData, loading, preferences, fetchWeather, updatePreferences } = useWeatherService();
  const { generateSmartNotification } = useAINotifications();
  const [showSettings, setShowSettings] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');

  useEffect(() => {
    fetchWeather();
  }, []);

  const getWeatherIcon = (code: number) => {
    const icons: { [key: number]: string } = {
      0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
      45: '🌫️', 48: '🌫️',
      51: '🌦️', 53: '🌦️', 55: '🌦️',
      61: '🌧️', 63: '🌧️', 65: '🌧️',
      71: '🌨️', 73: '🌨️', 75: '🌨️',
      95: '⛈️', 96: '⛈️', 99: '⛈️'
    };
    return icons[code] || '🌤️';
  };

  const getWeatherDescription = (code: number) => {
    const descriptions: { [key: number]: string } = {
      0: 'Ciel dégagé',
      1: 'Principalement dégagé',
      2: 'Partiellement nuageux',
      3: 'Couvert',
      45: 'Brouillard',
      48: 'Brouillard givrant',
      51: 'Bruine légère',
      53: 'Bruine modérée',
      55: 'Bruine dense',
      61: 'Pluie légère',
      63: 'Pluie modérée',
      65: 'Pluie forte',
      71: 'Neige légère',
      73: 'Neige modérée',
      75: 'Neige forte',
      95: 'Orage',
      96: 'Orage avec grêle légère',
      99: 'Orage avec grêle forte'
    };
    return descriptions[code] || 'Conditions inconnues';
  };

  const handleLocationSearch = async () => {
    if (searchLocation.trim()) {
      await fetchWeather(searchLocation);
      setSearchLocation('');
    }
  };

  const handleGenerateWeatherAlert = async () => {
    if (!weatherData) return;

    const context = `Météo actuelle: ${weatherData.current.temperature_2m}°C, ${getWeatherDescription(weatherData.current.weather_code)} à ${weatherData.location.name}. Vent: ${weatherData.current.wind_speed_10m} km/h, Humidité: ${weatherData.current.relative_humidity_2m}%`;
    
    await generateSmartNotification(context, 'weather');
    toast({
      title: "Alerte météo générée",
      description: "Une notification intelligente a été créée",
    });
  };

  const formatTemperature = (temp: number) => {
    if (preferences.temperature_unit === 'fahrenheit') {
      return `${Math.round((temp * 9/5) + 32)}°F`;
    }
    return `${Math.round(temp)}°C`;
  };

  if (loading && !weatherData) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données météo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 z-50 flex flex-col text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button onClick={onBack} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">LuvviX Météo</h1>
        <div className="flex space-x-2">
          <button 
            onClick={() => fetchWeather()}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
            disabled={loading}
          >
            <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Rechercher une ville..."
            className="flex-1 px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-white placeholder-opacity-70 border-0 focus:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
          />
          <button
            onClick={handleLocationSearch}
            className="px-6 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            <MapPin className="w-5 h-5" />
          </button>
        </div>
      </div>

      {weatherData ? (
        <div className="flex-1 overflow-auto px-4">
          {/* Current Weather */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-2">
              <MapPin className="w-5 h-5 mr-2" />
              <h2 className="text-xl font-semibold">{weatherData.location.name}</h2>
            </div>
            
            <div className="text-6xl mb-4">
              {getWeatherIcon(weatherData.current.weather_code)}
            </div>
            
            <div className="text-5xl font-light mb-2">
              {formatTemperature(weatherData.current.temperature_2m)}
            </div>
            
            <p className="text-xl text-blue-100">
              {getWeatherDescription(weatherData.current.weather_code)}
            </p>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white bg-opacity-20 rounded-2xl p-4 text-center">
              <Wind className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm text-blue-100">Vent</p>
              <p className="text-lg font-semibold">{weatherData.current.wind_speed_10m} km/h</p>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-2xl p-4 text-center">
              <Droplets className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm text-blue-100">Humidité</p>
              <p className="text-lg font-semibold">{weatherData.current.relative_humidity_2m}%</p>
            </div>
          </div>

          {/* Forecast */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Prévisions 7 jours</h3>
            <div className="space-y-3">
              {weatherData.daily.weather_code.slice(0, 7).map((code, index) => (
                <div key={index} className="flex items-center justify-between bg-white bg-opacity-20 rounded-xl p-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{getWeatherIcon(code)}</span>
                    <div>
                      <p className="font-medium">
                        {index === 0 ? "Aujourd'hui" : 
                         index === 1 ? "Demain" : 
                         new Date(Date.now() + index * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { weekday: 'long' })}
                      </p>
                      <p className="text-sm text-blue-100">{getWeatherDescription(code)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatTemperature(weatherData.daily.temperature_2m_max[index])}
                    </p>
                    <p className="text-sm text-blue-100">
                      {formatTemperature(weatherData.daily.temperature_2m_min[index])}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Weather Alert Button */}
          <div className="pb-8">
            <button
              onClick={handleGenerateWeatherAlert}
              className="w-full bg-white bg-opacity-20 rounded-xl p-4 flex items-center justify-center space-x-2 hover:bg-opacity-30 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span>Générer une alerte météo IA</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🌤️</div>
            <p className="text-xl text-blue-100">Aucune donnée météo disponible</p>
            <button
              onClick={() => fetchWeather()}
              className="mt-4 px-6 py-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            >
              Actualiser
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-end">
          <div className="bg-white w-full rounded-t-3xl max-h-[70vh] overflow-auto text-gray-900">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Paramètres météo</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville par défaut
                  </label>
                  <input
                    type="text"
                    value={preferences.default_location}
                    onChange={(e) => updatePreferences({ default_location: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Paris, France"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unité de température
                  </label>
                  <select
                    value={preferences.temperature_unit}
                    onChange={(e) => updatePreferences({ temperature_unit: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="celsius">Celsius (°C)</option>
                    <option value="fahrenheit">Fahrenheit (°F)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Utiliser ma position</p>
                    <p className="text-sm text-gray-600">Détecter automatiquement votre localisation</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.use_current_location}
                      onChange={(e) => updatePreferences({ use_current_location: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Notifications météo</p>
                    <p className="text-sm text-gray-600">Recevoir des alertes météo importantes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.notification_enabled}
                      onChange={(e) => updatePreferences({ notification_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileWeather;
