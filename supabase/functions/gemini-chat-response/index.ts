
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
    const { message, context } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const contextText = context?.length > 0 ? `
Contexte des résultats de recherche disponibles:
${context.map((r: any, i: number) => `${i + 1}. ${r.title}: ${r.snippet}`).join('\n')}
` : ''

    const prompt = `Tu es l'assistant IA de LuvviX Explore, spécialisé dans l'aide à la recherche et l'analyse d'informations.

${contextText}

Message de l'utilisateur: "${message}"

Réponds de manière utile et personnalisée. Tu peux:
- Analyser et expliquer les résultats
- Suggérer des recherches complémentaires
- Proposer des actions LuvviX (créer un formulaire, publier sur Center, traduire, créer un agent IA, etc.)
- Donner des conseils pratiques

Reste concis mais informatif. Utilise des émojis pour rendre la réponse plus engageante.`

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
          maxOutputTokens: 512,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Je ne peux pas traiter votre demande pour le moment.'

    return new Response(
      JSON.stringify({ response: aiResponse }),
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
