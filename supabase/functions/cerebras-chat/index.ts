
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation, systemPrompt, maxTokens, agentId } = await req.json();
    
    // Récupérer la clé API et la configuration depuis les secrets de Supabase
    const cerebrasApiKey = Deno.env.get('CEREBRAS_API_KEY') || '';
    const endpoint = Deno.env.get('CEREBRAS_ENDPOINT') || 'https://api.cerebras.ai/v1/completions';
    const modelName = Deno.env.get('CEREBRAS_MODEL') || 'cerebras/Cerebras-GPT-4.5-8B-Base';
    
    if (!cerebrasApiKey) {
      throw new Error('Clé API Cerebras non configurée');
    }

    let finalSystemPrompt = systemPrompt;
    
    // Si un agentId est fourni, rechercher le prompt système associé dans la base de données
    if (agentId) {
      const { data: agent, error } = await supabase
        .from('ai_agents')
        .select('system_prompt, name')
        .eq('id', agentId)
        .single();

      if (error) {
        throw new Error(`Erreur lors de la récupération de l'agent: ${error.message}`);
      }

      if (agent) {
        finalSystemPrompt = agent.system_prompt;
        
        // Incrémenter le compteur de vues pour cet agent
        await supabase.rpc('increment_agent_views', { agent_id: agentId });
      }
    }

    // Construire les messages pour l'API
    const messages = [];
    
    // Ajouter le message système s'il existe
    if (finalSystemPrompt) {
      messages.push({
        role: 'system',
        content: finalSystemPrompt
      });
    }
    
    // Ajouter les messages de la conversation
    conversation.forEach((msg: { role: string; content: string }) => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Appeler l'API Cerebras
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cerebrasApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: messages,
        max_tokens: maxTokens || 2000,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cerebras API error:', errorData);
      throw new Error(`Erreur API Cerebras: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({
      reply: data.choices[0].message.content,
      usage: data.usage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in cerebras-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
