
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid user');
    }

    const { action, eventData, eventId, updates } = await req.json();

    switch (action) {
      case 'getEvents': {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id)
          .order('start_date', { ascending: true });

        if (error) throw error;

        // Transform data to match frontend interface
        const events = data.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          start_time: event.start_date,
          end_time: event.end_date,
          event_type: event.event_type,
          priority: event.priority,
          location: event.location,
          attendees: event.attendees || [],
          color: event.color,
          completed: event.completed,
          user_id: event.user_id
        }));

        return new Response(JSON.stringify({ events }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'createEvent': {
        const { data, error } = await supabase
          .from('calendar_events')
          .insert({
            user_id: user.id,
            title: eventData.title,
            description: eventData.description,
            start_date: eventData.start_time,
            end_date: eventData.end_time,
            event_type: eventData.event_type,
            priority: eventData.priority,
            location: eventData.location,
            attendees: eventData.attendees || [],
            color: eventData.color,
            completed: eventData.completed || false
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ event: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'updateEvent': {
        const { data, error } = await supabase
          .from('calendar_events')
          .update({
            title: updates.title,
            description: updates.description,
            start_date: updates.start_time,
            end_date: updates.end_time,
            event_type: updates.event_type,
            priority: updates.priority,
            location: updates.location,
            attendees: updates.attendees,
            color: updates.color,
            completed: updates.completed
          })
          .eq('id', eventId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ event: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'deleteEvent': {
        const { error } = await supabase
          .from('calendar_events')
          .delete()
          .eq('id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Error in calendar API:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
