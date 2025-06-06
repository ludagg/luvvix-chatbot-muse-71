
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cloud, Sun, CloudRain, Wind, Eye, Droplets, Thermometer, MapPin, Search, Brain, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WeatherWidget from '@/components/weather/WeatherWidget';
import WeatherAIAssistant from '@/components/weather/WeatherAIAssistant';
import { useLanguage } from '@/hooks/useLanguage';

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  feelsLike: number;
  forecast: {
    day: string;
    high: number;
    low: number;
    condition: string;
  }[];
}

const WeatherPage = () => {
  const { t } = useLanguage();
  const [location, setLocation] = useState('Paris');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('current');

  const fetchWeather = async (city: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setWeatherData({
        location: city,
        temperature: Math.round(Math.random() * 30 + 5),
        condition: ['Ensoleillé', 'Nuageux', 'Pluvieux', 'Partiellement nuageux'][Math.floor(Math.random() * 4)],
        humidity: Math.round(Math.random() * 40 + 40),
        windSpeed: Math.round(Math.random() * 20 + 5),
        visibility: Math.round(Math.random() * 10 + 5),
        feelsLike: Math.round(Math.random() * 30 + 5),
        forecast: Array.from({ length: 5 }, (_, i) => ({
          day: ['Aujourd\'hui', 'Demain', 'Mercredi', 'Jeudi', 'Vendredi'][i],
          high: Math.round(Math.random() * 25 + 10),
          low: Math.round(Math.random() * 15 + 0),
          condition: ['Ensoleillé', 'Nuageux', 'Pluvieux'][Math.floor(Math.random() * 3)]
        }))
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des données météo:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(location);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      fetchWeather(location);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'ensoleillé':
        return <Sun className="h-16 w-16 text-yellow-500" />;
      case 'nuageux':
        return <Cloud className="h-16 w-16 text-gray-500" />;
      case 'pluvieux':
        return <CloudRain className="h-16 w-16 text-blue-500" />;
      default:
        return <Cloud className="h-16 w-16 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t.app.weather} IA Powered
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Prévisions météo intelligentes avec assistant IA Gemini 1.5 Flash
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge className="bg-blue-100 text-blue-800">
                <Brain className="h-3 w-3 mr-1" />
                IA Intégrée
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                <Zap className="h-3 w-3 mr-1" />
                Temps Réel
              </Badge>
            </div>
          </div>

          {/* Search Bar */}
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/50 dark:to-sky-950/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Rechercher une ville
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Entrez le nom d'une ville..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full mb-8">
              <TabsTrigger value="current">Météo Actuelle</TabsTrigger>
              <TabsTrigger value="forecast">Prévisions</TabsTrigger>
              <TabsTrigger value="ai-assistant">Assistant IA</TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              {weatherData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {weatherData.location}
                        </CardTitle>
                        <CardDescription>Conditions actuelles</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            {getWeatherIcon(weatherData.condition)}
                            <div>
                              <div className="text-4xl font-bold">{weatherData.temperature}°C</div>
                              <div className="text-gray-600 dark:text-gray-400">{weatherData.condition}</div>
                              <div className="text-sm text-gray-500">Ressenti {weatherData.feelsLike}°C</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Droplets className="h-4 w-4 text-blue-500" />
                              <span>{weatherData.humidity}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Wind className="h-4 w-4 text-gray-500" />
                              <span>{weatherData.windSpeed} km/h</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Eye className="h-4 w-4 text-purple-500" />
                              <span>{weatherData.visibility} km</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Thermometer className="h-4 w-4 text-red-500" />
                              <span>{weatherData.feelsLike}°C</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <WeatherWidget />
                    <Card>
                      <CardHeader>
                        <CardTitle>Alertes météo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Badge variant="outline" className="w-full justify-start p-3">
                            <div className="text-left">
                              <div className="font-medium">Aucune alerte</div>
                              <div className="text-xs text-gray-500">Conditions normales</div>
                            </div>
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="forecast">
              {weatherData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Prévisions sur 5 jours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {weatherData.forecast.map((day, index) => (
                        <div key={index} className="text-center p-6 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="font-medium text-lg mb-3">{day.day}</div>
                          <div className="flex justify-center mb-4">
                            {getWeatherIcon(day.condition)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">{day.condition}</div>
                          <div className="text-lg">
                            <span className="font-bold">{day.high}°</span>
                            <span className="text-gray-500 ml-2">{day.low}°</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="ai-assistant">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <WeatherAIAssistant />
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-500" />
                      Conseils IA Personnalisés
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        Recommandation vestimentaire
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        Portez une veste légère aujourd'hui. La température est agréable mais le vent peut donner une sensation de fraîcheur.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/50 rounded-lg">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        Activités recommandées
                      </h4>
                      <p className="text-green-800 dark:text-green-200 text-sm">
                        Parfait pour une promenade ou du jogging. Les conditions sont idéales pour les activités extérieures.
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg">
                      <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                        Impact santé
                      </h4>
                      <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                        Humidité modérée, bon pour les personnes sensibles. Pensez à vous hydrater régulièrement.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement des données météo...</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WeatherPage;
