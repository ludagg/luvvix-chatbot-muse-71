import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Wind, Droplets, Eye, Sun, Moon, Cloud, CloudRain, Zap, Snowflake, RefreshCw, Sparkles, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { useWeather } from '@/hooks/use-weather';

interface MobileWeatherProps {
  onBack: () => void;
}

const MobileWeather = ({ onBack }: MobileWeatherProps) => {
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'current' | 'forecast' | 'hourly' | 'details'>('current');
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');

  const { weatherData, loading, fetchWeather } = useWeather();

  // Géolocalisation
  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        (error) => {
          console.error('Erreur géolocalisation:', error);
          fetchWeather(undefined, undefined, 'Paris');
          toast({
            title: "Géolocalisation",
            description: "Impossible d'obtenir votre position, utilisation de Paris par défaut",
          });
        }
      );
    } else {
      fetchWeather(undefined, undefined, 'Paris');
    }
  };

  useEffect(() => {
    if (useCurrentLocation) {
      getCurrentLocation();
    } else {
      fetchWeather(undefined, undefined, 'Paris');
    }
  }, [useCurrentLocation]);

  const getWeatherIcon = (condition: string) => {
    const icons: { [key: string]: string } = {
      'Ensoleillé': '☀️',
      'Nuageux': '☁️',
      'Partiellement nuageux': '⛅',
      'Pluvieux': '🌧️',
      'Orageux': '⛈️',
      'Neigeux': '❄️',
      'Brumeux': '🌫️'
    };
    return icons[condition] || '🌤️';
  };

  const getUVLevel = (uvIndex: number) => {
    if (uvIndex <= 2) return { level: 'Faible', color: 'text-green-600' };
    if (uvIndex <= 5) return { level: 'Modéré', color: 'text-yellow-600' };
    if (uvIndex <= 7) return { level: 'Élevé', color: 'text-orange-600' };
    if (uvIndex <= 10) return { level: 'Très élevé', color: 'text-red-600' };
    return { level: 'Extrême', color: 'text-purple-600' };
  };

  const renderCurrentWeather = () => {
    if (!weatherData) return null;

    const uvLevel = getUVLevel(weatherData.current.uvIndex);

    return (
      <div className="space-y-6">
        {/* Conditions actuelles */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">{weatherData.location.name}</h2>
              <p className="text-blue-100 text-sm">{weatherData.location.region}, {weatherData.location.country}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl mb-2">{getWeatherIcon(weatherData.current.condition)}</div>
              <button
                onClick={() => fetchWeather()}
                className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          <div className="flex items-end space-x-4 mb-4">
            <div className="text-5xl font-light">{weatherData.current.temperature}°C</div>
            <div className="text-lg text-blue-100">
              Ressenti {weatherData.current.feelsLike}°C
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium">{weatherData.current.condition}</p>
              <p className="text-blue-100 text-sm">{weatherData.current.description}</p>
            </div>
            <div className="text-right text-sm text-blue-100">
              <p>Mise à jour</p>
              <p>{format(new Date(weatherData.lastUpdated), 'HH:mm')}</p>
            </div>
          </div>
        </div>

        {/* Détails météo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Humidité</p>
                <p className="text-lg font-semibold">{weatherData.current.humidity}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Wind className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Vent</p>
                <p className="text-lg font-semibold">{weatherData.current.windSpeed} km/h</p>
                <p className="text-xs text-gray-500">{weatherData.current.windDirection}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Sun className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">UV Index</p>
                <p className="text-lg font-semibold">{weatherData.current.uvIndex}</p>
                <p className={`text-xs font-medium ${uvLevel.color}`}>{uvLevel.level}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Visibilité</p>
                <p className="text-lg font-semibold">{weatherData.current.visibility} km</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderForecast = () => {
    if (!weatherData) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Prévisions 7 jours</h3>
        
        {weatherData.forecast.map((day, index) => (
          <div key={index} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getWeatherIcon(day.condition)}</div>
                <div>
                  <p className="font-medium">
                    {index === 0 ? 'Aujourd\'hui' : format(new Date(day.date), 'EEEE', { locale: fr })}
                  </p>
                  <p className="text-sm text-gray-600">{day.condition}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-semibold">{day.maxTemp}°</span>
                  <span className="text-gray-500">{day.minTemp}°</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                  <span className="flex items-center space-x-1">
                    <Droplets className="w-3 h-3" />
                    <span>{day.precipitation}%</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Wind className="w-3 h-3" />
                    <span>{day.windSpeed}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderHourlyForecast = () => {
    if (!weatherData) return null;

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Prévisions horaires</h3>
        
        <div className="space-y-3">
          {weatherData.hourly.slice(0, 12).map((hour, index) => (
            <div key={index} className="bg-white rounded-xl p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getWeatherIcon(hour.condition)}</span>
                  <div>
                    <p className="font-medium">{format(new Date(hour.time), 'HH:mm')}</p>
                    <p className="text-sm text-gray-600">{hour.condition}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-semibold">{hour.temperature}°C</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Droplets className="w-3 h-3" />
                      <span>{hour.precipitation}%</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Wind className="w-3 h-3" />
                      <span>{hour.windSpeed}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données météo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Cloud className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur météo</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null);
              fetchWeather();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">LuvviX Météo</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setUseCurrentLocation(!useCurrentLocation)}
            className={`p-2 rounded-full transition-colors ${
              useCurrentLocation ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <MapPin className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex bg-gray-50 border-b border-gray-200">
        {[
          { key: 'current', label: 'Actuel', icon: Sun },
          { key: 'forecast', label: 'Prévisions', icon: Calendar },
          { key: 'hourly', label: 'Horaire', icon: Clock }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key as any)}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              view === key
                ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-auto p-4">
        {view === 'current' && renderCurrentWeather()}
        {view === 'forecast' && renderForecast()}
        {view === 'hourly' && renderHourlyForecast()}
      </div>
    </div>
  );
};

export default MobileWeather;
