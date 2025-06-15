
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

    const { action, code } = await req.json();

    const frontendUrl = Deno.env.get("FRONTEND_URL")!;
    if (!frontendUrl) {
      throw new Error("FRONTEND_URL secret is not set in Supabase.");
    }
    const redirectUri = `${frontendUrl}/auth/dropbox/callback`;

    if (action === 'get_auth_url') {
      // Générer l'URL d'autorisation Dropbox
      const clientId = Deno.env.get('DROPBOX_CLIENT_ID');
      if (!clientId) {
        throw new Error('DROPBOX_CLIENT_ID non configuré');
      }

      const scope = 'files.content.write files.content.read files.metadata.read account_info.read';
      
      const authUrl = `https://www.dropbox.com/oauth2/authorize?` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}`;

      console.log('Generated Dropbox auth URL:', authUrl);
      console.log('Redirect URI for Dropbox:', redirectUri);

      return new Response(JSON.stringify({ 
        auth_url: authUrl 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'exchange_token') {
      if (!code) {
        throw new Error('Code d\'autorisation manquant');
      }

      // Échanger le code contre des tokens
      const clientId = Deno.env.get('DROPBOX_CLIENT_ID')!;
      const clientSecret = Deno.env.get('DROPBOX_CLIENT_SECRET')!;

      console.log('Échange du code Dropbox:', { code, redirectUri });

      const tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Erreur échange token Dropbox:', errorText);
        throw new Error('Erreur lors de l\'échange du token');
      }

      const tokens = await tokenResponse.json();
      console.log('Tokens reçus:', { hasAccessToken: !!tokens.access_token });

      // Récupérer les informations du compte
      const accountResponse = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      });

      if (!accountResponse.ok) {
        console.error('Erreur récupération compte Dropbox');
        throw new Error('Erreur lors de la récupération du compte');
      }

      const accountInfo = await accountResponse.json();
      console.log('Info compte Dropbox récupérées:', { email: accountInfo.email });

      // Sauvegarder la connexion en base
      const { error: dbError } = await supabase
        .from('cloud_connections')
        .upsert({
          user_id: user.id,
          provider: 'dropbox',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          account_info: {
            email: accountInfo.email,
            name: accountInfo.name?.display_name || '',
            account_id: accountInfo.account_id
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
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Action non supportée');

  } catch (error) {
    console.error('Erreur Dropbox OAuth:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
