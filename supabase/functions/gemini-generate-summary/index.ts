
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const { query, results, language = 'fr' } = await req.json();

    if (!query || !results || !Array.isArray(results)) {
      throw new Error('Query and results array are required');
    }

    // Construire le prompt pour le résumé
    const resultsText = results.map(result => 
      `- ${result.title}: ${result.description}`
    ).join('\n');

    const languagePrompts = {
      fr: `Créez un résumé intelligent et informatif des résultats de recherche suivants pour la requête "${query}". 
           Synthétisez les informations clés, identifiez les tendances et fournissez des insights utiles.
           
           Résultats:
           ${resultsText}
           
           Répondez en français avec un résumé de 2-3 paragraphes maximum.`,
      en: `Create an intelligent and informative summary of the following search results for the query "${query}".
           Synthesize key information, identify trends and provide useful insights.
           
           Results:
           ${resultsText}
           
           Respond in English with a summary of 2-3 paragraphs maximum.`,
      es: `Crea un resumen inteligente e informativo de los siguientes resultados de búsqueda para la consulta "${query}".
           Sintetiza la información clave, identifica tendencias y proporciona conocimientos útiles.
           
           Resultados:
           ${resultsText}
           
           Responde en español con un resumen de máximo 2-3 párrafos.`
    };

    const prompt = languagePrompts[language as keyof typeof languagePrompts] || languagePrompts.fr;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.4,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summary) {
      throw new Error('No summary generated');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      summary: summary.trim(),
      query,
      language,
      resultsCount: results.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating summary:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
