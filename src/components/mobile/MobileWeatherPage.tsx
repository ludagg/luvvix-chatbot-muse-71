
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Wind, Droplets, Eye, Sun, Moon, Cloud, CloudRain } from 'lucide-react';

interface WeatherData {
  current: {
    temperature: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
    visibility: number;
    uvIndex: number;
    pressure: number;
  };
  location: {
    name: string;
    country: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  forecast: Array<{
    date: string;
    day: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    precipitation: number;
  }>;
  hourly: Array<{
    time: string;
    temperature: number;
    condition: string;
    icon: string;
  }>;
}

interface MobileWeatherPageProps {
  onBack: () => void;
}

const MobileWeatherPage = ({ onBack }: MobileWeatherPageProps) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      
      // Obtenir la géolocalisation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // Simuler des données météo réelles (en production, utiliser une vraie API)
      const mockWeatherData: WeatherData = {
        current: {
          temperature: Math.round(15 + Math.random() * 20),
          condition: 'Ensoleillé',
          description: 'Ciel dégagé avec quelques nuages',
          humidity: Math.round(40 + Math.random() * 40),
          windSpeed: Math.round(5 + Math.random() * 15),
          visibility: Math.round(8 + Math.random() * 7),
          uvIndex: Math.round(1 + Math.random() * 10),
          pressure: Math.round(1010 + Math.random() * 20)
        },
        location: {
          name: 'Paris',
          country: 'France',
          coordinates: { lat: latitude, lon: longitude }
        },
        forecast: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
          day: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { weekday: 'short' }),
          high: Math.round(20 + Math.random() * 15),
          low: Math.round(10 + Math.random() * 10),
          condition: ['Ensoleillé', 'Nuageux', 'Pluie', 'Orageux'][Math.floor(Math.random() * 4)],
          icon: '☀️',
          precipitation: Math.round(Math.random() * 100)
        })),
        hourly: Array.from({ length: 24 }, (_, i) => ({
          time: `${i.toString().padStart(2, '0')}:00`,
          temperature: Math.round(15 + Math.random() * 10),
          condition: 'Ensoleillé',
          icon: '☀️'
        }))
      };

      setWeatherData(mockWeatherData);
    } catch (error) {
      console.error('Erreur géolocalisation:', error);
      setError('Impossible d\'obtenir votre position. Vérifiez vos paramètres de géolocalisation.');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'ensoleillé':
      case 'soleil':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'nuageux':
      case 'couvert':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'pluie':
      case 'pluvieux':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      default:
        return <Sun className="w-8 h-8 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la météo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold">LuvviX Weather</h1>
          <div className="w-10"></div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Géolocalisation requise</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadWeatherData}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-400 to-purple-600 z-50 flex flex-col text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <button onClick={onBack} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">LuvviX Weather</h1>
        <div className="w-10"></div>
      </div>

      {/* Météo actuelle */}
      <div className="flex-1 overflow-auto">
        <div className="text-center p-6">
          <div className="flex items-center justify-center mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{weatherData.location.name}, {weatherData.location.country}</span>
          </div>
          
          <div className="my-8">
            {getWeatherIcon(weatherData.current.condition)}
            <div className="text-6xl font-light mt-4 mb-2">
              {weatherData.current.temperature}°C
            </div>
            <p className="text-xl opacity-90">{weatherData.current.condition}</p>
            <p className="text-sm opacity-80 mt-1">{weatherData.current.description}</p>
          </div>

          {/* Détails météo */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white bg-opacity-20 rounded-2xl p-4">
              <div className="flex items-center justify-center mb-2">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="text-2xl font-semibold">{weatherData.current.humidity}%</div>
              <div className="text-sm opacity-80">Humidité</div>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-2xl p-4">
              <div className="flex items-center justify-center mb-2">
                <Wind className="w-5 h-5" />
              </div>
              <div className="text-2xl font-semibold">{weatherData.current.windSpeed} km/h</div>
              <div className="text-sm opacity-80">Vent</div>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-2xl p-4">
              <div className="flex items-center justify-center mb-2">
                <Eye className="w-5 h-5" />
              </div>
              <div className="text-2xl font-semibold">{weatherData.current.visibility} km</div>
              <div className="text-sm opacity-80">Visibilité</div>
            </div>
            
            <div className="bg-white bg-opacity-20 rounded-2xl p-4">
              <div className="flex items-center justify-center mb-2">
                <Sun className="w-5 h-5" />
              </div>
              <div className="text-2xl font-semibold">{weatherData.current.uvIndex}</div>
              <div className="text-sm opacity-80">Index UV</div>
            </div>
          </div>

          {/* Prévisions horaires */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-left">Prévisions horaires</h3>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {weatherData.hourly.slice(0, 12).map((hour, index) => (
                <div key={index} className="flex-shrink-0 bg-white bg-opacity-20 rounded-xl p-3 text-center min-w-16">
                  <div className="text-sm opacity-80 mb-2">{hour.time}</div>
                  <div className="text-xl mb-2">{hour.icon}</div>
                  <div className="font-semibold">{hour.temperature}°</div>
                </div>
              ))}
            </div>
          </div>

          {/* Prévisions 7 jours */}
          <div className="bg-white bg-opacity-10 rounded-2xl p-4 mx-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">Prévisions 7 jours</h3>
            <div className="space-y-3">
              {weatherData.forecast.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-12 text-sm">{day.day}</span>
                    <span className="text-xl">{day.icon}</span>
                    <span className="text-sm opacity-80">{day.condition}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm opacity-80">{day.low}°</span>
                    <div className="w-12 h-1 bg-white bg-opacity-30 rounded-full">
                      <div className="h-full bg-white rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="font-semibold">{day.high}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileWeatherPage;
