
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = 'AIzaSyAwoG5ldTXX8tEwdN-Df3lzWWT4ZCfOQPE';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, from = 'auto', to = 'en', context = 'General' } = await req.json();
    
    if (!text) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required parameter: text'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Translation request: ${text} (${from} -> ${to})`);

    const prompt = `You are a professional translator. Translate the following text from ${from === 'auto' ? 'the detected language' : from} to ${to}.

Rules:
1. Provide ONLY the translation, no explanations
2. Maintain the original tone and style
3. Consider cultural context and idioms
4. For technical terms, use appropriate technical vocabulary

${context ? `Context: ${context}` : ''}

Text to translate: "${text}"

Translation:`;

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
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!translatedText) {
      throw new Error('No translation received');
    }

    // Detect source language if auto-detect was requested
    let detectedLanguage = from;
    if (from === 'auto') {
      const detectPrompt = `Detect the language of this text and respond with ONLY the language code (en, fr, es, de, etc.): "${text}"`;
      
      const detectResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: detectPrompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 10 }
        }),
      });
      
      if (detectResponse.ok) {
        const detectData = await detectResponse.json();
        detectedLanguage = detectData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'unknown';
      }
    }

    console.log(`Translation successful: ${detectedLanguage} -> ${to}`);

    return new Response(JSON.stringify({
      success: true,
      data: {
        translatedText,
        detectedLanguage,
        fromLanguage: detectedLanguage,
        toLanguage: to,
        confidence: 0.95,
        originalText: text
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Translation failed'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
