
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
    if (!authHeader) throw new Error("Non autorisé");

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) throw new Error('Utilisateur non trouvé');

    const { path } = await req.json();

    // Récupérer le token Dropbox de l'utilisateur
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

    // Appeler l'API Dropbox pour télécharger le fichier
    const dropboxRes = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${dropboxToken}`,
        "Dropbox-API-Arg": JSON.stringify({ path })
      }
    });

    if (!dropboxRes.ok) {
      const errorBody = await dropboxRes.text();
      throw new Error("Dropbox API error: " + errorBody);
    }

    const fileBuffer = await dropboxRes.arrayBuffer();

    // Extraire le nom du fichier de l'entête Dropbox-API-Result ou du path
    let fileName = "file";
    const apiResult = dropboxRes.headers.get("dropbox-api-result");
    if (apiResult) {
      try {
        const meta = JSON.parse(apiResult);
        fileName = meta.name || fileName;
      } catch {}
    } else if (path) {
      fileName = path.split('/').pop() || fileName;
    }

    return new Response(fileBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`
      }
    });
  } catch (error) {
    console.error("Erreur Dropbox download:", error?.message || error);
    return new Response(JSON.stringify({ error: error.message || "Erreur" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
