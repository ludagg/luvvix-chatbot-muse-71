
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, text, texts, target_language, source_language } = await req.json();

    switch (action) {
      case 'get_languages':
        return new Response(JSON.stringify({
          languages: [
            { code: 'en', name: 'English', native_name: 'English', supported: true },
            { code: 'fr', name: 'French', native_name: 'Français', supported: true },
            { code: 'es', name: 'Spanish', native_name: 'Español', supported: true },
            { code: 'de', name: 'German', native_name: 'Deutsch', supported: true },
            { code: 'it', name: 'Italian', native_name: 'Italiano', supported: true },
            { code: 'pt', name: 'Portuguese', native_name: 'Português', supported: true },
            { code: 'ru', name: 'Russian', native_name: 'Русский', supported: true },
            { code: 'ja', name: 'Japanese', native_name: '日本語', supported: true },
            { code: 'ko', name: 'Korean', native_name: '한국어', supported: true },
            { code: 'zh', name: 'Chinese', native_name: '中文', supported: true },
            { code: 'ar', name: 'Arabic', native_name: 'العربية', supported: true },
            { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', supported: true }
          ]
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      case 'detect_language':
        const detectResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Detect the language of this text and respond with only the ISO 639-1 language code (like 'en', 'fr', 'es', etc.): "${text}"`
              }]
            }]
          })
        });

        const detectData = await detectResponse.json();
        const detectedLang = detectData.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() || 'unknown';

        return new Response(JSON.stringify({
          language: detectedLang,
          confidence: 0.95
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      case 'translate':
        const translateResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Translate this text to ${target_language}: "${text}". Respond with only the translation, no additional text.`
              }]
            }]
          })
        });

        const translateData = await translateResponse.json();
        const translatedText = translateData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;

        return new Response(JSON.stringify({
          translated_text: translatedText,
          detected_language: source_language || 'auto',
          confidence: 0.95
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      case 'translate_batch':
        const batchPromises = texts.map(async (textItem: string) => {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Translate this text to ${target_language}: "${textItem}". Respond with only the translation, no additional text.`
                }]
              }]
            })
          });

          const data = await response.json();
          const translated = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || textItem;

          return {
            text: translated,
            detected_language: source_language || 'auto',
            confidence: 0.95
          };
        });

        const batchResults = await Promise.all(batchPromises);

        return new Response(JSON.stringify({
          translations: batchResults
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error in luvvix-translate function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
