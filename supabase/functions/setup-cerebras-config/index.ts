
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Récupérer les variables d'environnement
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Créer un client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Récupérer les données envoyées dans la requête
    const { endpoint_url, api_key, model_name, provider } = await req.json();
    
    // Si aucune clé API n'est fournie, utiliser celle qui existe déjà
    let finalApiKey = api_key;
    if (!finalApiKey) {
      // Utiliser la clé par défaut "csk-enyey34chrpw34wmy8md698cxk3crdevnknrxe8649xtkjrv"
      finalApiKey = "csk-enyey34chrpw34wmy8md698cxk3crdevnknrxe8649xtkjrv";
      console.log("Utilisation de la clé API par défaut");
    }

    // Stocker la clé API comme secret dans les fonctions Edge
    const { error: secretError } = await supabase.rpc('set_edge_function_secret', {
      function_name: 'cerebras-chat',
      secret_name: 'CEREBRAS_API_KEY',
      secret_value: finalApiKey,
    });

    if (secretError) {
      throw new Error(`Erreur lors de la configuration du secret CEREBRAS_API_KEY: ${secretError.message}`);
    }

    // Stocker la clé API pour la fonction d'embedding également
    const { error: embedSecretError } = await supabase.rpc('set_edge_function_secret', {
      function_name: 'cerebras-embed',
      secret_name: 'CEREBRAS_API_KEY',
      secret_value: finalApiKey,
    });

    if (embedSecretError) {
      throw new Error(`Erreur lors de la configuration du secret CEREBRAS_API_KEY pour l'embedding: ${embedSecretError.message}`);
    }

    // Stocker l'URL de l'endpoint comme secret
    if (endpoint_url) {
      const { error: endpointError } = await supabase.rpc('set_edge_function_secret', {
        function_name: 'cerebras-chat',
        secret_name: 'CEREBRAS_ENDPOINT',
        secret_value: endpoint_url,
      });

      if (endpointError) {
        throw new Error(`Erreur lors de la configuration du secret CEREBRAS_ENDPOINT: ${endpointError.message}`);
      }
      
      // Configurer également pour la fonction d'embedding
      await supabase.rpc('set_edge_function_secret', {
        function_name: 'cerebras-embed',
        secret_name: 'CEREBRAS_ENDPOINT',
        secret_value: endpoint_url,
      });
    }

    // Stocker le nom du modèle comme secret
    if (model_name) {
      const { error: modelError } = await supabase.rpc('set_edge_function_secret', {
        function_name: 'cerebras-chat',
        secret_name: 'CEREBRAS_MODEL',
        secret_value: model_name,
      });

      if (modelError) {
        throw new Error(`Erreur lors de la configuration du secret CEREBRAS_MODEL: ${modelError.message}`);
      }
      
      // Configurer également pour la fonction d'embedding
      await supabase.rpc('set_edge_function_secret', {
        function_name: 'cerebras-embed',
        secret_name: 'CEREBRAS_MODEL',
        secret_value: model_name,
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Configuration Cerebras sauvegardée avec succès' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
