
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
    const { provider, authCode } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    let tokenResponse;
    let profileData;

    switch (provider) {
      case 'google_drive':
        // Échange du code contre des tokens Google Drive
        tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
            client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
            code: authCode,
            grant_type: 'authorization_code',
            redirect_uri: `${new URL(req.url).origin}/cloud/oauth`,
          }),
        });

        const googleTokens = await tokenResponse.json();
        
        // Récupérer les informations du profil
        const googleProfileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${googleTokens.access_token}` },
        });
        profileData = await googleProfileResponse.json();

        // Sauvegarder la connexion
        await supabase
          .from('cloud_connections')
          .insert({
            user_id: user.id,
            provider: 'google_drive',
            access_token: googleTokens.access_token,
            refresh_token: googleTokens.refresh_token,
            account_info: {
              email: profileData.email,
              name: profileData.name,
              picture: profileData.picture
            }
          });
        break;

      case 'dropbox':
        // Échange du code contre des tokens Dropbox
        tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: Deno.env.get('DROPBOX_CLIENT_ID')!,
            client_secret: Deno.env.get('DROPBOX_CLIENT_SECRET')!,
            code: authCode,
            grant_type: 'authorization_code',
            redirect_uri: `${new URL(req.url).origin}/cloud/oauth`,
          }),
        });

        const dropboxTokens = await tokenResponse.json();
        
        // Récupérer les informations du compte
        const dropboxProfileResponse = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${dropboxTokens.access_token}`,
            'Content-Type': 'application/json'
          },
        });
        profileData = await dropboxProfileResponse.json();

        await supabase
          .from('cloud_connections')
          .insert({
            user_id: user.id,
            provider: 'dropbox',
            access_token: dropboxTokens.access_token,
            refresh_token: dropboxTokens.refresh_token,
            account_info: {
              email: profileData.email,
              name: profileData.name.display_name,
              account_id: profileData.account_id
            }
          });
        break;

      case 'onedrive':
        // Échange du code contre des tokens OneDrive
        tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: Deno.env.get('MICROSOFT_CLIENT_ID')!,
            client_secret: Deno.env.get('MICROSOFT_CLIENT_SECRET')!,
            code: authCode,
            grant_type: 'authorization_code',
            redirect_uri: `${new URL(req.url).origin}/cloud/oauth`,
          }),
        });

        const microsoftTokens = await tokenResponse.json();
        
        // Récupérer les informations du profil
        const microsoftProfileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${microsoftTokens.access_token}` },
        });
        profileData = await microsoftProfileResponse.json();

        await supabase
          .from('cloud_connections')
          .insert({
            user_id: user.id,
            provider: 'onedrive',
            access_token: microsoftTokens.access_token,
            refresh_token: microsoftTokens.refresh_token,
            account_info: {
              email: profileData.mail || profileData.userPrincipalName,
              name: profileData.displayName,
              id: profileData.id
            }
          });
        break;

      default:
        throw new Error('Provider non supporté');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `${provider} connecté avec succès`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur Cloud OAuth:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
