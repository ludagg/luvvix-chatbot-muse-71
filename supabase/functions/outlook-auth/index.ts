
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
    const { action, authCode, refreshToken, accountId } = await req.json();
    
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

    if (action === 'connect') {
      // Échange du code d'autorisation contre des tokens
      const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('MICROSOFT_CLIENT_ID')!,
          client_secret: Deno.env.get('MICROSOFT_CLIENT_SECRET')!,
          code: authCode,
          grant_type: 'authorization_code',
          redirect_uri: `${new URL(req.url).origin}/mail`,
          scope: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read'
        }),
      });

      const tokens = await tokenResponse.json();
      
      if (!tokens.access_token) {
        throw new Error('Échec de l\'authentification Outlook');
      }

      // Récupérer les informations du profil
      const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      
      const profile = await profileResponse.json();

      // Sauvegarder le compte dans la base de données
      const { error: insertError } = await supabase
        .from('mail_accounts')
        .insert({
          user_id: user.id,
          email_address: profile.mail || profile.userPrincipalName,
          display_name: profile.displayName,
          provider: 'outlook',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          provider_config: {
            scope: 'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.Send'
          }
        });

      if (insertError) {
        throw new Error(`Erreur lors de la sauvegarde: ${insertError.message}`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Compte Outlook connecté avec succès',
        email: profile.mail || profile.userPrincipalName
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'refresh') {
      // Rafraîchir le token d'accès
      const { data: account } = await supabase
        .from('mail_accounts')
        .select('*')
        .eq('id', accountId)
        .eq('user_id', user.id)
        .single();

      if (!account) {
        throw new Error('Compte non trouvé');
      }

      const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: Deno.env.get('MICROSOFT_CLIENT_ID')!,
          client_secret: Deno.env.get('MICROSOFT_CLIENT_SECRET')!,
          refresh_token: account.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const tokens = await tokenResponse.json();

      // Mettre à jour le token d'accès
      await supabase
        .from('mail_accounts')
        .update({ 
          access_token: tokens.access_token,
          last_sync_at: new Date().toISOString()
        })
        .eq('id', accountId);

      return new Response(JSON.stringify({ 
        success: true, 
        access_token: tokens.access_token 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Erreur Outlook Auth:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
