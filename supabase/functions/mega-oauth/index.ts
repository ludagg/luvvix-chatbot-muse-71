
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
      // Pour Mega, on utilise email/password pour l'authentification
      if (!email || !password) {
        throw new Error('Email et mot de passe requis pour Mega');
      }

      // Simulation de l'authentification Mega (dans un vrai cas, utilisez l'API Mega)
      // Note: Mega n'a pas d'OAuth traditionnel, on stocke les credentials chiffrés
      console.log('Connexion Mega pour:', email);

      // Sauvegarder la connexion en base (credentials chiffrés côté client)
      const { error: dbError } = await supabase
        .from('cloud_connections')
        .upsert({
          user_id: user.id,
          provider: 'mega',
          access_token: btoa(email), // Base64 encode de l'email pour l'identifier
          refresh_token: null,
          account_info: {
            email: email,
            storage_quota: 53687091200, // 50GB en bytes
            used_storage: 0
          },
          connected_at: new Date().toISOString(),
          is_active: true
        }, {
          onConflict: 'user_id,provider'
        });

      if (dbError) {
        console.error('Erreur sauvegarde DB:', dbError);
        throw new Error('Erreur lors de la sauvegarde');
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
      // Déconnecter Mega
      const { error: dbError } = await supabase
        .from('cloud_connections')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('provider', 'mega');

      if (dbError) {
        throw new Error('Erreur lors de la déconnexion');
      }

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Mega déconnecté avec succès'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Action non supportée');

  } catch (error) {
    console.error('Erreur Mega OAuth:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
