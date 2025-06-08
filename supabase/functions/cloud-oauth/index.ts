
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OAuthRequest {
  action: 'generate_auth_url' | 'handle_callback';
  provider: string;
  redirect_uri?: string;
  code?: string;
  state?: string;
  user_id?: string;
}

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const DROPBOX_CLIENT_ID = Deno.env.get("DROPBOX_CLIENT_ID");
const DROPBOX_CLIENT_SECRET = Deno.env.get("DROPBOX_CLIENT_SECRET");
const MICROSOFT_CLIENT_ID = Deno.env.get("MICROSOFT_CLIENT_ID");
const MICROSOFT_CLIENT_SECRET = Deno.env.get("MICROSOFT_CLIENT_SECRET");

const serve_handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, provider, redirect_uri, code, state, user_id }: OAuthRequest = await req.json();

    if (action === 'generate_auth_url') {
      let authUrl = '';
      const stateParam = btoa(JSON.stringify({ provider, user_id }));

      switch (provider) {
        case 'google_drive':
          authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
            `client_id=${GOOGLE_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(redirect_uri!)}&` +
            `scope=${encodeURIComponent('https://www.googleapis.com/auth/drive')}&` +
            `response_type=code&` +
            `access_type=offline&` +
            `prompt=consent&` +
            `state=${stateParam}`;
          break;

        case 'dropbox':
          authUrl = `https://www.dropbox.com/oauth2/authorize?` +
            `client_id=${DROPBOX_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(redirect_uri!)}&` +
            `response_type=code&` +
            `token_access_type=offline&` +
            `state=${stateParam}`;
          break;

        case 'onedrive':
          authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
            `client_id=${MICROSOFT_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(redirect_uri!)}&` +
            `scope=${encodeURIComponent('https://graph.microsoft.com/Files.ReadWrite')}&` +
            `response_type=code&` +
            `state=${stateParam}`;
          break;

        default:
          throw new Error(`Provider ${provider} not supported`);
      }

      return new Response(JSON.stringify({ auth_url: authUrl }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (action === 'handle_callback') {
      const stateData = JSON.parse(atob(state!));
      let tokenResponse;

      switch (stateData.provider) {
        case 'google_drive':
          tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: GOOGLE_CLIENT_ID!,
              client_secret: GOOGLE_CLIENT_SECRET!,
              code: code!,
              grant_type: 'authorization_code',
              redirect_uri: 'postmessage'
            })
          });
          break;

        case 'dropbox':
          tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: DROPBOX_CLIENT_ID!,
              client_secret: DROPBOX_CLIENT_SECRET!,
              code: code!,
              grant_type: 'authorization_code'
            })
          });
          break;

        case 'onedrive':
          tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: MICROSOFT_CLIENT_ID!,
              client_secret: MICROSOFT_CLIENT_SECRET!,
              code: code!,
              grant_type: 'authorization_code',
              redirect_uri: 'postmessage'
            })
          });
          break;

        default:
          throw new Error(`Provider ${stateData.provider} not supported`);
      }

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`);
      }

      // Récupérer les informations du compte
      let accountInfo;
      switch (stateData.provider) {
        case 'google_drive':
          const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
          });
          accountInfo = await userResponse.json();
          break;

        case 'dropbox':
          const dbUserResponse = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
            method: 'POST',
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
          });
          accountInfo = await dbUserResponse.json();
          break;

        case 'onedrive':
          const msUserResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
          });
          accountInfo = await msUserResponse.json();
          break;
      }

      return new Response(JSON.stringify({
        provider: stateData.provider,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
        account_info: accountInfo
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error("Error in cloud-oauth function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(serve_handler);
