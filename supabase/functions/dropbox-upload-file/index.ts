
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

    const contentType = req.headers.get("content-type") || "";
    // On accepte le body sous forme de FormData (pour blob)
    let dropboxPath = "";
    let uploadedFile: Uint8Array | ArrayBuffer | null = null;
    let fileName = "";
    let blobContentType = "application/octet-stream";
    if (contentType.startsWith("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      fileName = formData.get("filename")?.toString() || "file";
      dropboxPath = formData.get("path")?.toString() || "/" + fileName;
      blobContentType = formData.get("mimetype")?.toString() || file.type || "application/octet-stream";
      if (file && typeof file === "object" && "arrayBuffer" in file) {
        uploadedFile = await file.arrayBuffer();
      }
    } else if (contentType.startsWith("application/json")) {
      // support JSON { file (as base64 string), filename, path, mimetype }
      const body = await req.json();
      dropboxPath = body.path || "/" + (body.filename || "file");
      fileName = body.filename || "file";
      blobContentType = body.mimetype || "application/octet-stream";
      if (body.file) {
        // file as base64 string
        const binaryString = atob(body.file);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        uploadedFile = bytes.buffer;
      }
    } else {
      throw new Error("Content-Type must be multipart/form-data or application/json");
    }

    if (!uploadedFile) throw new Error("Fichier à uploader obligatoire");
    if (!dropboxPath) throw new Error("Chemin Dropbox manquant");

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

    // Appel de l’API Dropbox pour upload le fichier à la racine ou chemin précisé
    const dropboxRes = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${dropboxToken}`,
        "Dropbox-API-Arg": JSON.stringify({
          path: dropboxPath.startsWith("/") ? dropboxPath : "/" + dropboxPath,
          mode: "overwrite",
          autorename: false,
          mute: false,
          strict_conflict: false
        }),
        "Content-Type": blobContentType
      },
      body: uploadedFile
    });

    if (!dropboxRes.ok) {
      const errorBody = await dropboxRes.text();
      throw new Error("Dropbox API error: " + errorBody);
    }

    const result = await dropboxRes.json();

    return new Response(JSON.stringify({
      success: true,
      result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Erreur Dropbox upload:", error?.message || error);
    return new Response(JSON.stringify({ error: error.message || "Erreur" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
