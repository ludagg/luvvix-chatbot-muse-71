
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
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
    pressure?: number;
    icon?: string;
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

function conditionFromCode(code: number) {
  // https://open-meteo.com/en/docs#api_form
  if (code === 0) return { condition: 'Ensoleillé', icon: '☀️' };
  if ([1,2,3].includes(code)) return { condition: 'Partiellement nuageux', icon: '⛅' };
  if ([45, 48].includes(code)) return { condition: 'Brouillard', icon: '🌫️' };
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return { condition: 'Pluvieux', icon: '🌧️' };
  if ([71,73,75,77,85,86].includes(code)) return { condition: 'Neige', icon: '❄️' };
  if ([95,96,99].includes(code)) return { condition: 'Orageux', icon: '⛈️' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: 'Neige', icon: '❄️' };
  return { condition: 'Inconnu', icon: '❔' };
}

async function reverseGeocode(lat: number, lon: number) {
  // Utilise Nominatim, qui est ouvert
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`
  );
  const json = await response.json();
  return {
    name: json.address.city || json.address.town || json.address.village || json.display_name?.split(',')[0] || "Lieu inconnu",
    region: json.address.county || "",
    country: json.address.country || "",
  };
}

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  // Nouvelle implémentation réaliste !
  const fetchWeather = async (lat?: number, lon?: number, locationName?: string) => {
    setLoading(true);
    try {
      // Défaut : Paris
      let latitude = lat, longitude = lon;
      let locationLabel = locationName || 'Paris';
      if (!lat || !lon) {
        // Paris : 48.8566,2.3522
        latitude = 48.8566;
        longitude = 2.3522;
        locationLabel = 'Paris';
      }
      // 1. Appel Open-Meteo
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=temperature_2m,weathercode,apparent_temperature,precipitation,relative_humidity_2m,windspeed_10m,uv_index,visibility,pressure_msl&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,windspeed_10m_max&timezone=auto`
      );
      if (!res.ok) throw new Error('API météo non disponible');
      const data = await res.json();

      // 2. Géocoder pour joli nom de ville
      let locInfo = {
        name: locationLabel,
        region: '',
        country: ''
      };
      try {
        locInfo = await reverseGeocode(latitude, longitude);
      } catch {}

      // 3. Current météo
      const code = data.current_weather.weathercode;
      const { condition, icon } = conditionFromCode(code);
      const current = {
        temperature: Math.round(data.current_weather.temperature),
        condition,
        description: condition,
        feelsLike: Math.round((data.hourly?.apparent_temperature?.[0]) ?? data.current_weather.temperature),
        humidity: data.hourly?.relative_humidity_2m?.[0] ?? 60,
        windSpeed: Math.round(data.current_weather.windspeed),
        windDirection: data.current_weather.winddirection ?? "N/A",
        uvIndex: data.hourly?.uv_index?.[0] ?? 0,
        visibility: Math.round((data.hourly?.visibility?.[0] ?? 8000) / 1000),
        pressure: Math.round(data.hourly?.pressure_msl?.[0] ?? 1015),
        icon
      };

      // 4. Prévisions journalières
      const forecast: WeatherData["forecast"] = [];
      for (let i = 0; i < (data.daily?.time?.length || 0); i++) {
        const dayCode = data.daily.weathercode?.[i] ?? 0;
        forecast.push({
          date: data.daily.time?.[i],
          condition: conditionFromCode(dayCode).condition,
          maxTemp: Math.round(data.daily.temperature_2m_max?.[i]),
          minTemp: Math.round(data.daily.temperature_2m_min?.[i]),
          precipitation: Math.round(data.daily.precipitation_sum?.[i] ?? 0),
          windSpeed: Math.round(data.daily.windspeed_10m_max?.[i]) + " km/h"
        });
      }

      // 5. Prévisions horaires
      const hourly: WeatherData["hourly"] = [];
      if (data.hourly?.time) {
        for (let i = 0; i < data.hourly.time.length && i < 24; i++) {
          const code = data.hourly.weathercode?.[i];
          hourly.push({
            time: data.hourly.time[i].slice(11, 16), // "2024-06-15T16:00" -> "16:00"
            temperature: Math.round(data.hourly.temperature_2m?.[i]),
            condition: conditionFromCode(code).condition,
            precipitation: Math.round(data.hourly.precipitation?.[i] ?? 0),
            windSpeed: Math.round(data.hourly.windspeed_10m?.[i]) + " km/h"
          });
        }
      }

      setWeatherData({
        location: {
          ...locInfo,
          lat: latitude!,
          lon: longitude!
        },
        current,
        forecast,
        hourly,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erreur météo réelle:', error);
      toast({
        title: "Erreur météo",
        description: "Impossible de récupérer les données météo réelles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    weatherData,
    loading,
    fetchWeather
  };
};
