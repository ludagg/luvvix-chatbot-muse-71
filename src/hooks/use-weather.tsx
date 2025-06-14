
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface WeatherData {
  current: {
    temperature: number;
    condition: string;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    visibility: number;
    uvIndex: number;
    pressure: number;
    feelsLike: number;
  };
  location: {
    name: string;
    country: string;
    region: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  forecast: Array<{
    date: string;
    maxTemp: number;
    minTemp: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    precipitation: number;
  }>;
  hourly: Array<{
    time: string;
    temperature: number;
    condition: string;
    icon: string;
    precipitation: number;
    windSpeed: number;
  }>;
  lastUpdated: string;
}

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const { user } = useAuth();

  const fetchWeather = async (lat?: number, lon?: number, city?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (lat) params.append('lat', lat.toString());
      if (lon) params.append('lon', lon.toString());
      if (city) params.append('city', city);

      const { data, error } = await supabase.functions.invoke('luvvix-weather-api/current', {
        body: { lat, lon, city },
      });

      if (error) throw error;
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      toast({
        title: "Erreur météo",
        description: "Impossible de récupérer les données météo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAIAnalysis = async () => {
    if (!weatherData || !user) return;
    
    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('luvvix-weather-api/ai-analysis', {
        body: { weatherData: weatherData.current },
      });

      if (error) throw error;
      setAiAnalysis(data.analysis);
      
      toast({
        title: "Analyse IA terminée",
        description: "L'IA a analysé les conditions météo",
      });
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      toast({
        title: "Erreur IA",
        description: "Impossible de générer l'analyse météo",
        variant: "destructive"
      });
    } finally {
      setLoadingAI(false);
    }
  };

  return {
    weatherData,
    loading,
    aiAnalysis,
    loadingAI,
    fetchWeather,
    generateAIAnalysis,
  };
};
