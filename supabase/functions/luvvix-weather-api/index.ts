
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon, location, action, weatherData } = await req.json();

    if (action === 'analyzeWeather' && weatherData) {
      // Generate AI analysis of weather
      const analysisPrompt = `Analysez ces données météo et donnez des conseils pratiques en français:
      
      Lieu: ${weatherData.location.name}, ${weatherData.location.country}
      Température: ${weatherData.current.temperature}°C (ressenti ${weatherData.current.feelsLike}°C)
      Conditions: ${weatherData.current.condition}
      Humidité: ${weatherData.current.humidity}%
      Vent: ${weatherData.current.windSpeed} km/h
      UV: ${weatherData.current.uvIndex}
      
      Donnez des conseils courts et pratiques (vêtements, activités recommandées, précautions à prendre).`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: analysisPrompt
            }]
          }]
        }),
      });

      const geminiData = await response.json();
      const analysis = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Analyse non disponible';

      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mock weather data for demonstration
    const weatherLocation = location || `${lat},${lon}` || 'Paris';
    
    const mockWeatherData = {
      location: {
        name: weatherLocation === 'Paris' ? 'Paris' : weatherLocation,
        region: 'Île-de-France',
        country: 'France'
      },
      current: {
        temperature: Math.floor(Math.random() * 25) + 5,
        condition: ['Ensoleillé', 'Nuageux', 'Partiellement nuageux', 'Pluvieux'][Math.floor(Math.random() * 4)],
        description: 'Conditions météo actuelles',
        feelsLike: Math.floor(Math.random() * 25) + 5,
        humidity: Math.floor(Math.random() * 40) + 40,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        windDirection: 'NO',
        uvIndex: Math.floor(Math.random() * 10) + 1,
        visibility: Math.floor(Math.random() * 10) + 5
      },
      forecast: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
        condition: ['Ensoleillé', 'Nuageux', 'Pluvieux'][Math.floor(Math.random() * 3)],
        maxTemp: Math.floor(Math.random() * 20) + 15,
        minTemp: Math.floor(Math.random() * 15) + 5,
        precipitation: Math.floor(Math.random() * 100),
        windSpeed: `${Math.floor(Math.random() * 15) + 5} km/h`
      })),
      hourly: Array.from({ length: 24 }, (_, i) => ({
        time: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
        temperature: Math.floor(Math.random() * 20) + 10,
        condition: ['Ensoleillé', 'Nuageux', 'Pluvieux'][Math.floor(Math.random() * 3)],
        precipitation: Math.floor(Math.random() * 100),
        windSpeed: `${Math.floor(Math.random() * 15) + 5} km/h`
      })),
      lastUpdated: new Date().toISOString()
    };

    return new Response(JSON.stringify({ weather: mockWeatherData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in weather API:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
