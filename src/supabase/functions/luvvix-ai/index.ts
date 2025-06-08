
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
    const { action, message, messages, context, max_tokens, temperature } = await req.json();

    switch (action) {
      case 'chat':
        const chatResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: message
              }]
            }],
            generationConfig: {
              temperature: temperature || 0.7,
              maxOutputTokens: max_tokens || 1000,
              topK: 40,
              topP: 0.95
            }
          })
        });

        const chatData = await chatResponse.json();
        const reply = chatData.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n\'ai pas pu générer une réponse.';

        return new Response(JSON.stringify({
          content: reply,
          model: 'gemini-1.5-flash',
          usage: {
            prompt_tokens: message.length / 4,
            completion_tokens: reply.length / 4,
            total_tokens: (message.length + reply.length) / 4
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      case 'conversation':
        const conversationHistory = messages.map((msg: any) => ({
          parts: [{ text: msg.content }]
        }));

        const conversationResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: conversationHistory,
            generationConfig: {
              temperature: temperature || 0.7,
              maxOutputTokens: max_tokens || 1000
            }
          })
        });

        const conversationData = await conversationResponse.json();
        const conversationReply = conversationData.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n\'ai pas pu générer une réponse.';

        return new Response(JSON.stringify({
          content: conversationReply,
          model: 'gemini-1.5-flash'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      case 'generate':
        const generateResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: context ? `Context: ${context}\n\nPrompt: ${message}` : message
              }]
            }],
            generationConfig: {
              temperature: temperature || 0.7,
              maxOutputTokens: max_tokens || 1500
            }
          })
        });

        const generateData = await generateResponse.json();
        const generatedText = generateData.candidates?.[0]?.content?.parts?.[0]?.text || 'Désolé, je n\'ai pas pu générer de contenu.';

        return new Response(JSON.stringify({
          content: generatedText,
          model: 'gemini-1.5-flash'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      case 'summarize':
        const summarizeResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Please summarize the following text in a concise manner: ${message}`
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: max_tokens || 300
            }
          })
        });

        const summarizeData = await summarizeResponse.json();
        const summary = summarizeData.candidates?.[0]?.content?.parts?.[0]?.text || 'Impossible de résumer le texte.';

        return new Response(JSON.stringify({
          content: summary,
          model: 'gemini-1.5-flash'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      case 'email_assist':
        const emailPrompt = `You are an intelligent email assistant. Help the user with: ${message}
        
        Provide a professional and helpful response. If the user is asking to compose an email, provide a well-structured email template. If they're asking for help with an existing email, provide suggestions for improvement.`;

        const emailResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: emailPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800
            }
          })
        });

        const emailData = await emailResponse.json();
        const emailReply = emailData.candidates?.[0]?.content?.parts?.[0]?.text || 'Je ne peux pas vous aider avec cet email pour le moment.';

        return new Response(JSON.stringify({
          content: emailReply,
          model: 'gemini-1.5-flash',
          type: 'email_assistance'
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Error in luvvix-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
