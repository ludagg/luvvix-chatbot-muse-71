
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
    const { text, fromLanguage, toLanguage, context } = await req.json();
    
    if (!text) {
      throw new Error('No text provided for translation');
    }

    // Construct context-aware prompt for Gemini
    const prompt = `You are a professional translator with deep understanding of cultural nuances and context. 

Translate the following text from ${fromLanguage === 'auto' ? 'the detected language' : fromLanguage} to ${toLanguage}.

Rules:
1. Provide ONLY the translation, no explanations
2. Maintain the original tone and style
3. Consider cultural context and idioms
4. For technical terms, use appropriate technical vocabulary
5. If the text contains slang or colloquialisms, adapt them appropriately

${context ? `Context: ${context}` : ''}

Text to translate: "${text}"

Translation:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
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
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!translatedText) {
      throw new Error('No translation received from Gemini');
    }

    // Detect source language if auto-detect was requested
    let detectedLanguage = fromLanguage;
    if (fromLanguage === 'auto') {
      const detectPrompt = `Detect the language of this text and respond with ONLY the language code (en, fr, es, de, etc.): "${text}"`;
      
      const detectResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`, {
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

    return new Response(JSON.stringify({
      translatedText,
      detectedLanguage,
      confidence: 0.95,
      fromLanguage: detectedLanguage,
      toLanguage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      translatedText: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
