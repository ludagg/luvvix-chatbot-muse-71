
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

// Utilitaire pour transformer un fichier image Blob en base64 string
async function fileToBase64(file: Blob): Promise<string> {
  const buf = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return `data:${file.type};base64,${base64}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let message = "";
    let imageBase64: string | null = null;
    let contentType = "";

    // Support both JSON and multipart/form-data (pour image)
    if (req.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await req.formData();
      message = (form.get("message") as string) || "";
      const file = form.get("image");
      if (file && file instanceof File && file.size > 0) {
        imageBase64 = await fileToBase64(file);
        contentType = file.type;
      }
    } else {
      const { message: msg, image } = await req.json();
      message = msg || "";
      if (image) {
        imageBase64 = image;
      }
    }

    if (!geminiApiKey) throw new Error('Clé API Gemini manquante');

    // Crée la structure multimodale
    let promptParts = [];
    if (message) {
      promptParts.push({ text: message });
    }
    if (imageBase64) {
      promptParts.push({
        inlineData: {
          mimeType: contentType || "image/png",
          data: imageBase64.split(',')[1], // strip "data:mime;base64," prefix
        },
      });
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: promptParts }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      throw new Error(`Erreur API Gemini: ${geminiRes.status}`);
    }

    const result = await geminiRes.json();
    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Réponse Gemini invalide");
    }

    // Réponse textuelle + possibilité de retourner une image générée (si output multimodal)
    const responseText = result.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({ response: responseText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur dans gemini-chat-response:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
