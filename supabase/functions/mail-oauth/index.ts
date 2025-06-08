
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const MICROSOFT_CLIENT_ID = Deno.env.get("MICROSOFT_CLIENT_ID");
const MICROSOFT_CLIENT_SECRET = Deno.env.get("MICROSOFT_CLIENT_SECRET");

const serve_handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, provider, email, redirect_uri, code, state, user_id } = await req.json();

    if (action === 'generate_auth_url') {
      let authUrl = '';
      const stateParam = btoa(JSON.stringify({ provider, email, user_id }));

      switch (provider) {
        case 'gmail':
          authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
            `client_id=${GOOGLE_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(redirect_uri)}&` +
            `scope=${encodeURIComponent('https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/userinfo.email')}&` +
            `response_type=code&` +
            `access_type=offline&` +
            `prompt=consent&` +
            `state=${stateParam}`;
          break;

        case 'outlook':
          authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
            `client_id=${MICROSOFT_CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(redirect_uri)}&` +
            `scope=${encodeURIComponent('https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/User.Read')}&` +
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
      const stateData = JSON.parse(atob(state));
      let tokenResponse;

      switch (stateData.provider) {
        case 'gmail':
          tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: GOOGLE_CLIENT_ID!,
              client_secret: GOOGLE_CLIENT_SECRET!,
              code: code,
              grant_type: 'authorization_code',
              redirect_uri: 'postmessage'
            })
          });
          break;

        case 'outlook':
          tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              client_id: MICROSOFT_CLIENT_ID!,
              client_secret: MICROSOFT_CLIENT_SECRET!,
              code: code,
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

      return new Response(JSON.stringify({
        provider: stateData.provider,
        email_address: stateData.email,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error("Error in mail-oauth function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(serve_handler);
