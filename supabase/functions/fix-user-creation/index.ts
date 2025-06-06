
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Mettre à jour la fonction handle_new_user pour éviter les doublons
    const { error } = await supabaseClient.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $function$
        DECLARE
          base_username TEXT;
          final_username TEXT;
          counter INTEGER := 1;
        BEGIN
          -- Générer un username unique basé sur l'email
          base_username := COALESCE(
            new.raw_user_meta_data->>'username',
            split_part(new.email, '@', 1)
          );
          
          -- Nettoyer le username
          base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9]', '', 'g'));
          
          -- Si le username est vide, utiliser un UUID tronqué
          IF base_username = '' OR base_username IS NULL THEN
            base_username := 'user_' || substring(replace(gen_random_uuid()::text, '-', ''), 1, 8);
          END IF;
          
          final_username := base_username;
          
          -- Vérifier l'unicité et ajouter un suffixe si nécessaire
          WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE username = final_username) LOOP
            final_username := base_username || '_' || counter;
            counter := counter + 1;
          END LOOP;
          
          INSERT INTO public.user_profiles (id, full_name, username)
          VALUES (
            new.id, 
            COALESCE(new.raw_user_meta_data->>'full_name', ''),
            final_username
          );
          
          RETURN new;
        END;
        $function$;
      `
    });

    if (error) {
      console.error('Erreur SQL:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Fonction handle_new_user mise à jour' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
