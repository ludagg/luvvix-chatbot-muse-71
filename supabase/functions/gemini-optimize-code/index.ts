
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const { code, language } = await req.json();

    const optimizationPrompt = `
Optimize this ${language} code for better performance, readability, and maintainability:

\`\`\`${language}
${code}
\`\`\`

Optimization goals:
- Improve performance and efficiency
- Enhance readability and maintainability
- Apply modern ${language} best practices
- Reduce complexity where possible
- Fix potential bugs or issues
- Optimize memory usage
- Add proper error handling
- Use more efficient algorithms or data structures

Return a JSON object with:
{
  "code": "the optimized code with improvements",
  "explanation": "detailed explanation of all optimizations made and why they improve the code",
  "language": "${language}",
  "complexity": number (1-10 scale after optimization)
}

Focus on significant improvements that make the code faster, more readable, or more maintainable.
Only return the JSON, no additional text.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: optimizationPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const optimizedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!optimizedText) {
      throw new Error('No optimization generated');
    }

    // Extract JSON from the response
    const jsonMatch = optimizedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const optimized = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ 
      success: true, 
      optimized 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error optimizing code:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
