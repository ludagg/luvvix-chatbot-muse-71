
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { query, results } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const prompt = `En tant qu'assistant de recherche LuvviX AI, analyse ces résultats de recherche et génère un résumé structuré et utile.

Requête de recherche: "${query}"

Résultats à analyser:
${results.map((r: any, i: number) => `
${i + 1}. **${r.title}** (${r.type} - ${r.source})
   ${r.snippet}
   URL: ${r.url}
`).join('\n')}

Génère un résumé avec:
- Une vue d'ensemble claire
- Les points clés identifiés
- Des insights sur la qualité des sources
- Des suggestions pour approfondir
- Une section "Actions recommandées" avec des intégrations LuvviX possibles

Format: Markdown avec émojis pour la lisibilité.`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
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
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Impossible de générer un résumé pour le moment.'

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Erreur:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
