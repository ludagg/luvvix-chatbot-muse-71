
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'get_notifications': {
        const { data: notifications, error } = await supabaseClient
          .from('ai_notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, notifications }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'mark_read': {
        const notificationId = url.searchParams.get('id');
        const { error } = await supabaseClient
          .from('ai_notifications')
          .update({ read: true })
          .eq('id', notificationId)
          .eq('user_id', user.id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'generate_smart_notification': {
        const body = await req.json();
        const { context, service } = body;

        // Générer notification intelligente avec Gemini
        const prompt = `Créez une notification intelligente basée sur ce contexte: ${context}. 
        Service: ${service}. 
        Répondez uniquement avec un JSON contenant "title" et "message" en français.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 200 }
          }),
        });

        const aiData = await response.json();
        const aiResponse = aiData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        let notification;
        try {
          notification = JSON.parse(aiResponse.replace(/```json|```/g, ''));
        } catch {
          notification = {
            title: "Notification IA",
            message: "Nouvelle notification générée par l'IA"
          };
        }

        const { data: newNotification, error } = await supabaseClient
          .from('ai_notifications')
          .insert({
            user_id: user.id,
            title: notification.title,
            message: notification.message,
            type: 'ai_generated',
            source_service: service,
            data: { context }
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ success: true, notification: newNotification }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('AI Notifications error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
