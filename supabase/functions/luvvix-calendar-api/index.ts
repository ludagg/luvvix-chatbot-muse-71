
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const method = req.method;
    const body = method !== 'GET' ? await req.json() : null;

    if (method === 'GET' && url.pathname.endsWith('/events')) {
      const { data, error } = await supabaseClient
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'POST' && url.pathname.endsWith('/events')) {
      const { data, error } = await supabaseClient
        .from('calendar_events')
        .insert([{
          ...body,
          user_id: user.id,
          start_time: new Date(body.start_time).toISOString(),
          end_time: new Date(body.end_time).toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'PUT' && url.pathname.includes('/events/')) {
      const eventId = url.pathname.split('/').pop();
      
      const { data, error } = await supabaseClient
        .from('calendar_events')
        .update({
          ...body,
          start_time: body.start_time ? new Date(body.start_time).toISOString() : undefined,
          end_time: body.end_time ? new Date(body.end_time).toISOString() : undefined,
        })
        .eq('id', eventId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (method === 'DELETE' && url.pathname.includes('/events/')) {
      const eventId = url.pathname.split('/').pop();
      
      const { error } = await supabaseClient
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Calendar API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
