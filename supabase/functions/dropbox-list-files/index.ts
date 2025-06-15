
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

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error("Non autorisé");
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (userError || !user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Optionally, allow path param to list a specific Dropbox folder
    const { path = "" } = await req.json();

    // Chercher le token Dropbox pour cet utilisateur
    const { data: connections, error: connError } = await supabase
      .from('cloud_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'dropbox')
      .eq('is_active', true)
      .limit(1);

    if (connError) throw connError;
    if (!connections || connections.length === 0) throw new Error("Aucun compte Dropbox connecté trouvé.");

    const dropboxToken = connections[0].access_token;

    // Appeler l'API Dropbox pour lister les fichiers
    const dropboxRes = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${dropboxToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        path,
        recursive: false,
        include_media_info: true,
        include_deleted: false,
        include_has_explicit_shared_members: false,
        include_mounted_folders: true,
        include_non_downloadable_files: false,
      })
    });

    if (!dropboxRes.ok) {
      const errorBody = await dropboxRes.text();
      throw new Error("Dropbox API error: " + errorBody);
    }

    const data = await dropboxRes.json();

    return new Response(JSON.stringify({
      success: true,
      files: data.entries,
      cursor: data.cursor,
      has_more: data.has_more,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Erreur Dropbox listing:", error?.message || error);
    return new Response(JSON.stringify({ error: error.message || "Erreur" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
