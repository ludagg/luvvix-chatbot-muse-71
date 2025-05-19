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

// Cache system for improved performance
const agentCache = new Map();
const contextCache = new Map();
const CACHE_TTL = 1800000; // 30 minutes

function getCachedAgent(id) {
  const cachedData = agentCache.get(id);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_TTL) {
    return cachedData.agent;
  }
  return null;
}

function setCachedAgent(id, agent) {
  agentCache.set(id, {
    timestamp: Date.now(),
    agent
  });
}

function getCachedContext(id) {
  const cachedData = contextCache.get(id);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_TTL) {
    return cachedData.context;
  }
  return null;
}

function setCachedContext(id, context) {
  contextCache.set(id, {
    timestamp: Date.now(),
    context
  });
}

// Function to analyze token usage and track quotas
async function trackUsage(userId, agentId, tokens) {
  try {
    // Get the admin configuration for quotas
    const { data: config } = await supabase
      .from('ai_admin_config')
      .select('quota_per_user')
      .limit(1)
      .maybeSingle();
      
    const quotaPerUser = config?.quota_per_user || 100;
    
    // If it's a registered user, check and update their quota
    if (userId) {
      // TODO: Implement usage tracking and quota management
      // This would typically update a user_ai_usage table
    }
    
    // Log usage for analytics regardless of user status
    console.log(`Usage - ${userId || 'Guest'} used ${tokens} tokens with agent ${agentId}`);
    
  } catch (error) {
    console.error('Error tracking usage:', error);
    // Don't throw - just log and continue
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation, systemPrompt, maxTokens, agentId, message, conversationId, sessionId, embedded = false } = await req.json();
    
    // Récupérer la clé API et la configuration depuis les secrets de Supabase
    const cerebrasApiKey = Deno.env.get('CEREBRAS_API_KEY') || '';
    const endpoint = Deno.env.get('CEREBRAS_ENDPOINT') || 'https://api.cerebras.ai/v1/completions';
    const modelName = Deno.env.get('CEREBRAS_MODEL') || 'cerebras/Cerebras-GPT-4.5-8B-Base';
    
    if (!cerebrasApiKey) {
      throw new Error('Clé API Cerebras non configurée');
    }

    let finalSystemPrompt = systemPrompt;
    let finalConversation = conversation || [];
    let finalConversationId = conversationId;
    let userId = null;
    let contextContent = "";
    
    // Si un agentId est fourni, rechercher le prompt système associé dans la base de données
    if (agentId) {
      // Check if we have the agent in cache
      let agent = getCachedAgent(agentId);
      
      // If not in cache, fetch from database
      if (!agent) {
        const { data, error } = await supabase
          .from('ai_agents')
          .select('system_prompt, name, objective, personality, user_id')
          .eq('id', agentId)
          .single();

        if (error) {
          throw new Error(`Erreur lors de la récupération de l'agent: ${error.message}`);
        }

        if (data) {
          agent = data;
          setCachedAgent(agentId, agent);
        }
      }

      if (agent) {
        // Store user ID for usage tracking
        userId = agent.user_id;
        
        // Construire le prompt système basé sur les attributs de l'agent
        finalSystemPrompt = agent.system_prompt || `Tu es ${agent.name}, `;
        
        if (!finalSystemPrompt && agent.name) {
          finalSystemPrompt = `Tu es ${agent.name}, `;
          
          if (agent.personality) {
            switch (agent.personality) {
              case 'expert':
                finalSystemPrompt += `un expert formel et précis dans ton domaine. `;
                break;
              case 'friendly':
                finalSystemPrompt += `avec une personnalité chaleureuse et décontractée. `;
                break;
              case 'concise':
                finalSystemPrompt += `avec un style direct et efficace. `;
                break;
              case 'empathetic':
                finalSystemPrompt += `avec une approche empathique et compréhensive. `;
                break;
              default:
                finalSystemPrompt += `avec une personnalité ${agent.personality}. `;
            }
          }
          
          if (agent.objective) {
            finalSystemPrompt += `Ton objectif est ${agent.objective}.`;
          }
        }
        
        // Check for context in cache first
        let contextData = getCachedContext(agentId);
        
        if (!contextData) {
          // Récupérer le contexte de l'agent depuis la base de données
          const { data: fetchedContextData, error: contextError } = await supabase
            .from('ai_agent_context')
            .select('content_type, content, url')
            .eq('agent_id', agentId);
            
          if (!contextError && fetchedContextData && fetchedContextData.length > 0) {
            contextData = fetchedContextData;
            setCachedContext(agentId, contextData);
          }
        }
        
        // Ajouter le contenu du contexte au prompt système
        if (contextData && contextData.length > 0) {
          contextContent = "\n\nVoici des informations supplémentaires à connaître:\n\n";
          
          for (const ctx of contextData) {
            if (ctx.content_type === "text" && ctx.content) {
              contextContent += ctx.content + "\n\n";
            } else if (ctx.content_type === "url" && ctx.url) {
              contextContent += `Information provenant de: ${ctx.url}\n\n`;
            }
          }
        }
        
        // Incrémenter le compteur de vues pour cet agent s'il n'est pas intégré
        if (!embedded) {
          try {
            await supabase.rpc('increment_agent_views', { agent_id: agentId });
          } catch (error) {
            console.error('Failed to increment views:', error);
            // Non-critical, continue execution
          }
        }
        
        // Si c'est une session intégrée, gérer la conversation
        if (sessionId) {
          // Vérifier si une conversation existe déjà pour cette session
          if (conversationId) {
            // Récupérer les messages existants
            const { data: existingMessages } = await supabase
              .from('ai_messages')
              .select('content, role')
              .eq('conversation_id', conversationId)
              .order('created_at', { ascending: true });
              
            if (existingMessages && existingMessages.length > 0) {
              finalConversation = existingMessages;
            }
          } else {
            // Créer une nouvelle conversation
            const { data: newConversation, error: convError } = await supabase
              .from('ai_conversations')
              .insert({
                agent_id: agentId,
                is_guest: true,
                session_id: sessionId,
                user_id: userId
              })
              .select()
              .single();
              
            if (convError) {
              console.error('Error creating conversation:', convError);
            } else {
              finalConversationId = newConversation.id;
            }
          }
          
          // Ajouter le message utilisateur à la base de données si nécessaire
          if (message && finalConversationId) {
            await supabase
              .from('ai_messages')
              .insert({
                conversation_id: finalConversationId,
                content: message,
                role: 'user'
              });
              
            // Ajouter le message à la conversation en cours
            finalConversation.push({
              role: 'user',
              content: message
            });
          }
        }
      }
    }

    // Construire les messages pour l'API
    const messages = [];
    
    // Ajouter le message système s'il existe
    if (finalSystemPrompt) {
      let fullPrompt = finalSystemPrompt;
      
      // Ajouter le contexte au prompt système s'il existe
      if (contextContent) {
        fullPrompt += contextContent;
      }
      
      messages.push({
        role: 'system',
        content: fullPrompt
      });
    }
    
    // Ajouter les messages de la conversation
    finalConversation.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });
    
    // Si le message n'est pas dans finalConversation (cas où il n'y a pas de conversationId)
    if (message && !finalConversation.some(msg => msg.role === 'user' && msg.content === message)) {
      messages.push({
        role: 'user',
        content: message
      });
    }

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
      
      // Amélioration des messages d'erreur
      let errorMessage = `Erreur API Cerebras: ${response.status} ${response.statusText}`;
      
      if (errorData && errorData.error) {
        errorMessage += ` - ${errorData.error.message || errorData.error}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Vérification supplémentaire pour s'assurer que la réponse contient le message attendu
    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected response format from Cerebras API:', data);
      throw new Error("Format de réponse inattendu de l'API Cerebras");
    }
    
    const assistantReply = data.choices[0].message.content;
    
    // Track token usage
    if (data.usage) {
      trackUsage(userId, agentId, data.usage.total_tokens || 0);
    }
    
    // Si c'est une conversation intégrée avec un ID, sauvegarder la réponse
    if (finalConversationId) {
      try {
        await supabase
          .from('ai_messages')
          .insert({
            conversation_id: finalConversationId,
            content: assistantReply,
            role: 'assistant'
          });
      } catch (insertError) {
        console.error('Error saving message to database:', insertError);
        // Continue malgré l'erreur pour au moins renvoyer la réponse au client
      }
    }
    
    return new Response(JSON.stringify({
      reply: assistantReply,
      usage: data.usage,
      conversationId: finalConversationId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in cerebras-chat function:', error);
    
    // Ajouter plus d'informations de debug dans la réponse d'erreur
    const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
