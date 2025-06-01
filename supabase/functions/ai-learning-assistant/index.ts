
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { message, userId, context } = await req.json();

    // Récupérer le contexte utilisateur
    const { data: userEnrollments } = await supabase
      .from('enrollments')
      .select('*, courses(*)')
      .eq('user_id', userId);

    const { data: recentAnalytics } = await supabase
      .from('learning_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(10);

    // Enregistrer l'interaction
    await supabase
      .from('learning_analytics')
      .insert({
        user_id: userId,
        action_type: 'ai_chat',
        session_data: { message, context }
      });

    const prompt = `Tu es LuvviX AI, un assistant pédagogique intelligent et bienveillant. Tu aides les étudiants dans leur apprentissage.

Contexte utilisateur:
- Cours inscrits: ${JSON.stringify(userEnrollments)}
- Activité récente: ${JSON.stringify(recentAnalytics)}
- Message: "${message}"
- Contexte: ${context || 'Aucun'}

Réponds de manière:
- Pédagogique et encourageante
- Personnalisée selon le profil
- Avec des suggestions concrètes
- En proposant des ressources ou exercices
- En gardant un ton amical et professionnel

Limite ta réponse à 200 mots maximum.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.7,
          maxOutputTokens: 300
        }
      }),
    });

    const geminiData = await response.json();
    const aiResponse = geminiData.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ 
      success: true, 
      response: aiResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur assistant IA:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "Désolé, je rencontre un problème technique. Peux-tu réessayer dans quelques instants ?"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
