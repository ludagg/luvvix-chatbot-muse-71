
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
  };
  current: {
    temperature: number;
    condition: string;
    description: string;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    uvIndex: number;
    visibility: number;
  };
  forecast: Array<{
    date: string;
    condition: string;
    maxTemp: number;
    minTemp: number;
    precipitation: number;
    windSpeed: string;
  }>;
  hourly: Array<{
    time: string;
    temperature: number;
    condition: string;
    precipitation: number;
    windSpeed: string;
  }>;
  lastUpdated: string;
}

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);

  const fetchWeather = async (lat?: number, lon?: number, location?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('luvvix-weather-api', {
        body: { 
          lat,
          lon,
          location: location || 'Paris'
        }
      });

      if (error) throw error;
      setWeatherData(data?.weather);
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
    if (!weatherData) return;

    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('luvvix-weather-api', {
        body: { 
          action: 'analyzeWeather',
          weatherData
        }
      });

      if (error) throw error;
      setAiAnalysis(data?.analysis || '');
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
