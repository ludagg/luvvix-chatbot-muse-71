
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Les endpoints Koofr OAuth
const KOOFR_AUTH_URL = "https://app.koofr.net/oauth2/authorize";
const KOOFR_TOKEN_URL = "https://app.koofr.net/oauth2/token";
const KOOFR_API_URL = "https://app.koofr.net/api/v2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Non autorisé");
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userError || !user) {
      throw new Error("Utilisateur non trouvé");
    }

    const url = new URL(req.url);
    const origin = url.origin;
    const redirectUri = `${origin}/functions/v1/koofr-oauth/callback`;

    // Parse l’action
    const body = req.method === "POST" ? await req.json() : {};
    const action = body.action;

    if (action === "get_auth_url") {
      const clientId = Deno.env.get("KOOFR_CLIENT_ID")!;
      const params = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
        scope: "offline files.read files.write user.info",
        state: "koofr",
        access_type: "offline",
        prompt: "consent"
      }).toString();
      return new Response(
        JSON.stringify({ auth_url: `${KOOFR_AUTH_URL}?${params}` }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "callback") {
      const { code } = body;
      if (!code) throw new Error("Code OAuth2 manquant");

      // Récupérer client id/secret sécurisés
      const clientId = Deno.env.get("KOOFR_CLIENT_ID")!;
      const clientSecret = Deno.env.get("KOOFR_CLIENT_SECRET")!;

      const tokenResp = await fetch(KOOFR_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        }),
      });
      const tokens = await tokenResp.json();
      if (!tokens.access_token) {
        throw new Error("Échec de l'obtention du token Koofr: " + JSON.stringify(tokens));
      }

      // Récupérer l'email utilisateur Koofr
      const userInfoRes = await fetch(`${KOOFR_API_URL}/userinfo`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const userInfo = await userInfoRes.json();

      // Stocker dans la table cloud_connections
      await supabase.from("cloud_connections").insert({
        user_id: user.id,
        provider: "koofr",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        account_info: {
          email: userInfo.email,
          display_name: userInfo.displayName,
        },
        connected_at: new Date().toISOString(),
        is_active: true
      });

      return new Response(
        JSON.stringify({ success: true, email: userInfo.email }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "disconnect") {
      // On désactive simplement la connexion
      await supabase.from("cloud_connections")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("provider", "koofr");
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Action non supportée : " + action);

  } catch (err) {
    console.error("Erreur Koofr OAuth:", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Erreur inconnue", details: err }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
