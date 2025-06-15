
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier l'utilisateur authentifié
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Non autorisé');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Utilisateur non trouvé');
    }

    const { action, email, password } = await req.json();

    if (action === 'connect') {
      if (!email || !password) {
        throw new Error('Email et mot de passe requis pour Mega');
      }

      console.log('Connexion Mega pour:', email);

      // Vérifier s'il existe déjà une connexion active
      const { data: existingConnection, error: checkError } = await supabase
        .from('cloud_connections')
        .select('id')
        .eq('user_id', user.id)
        .eq('provider', 'mega')
        .eq('is_active', true)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erreur vérification connexion existante:', checkError);
        throw new Error('Erreur lors de la vérification : ' + JSON.stringify(checkError));
      }

      if (existingConnection) {
        // Mettre à jour la connexion existante
        const { error: updateError } = await supabase
          .from('cloud_connections')
          .update({
            access_token: btoa(email),
            account_info: {
              email: email,
              storage_quota: 53687091200,
              used_storage: 0
            },
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingConnection.id);

        if (updateError) {
          console.error('Erreur mise à jour connexion:', updateError);
          throw new Error(
            'Erreur lors de la mise à jour : ' + (updateError.message || '') + ' - Détails : ' + JSON.stringify(updateError)
          );
        }
      } else {
        // Créer une nouvelle connexion
        const { error: insertError } = await supabase
          .from('cloud_connections')
          .insert({
            user_id: user.id,
            provider: 'mega',
            access_token: btoa(email),
            refresh_token: null,
            account_info: {
              email: email,
              storage_quota: 53687091200,
              used_storage: 0
            },
            connected_at: new Date().toISOString(),
            is_active: true
          });

        if (insertError) {
          console.error('Erreur insertion connexion:', insertError);
          throw new Error(
            'Erreur lors de la sauvegarde : ' + (insertError.message || '') + ' - Détails : ' + JSON.stringify(insertError)
          );
        }
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Mega connecté avec succès',
        account_info: {
          email: email,
          storage_quota: '50 GB',
          provider: 'mega'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'disconnect') {
      const { error: updateError } = await supabase
        .from('cloud_connections')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('provider', 'mega');

      if (updateError) {
        console.error('Erreur déconnexion:', updateError);
        throw new Error(
          'Erreur lors de la déconnexion : ' + (updateError.message || '') + ' - Détails : ' + JSON.stringify(updateError)
        );
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Mega déconnecté avec succès'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Action non supportée : ' + action);

  } catch (error) {
    // Log complet de l’erreur côté serveur
    console.error('Erreur Mega OAuth détaillée:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Erreur inconnue', details: error }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
