
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

    const { prompt, language, context } = await req.json();

    const codePrompt = `
Generate production-ready ${language} code based on this request:

${prompt}

${context ? `\nExisting code context:\n\`\`\`${language}\n${context}\n\`\`\`` : ''}

Requirements:
- Write clean, efficient, and well-documented code
- Follow ${language} best practices and conventions
- Include proper error handling where appropriate
- Add meaningful comments for complex logic
- Ensure code is production-ready and secure
- Use modern ${language} features and patterns

Return a JSON object with:
{
  "code": "the generated code",
  "explanation": "detailed explanation of the code functionality and approach",
  "language": "${language}",
  "complexity": number (1-10 scale based on algorithm complexity)
}

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
            text: codePrompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
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
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error('No code generated');
    }

    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const generated = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ 
      success: true, 
      generated 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating code:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
