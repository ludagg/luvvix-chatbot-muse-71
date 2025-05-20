
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
    const { 
      endpoint_url, 
      api_key, 
      model_name, 
      provider, 
      embed_enabled = true, 
      quota_per_user = 100,
      max_tokens = 2000
    } = await req.json();
    
    // Si aucune clé API n'est fournie, vérifier celle existante ou une par défaut
    let finalApiKey = api_key;
    if (!finalApiKey) {
      // Essayer d'abord de récupérer la clé existante depuis les secrets
      try {
        const { data: secretData, error: secretError } = await supabase.rpc('get_edge_function_secret', {
          function_name: 'cerebras-chat',
          secret_name: 'CEREBRAS_API_KEY',
        });

        if (!secretError && secretData) {
          finalApiKey = secretData;
          console.log("Utilisation de la clé API existante");
        } else {
          // Utiliser la clé par défaut que vous avez fournie
          finalApiKey = "csk-enyey34chrpw34wmy8md698cxk3crdevnknrxe8649xtkjrv";
          console.log("Utilisation de la clé API par défaut");
        }
      } catch (e) {
        finalApiKey = "csk-enyey34chrpw34wmy8md698cxk3crdevnknrxe8649xtkjrv";
        console.log("Utilisation de la clé API par défaut (après erreur)");
      }
    } else {
      console.log("Utilisation de la nouvelle clé API fournie");
    }

    // Vérifier si la clé API est valide avec un appel de test avant de la sauvegarder
    try {
      const testEndpoint = endpoint_url || 'https://api.cerebras.ai/v1/chat/completions';
      const testModel = model_name || 'llama-4-scout-17b-16e-instruct';
      console.log(`Test de la clé API avec: ${testEndpoint}, modèle: ${testModel}`);
      
      const testResponse = await fetch(testEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${finalApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: testModel,
          messages: [
            { role: 'system', content: 'Vous êtes un assistant utile.' },
            { role: 'user', content: 'Dites "La clé API fonctionne correctement".' }
          ],
          max_tokens: 30,
          temperature: 0.3,
        }),
      });
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        console.error("Échec du test de la clé API:", errorText);
        throw new Error(`La clé API n'est pas valide: ${testResponse.status} ${testResponse.statusText} - ${errorText}`);
      } else {
        console.log("Test de la clé API réussi");
      }
    } catch (testError) {
      console.error("Erreur lors du test de la clé API:", testError);
      throw new Error(`Impossible de valider la clé API: ${testError.message}`);
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
        secret_value: model_name || 'llama-4-scout-17b-16e-instruct',
      });

      if (modelError) {
        throw new Error(`Erreur lors de la configuration du secret CEREBRAS_MODEL: ${modelError.message}`);
      }
      
      // Configurer également pour la fonction d'embedding
      await supabase.rpc('set_edge_function_secret', {
        function_name: 'cerebras-embed',
        secret_name: 'CEREBRAS_MODEL',
        secret_value: model_name || 'llama-4-scout-17b-16e-instruct',
      });
    }
    
    // Configuration pour l'intégration
    const { error: embedEnabledError } = await supabase.rpc('set_edge_function_secret', {
      function_name: 'cerebras-embed',
      secret_name: 'EMBED_ENABLED',
      secret_value: embed_enabled ? 'true' : 'false',
    });

    if (embedEnabledError) {
      throw new Error(`Erreur lors de la configuration du secret EMBED_ENABLED: ${embedEnabledError.message}`);
    }
    
    // Mettre à jour ou insérer la configuration dans la table ai_admin_config
    const { data: existingConfig } = await supabase
      .from('ai_admin_config')
      .select('id')
      .limit(1)
      .maybeSingle();
      
    if (existingConfig) {
      // Mise à jour de la configuration existante
      const { error: updateError } = await supabase
        .from('ai_admin_config')
        .update({
          endpoint_url: endpoint_url || 'https://api.cerebras.ai/v1/chat/completions',
          api_key: finalApiKey,
          model_name: model_name || 'llama-4-scout-17b-16e-instruct',
          quota_per_user: quota_per_user,
          max_tokens: max_tokens,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConfig.id);
        
      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour de la configuration: ${updateError.message}`);
      }
    } else {
      // Création d'une nouvelle configuration
      const { error: insertError } = await supabase
        .from('ai_admin_config')
        .insert({
          endpoint_url: endpoint_url || 'https://api.cerebras.ai/v1/chat/completions',
          api_key: finalApiKey,
          model_name: model_name || 'llama-4-scout-17b-16e-instruct',
          quota_per_user: quota_per_user,
          max_tokens: max_tokens
        });
        
      if (insertError) {
        throw new Error(`Erreur lors de la création de la configuration: ${insertError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Configuration Cerebras sauvegardée et validée avec succès',
        embed_enabled: embed_enabled,
        quota_per_user: quota_per_user,
        max_tokens: max_tokens
      }),
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
