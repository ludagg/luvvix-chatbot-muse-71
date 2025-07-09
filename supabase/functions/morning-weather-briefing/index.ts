
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const supabase = createClient(supabaseUrl!, supabaseKey!);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🌅 Début du briefing météo matinal');

    // Récupérer tous les utilisateurs avec notifications activées
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .not('id', 'is', null);

    if (usersError) {
      console.error('Erreur récupération utilisateurs:', usersError);
      throw usersError;
    }

    console.log(`📱 ${users?.length || 0} utilisateurs trouvés`);

    const results = [];

    for (const user of users || []) {
      try {
        // Récupérer les données météo (simulation avec Open-Meteo)
        const weatherResponse = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=1'
        );
        
        if (!weatherResponse.ok) {
          throw new Error('Erreur API météo');
        }

        const weatherData = await weatherResponse.json();
        
        // Interpréter le code météo
        const getConditionFromCode = (code: number) => {
          if (code === 0) return 'ensoleillé';
          if ([1,2,3].includes(code)) return 'nuageux';
          if ([51,53,55,61,63,65].includes(code)) return 'pluvieux';
          if ([71,73,75].includes(code)) return 'neigeux';
          if ([95,96,99].includes(code)) return 'orageux';
          return 'variable';
        };

        const currentTemp = Math.round(weatherData.current.temperature_2m);
        const currentCondition = getConditionFromCode(weatherData.current.weather_code);
        const maxTemp = Math.round(weatherData.daily.temperature_2m_max[0]);
        const minTemp = Math.round(weatherData.daily.temperature_2m_min[0]);
        const precipitation = weatherData.daily.precipitation_sum[0];

        // Générer un briefing IA avec Gemini
        const briefingPrompt = `Créez un briefing météo matinal personnel et concis en français pour:

Météo actuelle: ${currentTemp}°C, ${currentCondition}
Prévisions: Min ${minTemp}°C, Max ${maxTemp}°C
Précipitations: ${precipitation}mm
Humidité: ${weatherData.current.relative_humidity_2m}%
Vent: ${Math.round(weatherData.current.wind_speed_10m)} km/h

Consignes:
- Maximum 2 phrases courtes
- Ton friendly et personnel 
- Conseils pratiques (vêtements, parapluie, etc.)
- Pas de formules de politesse
- Directement actionnable

Exemple: "15°C ce matin avec des averses prévues. Prenez un parapluie et une veste légère !"`;

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: briefingPrompt
              }]
            }]
          }),
        });

        if (!geminiResponse.ok) {
          throw new Error('Erreur Gemini API');
        }

        const geminiData = await geminiResponse.json();
        const briefing = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 
                        `${currentTemp}°C aujourd'hui, ${currentCondition}. Max ${maxTemp}°C.`;

        // Enregistrer la notification météo
        const { error: insertError } = await supabase
          .from('daily_weather_briefings')
          .insert({
            user_id: user.id,
            weather_data: {
              temperature: currentTemp,
              condition: currentCondition,
              maxTemp,
              minTemp,
              precipitation,
              humidity: weatherData.current.relative_humidity_2m,
              windSpeed: Math.round(weatherData.current.wind_speed_10m)
            },
            ai_briefing: briefing,
            sent_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`Erreur insertion briefing pour ${user.id}:`, insertError);
        } else {
          console.log(`✅ Briefing créé pour ${user.full_name || user.id}`);
          results.push({
            userId: user.id,
            briefing: briefing,
            weather: { currentTemp, currentCondition, maxTemp, minTemp }
          });
        }

      } catch (userError) {
        console.error(`Erreur pour l'utilisateur ${user.id}:`, userError);
      }
    }

    console.log(`🎯 ${results.length} briefings météo générés`);

    return new Response(JSON.stringify({ 
      success: true, 
      briefingsGenerated: results.length,
      results: results.slice(0, 5) // Limiter pour les logs
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur globale briefing météo:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
