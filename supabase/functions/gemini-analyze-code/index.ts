
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

    const analysisPrompt = `
Analyze this ${language} code and provide a comprehensive analysis in JSON format:

\`\`\`${language}
${code}
\`\`\`

Return a JSON object with:
{
  "complexity": number (1-10 scale),
  "performance": number (0-100 percentage),
  "security": number (0-100 percentage), 
  "maintainability": number (0-100 percentage),
  "bugs": [
    {
      "line": number,
      "severity": "low|medium|high",
      "message": "description of the issue",
      "suggestion": "how to fix it"
    }
  ],
  "optimizations": [
    {
      "type": "Performance|Security|Readability|Memory",
      "description": "what can be optimized",
      "impact": "High|Medium|Low"
    }
  ]
}

Focus on real issues like:
- Potential bugs and logic errors
- Performance bottlenecks
- Security vulnerabilities
- Code smells and maintainability issues
- Memory leaks or inefficient algorithms
- Missing error handling
- Code complexity and readability

Be precise and actionable in your suggestions.
`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: analysisPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
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
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!analysisText) {
      throw new Error('No analysis generated');
    }

    // Extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ 
      success: true, 
      analysis 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error analyzing code:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
