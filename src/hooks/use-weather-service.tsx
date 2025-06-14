
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface WeatherData {
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    relative_humidity_2m: number;
  };
  daily: {
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export const useWeatherService = () => {
  const { user } = useAuth();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    default_location: '',
    use_current_location: true,
    temperature_unit: 'celsius',
    notification_enabled: true
  });

  const fetchWeather = async (location?: string) => {
    setLoading(true);
    try {
      let url = 'luvvix-weather-api';
      const params = new URLSearchParams();
      
      if (location) {
        params.append('city', location);
      } else if (preferences.use_current_location) {
        // Get current position
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        params.append('lat', position.coords.latitude.toString());
        params.append('lon', position.coords.longitude.toString());
      } else if (preferences.default_location) {
        params.append('city', preferences.default_location);
      }

      const { data } = await supabase.functions.invoke(url, {
        method: 'GET',
        body: params
      });

      if (data?.success) {
        setWeatherData(data.data);
      }
    } catch (error) {
      console.error('Weather fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPrefs: Partial<typeof preferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('weather_preferences')
        .upsert({
          user_id: user.id,
          ...newPrefs
        });

      if (!error) {
        setPreferences(prev => ({ ...prev, ...newPrefs }));
      }
    } catch (error) {
      console.error('Error updating weather preferences:', error);
    }
  };

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('weather_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPreferences({
          default_location: data.default_location || '',
          use_current_location: data.use_current_location ?? true,
          temperature_unit: data.temperature_unit || 'celsius',
          notification_enabled: data.notification_enabled ?? true
        });
      }
    } catch (error) {
      console.error('Error loading weather preferences:', error);
    }
  };

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  return {
    weatherData,
    loading,
    preferences,
    fetchWeather,
    updatePreferences
  };
};
