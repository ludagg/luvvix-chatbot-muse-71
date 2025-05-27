
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
    const GROQ_API_KEY = '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';

    const { prompt, language, context } = await req.json();

    const codePrompt = `
You are an expert programmer. Generate production-ready ${language} code based on this request:

${prompt}

${context ? `\nExisting code context:\n\`\`\`${language}\n${context}\n\`\`\`` : ''}

Requirements:
- Write clean, efficient, and well-documented code
- Follow ${language} best practices and conventions
- Include proper error handling where appropriate
- Add meaningful comments for complex logic
- Ensure code is production-ready and secure
- Use modern ${language} features and patterns

Return your response as a JSON object with:
{
  "code": "the generated code",
  "explanation": "detailed explanation of the code functionality and approach",
  "language": "${language}",
  "complexity": number (1-10 scale based on algorithm complexity)
}

IMPORTANT: Return ONLY the JSON object, no additional text or markdown.
`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-70b-versatile',
        messages: [{
          role: 'user',
          content: codePrompt
        }],
        temperature: 0.3,
        max_tokens: 2048,
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content;

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
