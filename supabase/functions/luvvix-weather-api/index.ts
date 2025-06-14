
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const method = req.method;

    if (method === 'GET' && url.pathname.endsWith('/current')) {
      const lat = url.searchParams.get('lat');
      const lon = url.searchParams.get('lon');
      const city = url.searchParams.get('city');

      // Simuler les données météo (à remplacer par une vraie API)
      const weatherData = {
        current: {
          temperature: Math.round(15 + Math.random() * 20),
          condition: 'Ensoleillé',
          description: 'Ciel dégagé avec quelques nuages épars',
          icon: '☀️',
          humidity: Math.round(40 + Math.random() * 40),
          windSpeed: Math.round(5 + Math.random() * 15),
          windDirection: 'NE',
          visibility: Math.round(8 + Math.random() * 7),
          uvIndex: Math.round(1 + Math.random() * 10),
          pressure: Math.round(1000 + Math.random() * 40),
          feelsLike: Math.round(15 + Math.random() * 20)
        },
        location: {
          name: city || 'Paris',
          country: 'France',
          region: 'Île-de-France',
          coordinates: { lat: parseFloat(lat) || 48.8566, lon: parseFloat(lon) || 2.3522 }
        },
        forecast: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
          maxTemp: Math.round(18 + Math.random() * 15),
          minTemp: Math.round(8 + Math.random() * 10),
          condition: ['Ensoleillé', 'Nuageux', 'Pluvieux', 'Orageux'][Math.floor(Math.random() * 4)],
          icon: ['☀️', '☁️', '🌧️', '⛈️'][Math.floor(Math.random() * 4)],
          humidity: Math.round(40 + Math.random() * 40),
          windSpeed: Math.round(5 + Math.random() * 15),
          precipitation: Math.round(Math.random() * 20)
        })),
        hourly: Array.from({ length: 24 }, (_, i) => ({
          time: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
          temperature: Math.round(15 + Math.random() * 10),
          condition: ['Ensoleillé', 'Nuageux', 'Pluvieux'][Math.floor(Math.random() * 3)],
          icon: ['☀️', '☁️', '🌧️'][Math.floor(Math.random() * 3)],
          precipitation: Math.round(Math.random() * 15),
          windSpeed: Math.round(5 + Math.random() * 10)
        })),
        lastUpdated: new Date().toISOString()
      };

      return new Response(JSON.stringify(weatherData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'POST' && url.pathname.endsWith('/ai-analysis')) {
      const { weatherData } = await req.json();
      const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
      
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analysez ces conditions météo et donnez des conseils pratiques : Température: ${weatherData.temperature}°C, Condition: ${weatherData.condition}, Humidité: ${weatherData.humidity}%, Vent: ${weatherData.windSpeed} km/h, UV: ${weatherData.uvIndex}. Répondez en français en 2-3 phrases courtes.`
            }]
          }]
        })
      });

      const geminiData = await response.json();
      const analysis = geminiData.candidates[0]?.content?.parts[0]?.text || 'Analyse non disponible';

      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'GET' && url.pathname.endsWith('/preferences')) {
      const { data, error } = await supabaseClient
        .from('weather_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return new Response(JSON.stringify(data || {}), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'POST' && url.pathname.endsWith('/preferences')) {
      const preferences = await req.json();
      
      const { data, error } = await supabaseClient
        .from('weather_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Weather API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
