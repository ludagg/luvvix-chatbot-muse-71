
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface OAuthExchangeRequest {
  providerId: string;
  code: string;
  redirectUri: string;
}

const CLIENT_CONFIGS = {
  'google-drive': {
    tokenUrl: 'https://oauth2.googleapis.com/token',
    clientId: Deno.env.get('GOOGLE_DRIVE_CLIENT_ID'),
    clientSecret: Deno.env.get('GOOGLE_DRIVE_CLIENT_SECRET'),
  },
  'onedrive': {
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    clientId: Deno.env.get('ONEDRIVE_CLIENT_ID'),
    clientSecret: Deno.env.get('ONEDRIVE_CLIENT_SECRET'),
  },
  'dropbox': {
    tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
    clientId: Deno.env.get('DROPBOX_CLIENT_ID'),
    clientSecret: Deno.env.get('DROPBOX_CLIENT_SECRET'),
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { providerId, code, redirectUri }: OAuthExchangeRequest = await req.json()
    
    const config = CLIENT_CONFIGS[providerId as keyof typeof CLIENT_CONFIGS];
    if (!config) {
      throw new Error(`Provider ${providerId} not supported`);
    }

    if (!config.clientId || !config.clientSecret) {
      throw new Error(`Client credentials not configured for ${providerId}`);
    }

    console.log(`Exchanging OAuth code for ${providerId}`);

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: tokenParams.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OAuth exchange failed for ${providerId}:`, errorText);
      throw new Error(`OAuth exchange failed: ${response.status}`);
    }

    const tokenData = await response.json();
    console.log(`OAuth exchange successful for ${providerId}`);

    return new Response(
      JSON.stringify(tokenData),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('OAuth exchange error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
