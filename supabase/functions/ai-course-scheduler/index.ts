
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
    
    console.log('🤖 LuvviX AI - Génération automatique de cours');
    
    // Déclencher la génération de cours via l'AI Course Manager
    const { data, error } = await supabase.functions.invoke('ai-course-manager', {
      body: { 
        action: 'auto_generate_hourly'
      }
    });

    if (error) {
      console.error('Erreur génération automatique:', error);
      throw error;
    }

    console.log('✅ Cours généré automatiquement:', data?.course?.title);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Cours généré automatiquement par LuvviX AI',
      course: data?.course
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur planificateur IA:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
