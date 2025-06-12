
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');
    const city = url.searchParams.get('city');
    const days = url.searchParams.get('days') || '3';

    let latitude: number, longitude: number;

    if (lat && lon) {
      latitude = parseFloat(lat);
      longitude = parseFloat(lon);
    } else if (city) {
      // Geocoding using Nominatim
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`
      );
      const geocodeData = await geocodeResponse.json();
      
      if (!geocodeData || geocodeData.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'City not found'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      latitude = parseFloat(geocodeData[0].lat);
      longitude = parseFloat(geocodeData[0].lon);
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameters: lat/lon or city'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Weather request for: ${latitude}, ${longitude}`);

    // Get weather data from Open-Meteo
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=${days}`
    );

    if (!weatherResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await weatherResponse.json();

    // Get location name
    const reverseGeocodeResponse = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=en`
    );
    
    let locationName = 'Unknown Location';
    if (reverseGeocodeResponse.ok) {
      const locationData = await reverseGeocodeResponse.json();
      locationName = locationData.display_name || locationName;
    }

    console.log(`Weather data retrieved for: ${locationName}`);

    return new Response(JSON.stringify({
      success: true,
      data: {
        location: {
          latitude,
          longitude,
          name: locationName
        },
        current: weatherData.current,
        daily: weatherData.daily,
        timezone: weatherData.timezone,
        units: {
          current: weatherData.current_units,
          daily: weatherData.daily_units
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Weather API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Weather data fetch failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
