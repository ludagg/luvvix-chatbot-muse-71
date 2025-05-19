
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

// Utility functions for cache management
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
    }
    
    // Log usage for analytics
    console.log(`Usage - ${userId || 'Guest'} used ${tokens} tokens with agent ${agentId}`);
    
  } catch (error) {
    console.error('Error tracking usage:', error);
    // Don't throw - just log and continue
  }
}

// Fallback responses in case of errors
const getFallbackResponse = (errorType = "general") => {
  const fallbacks = {
    general: "Je suis désolé, j'ai rencontré un problème technique. Pourriez-vous reformuler votre question, ou réessayer dans quelques instants ?",
    connection: "Désolé, je rencontre des difficultés à me connecter au serveur. Veuillez réessayer dans quelques instants.",
    timeout: "La réponse prend plus de temps que prévu. Veuillez réessayer avec une question plus courte ou plus précise.",
    quota: "Vous avez atteint votre limite de messages pour aujourd'hui. Veuillez réessayer demain ou envisager de passer à un abonnement premium.",
    model: "Le modèle d'IA est temporairement indisponible. Nous travaillons à résoudre ce problème. Veuillez réessayer plus tard."
  };
  
  return fallbacks[errorType] || fallbacks.general;
};

// Main request handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("Error parsing request JSON:", parseError);
      return new Response(JSON.stringify({ 
        error: "Invalid request format", 
        reply: getFallbackResponse()
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    const { 
      conversation, 
      systemPrompt, 
      maxTokens, 
      agentId, 
      message, 
      conversationId, 
      sessionId, 
      embedded = false 
    } = requestBody;
    
    // Validate required fields
    if ((!message && !conversation) || (!systemPrompt && !agentId)) {
      return new Response(JSON.stringify({ 
        error: "Missing required parameters", 
        reply: getFallbackResponse()
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Get API credentials with error handling
    const cerebrasApiKey = Deno.env.get('CEREBRAS_API_KEY') || '';
    const endpoint = Deno.env.get('CEREBRAS_ENDPOINT') || 'https://api.cerebras.ai/v1/completions';
    const modelName = Deno.env.get('CEREBRAS_MODEL') || 'cerebras/Cerebras-GPT-4.5-8B-Base';
    
    if (!cerebrasApiKey) {
      console.error("Cerebras API key not configured");
      return new Response(JSON.stringify({ 
        error: "Service configuration error", 
        reply: getFallbackResponse("connection")
      }), { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    let finalSystemPrompt = systemPrompt;
    let finalConversation = conversation || [];
    let finalConversationId = conversationId;
    let userId = null;
    let contextContent = "";
    
    // If an agentId is provided, fetch the system prompt from the database
    if (agentId) {
      try {
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
            throw new Error(`Error fetching agent: ${error.message}`);
          }

          if (data) {
            agent = data;
            setCachedAgent(agentId, agent);
          } else {
            throw new Error(`Agent with ID ${agentId} not found`);
          }
        }

        if (agent) {
          // Store user ID for usage tracking
          userId = agent.user_id;
          
          // Build system prompt based on agent attributes
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
            // Fetch agent context from database
            const { data: fetchedContextData, error: contextError } = await supabase
              .from('ai_agent_context')
              .select('content_type, content, url')
              .eq('agent_id', agentId);
              
            if (!contextError && fetchedContextData && fetchedContextData.length > 0) {
              contextData = fetchedContextData;
              setCachedContext(agentId, contextData);
            }
          }
          
          // Add context content to system prompt
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
          
          // Increment view counter for agent if not embedded
          if (!embedded) {
            try {
              await supabase.rpc('increment_agent_views', { agent_id: agentId });
            } catch (error) {
              console.error('Failed to increment views:', error);
              // Non-critical, continue execution
            }
          }
          
          // Handle embedded session conversation management
          if (sessionId) {
            // Check if conversation exists for this session
            if (conversationId) {
              // Fetch existing messages
              const { data: existingMessages, error: messagesError } = await supabase
                .from('ai_messages')
                .select('content, role')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true });
                
              if (messagesError) {
                console.error("Error fetching conversation messages:", messagesError);
              } else if (existingMessages && existingMessages.length > 0) {
                finalConversation = existingMessages;
              }
            } else {
              // Create a new conversation
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
              } else if (newConversation) {
                finalConversationId = newConversation.id;
              }
            }
            
            // Add the user message to the database if needed
            if (message && finalConversationId) {
              await supabase
                .from('ai_messages')
                .insert({
                  conversation_id: finalConversationId,
                  content: message,
                  role: 'user'
                });
                
              // Add the message to the current conversation
              finalConversation.push({
                role: 'user',
                content: message
              });
            }
          }
        }
      } catch (agentError) {
        console.error("Error processing agent data:", agentError);
        // Continue with defaults if available, otherwise return error
        if (!finalSystemPrompt && !conversation) {
          return new Response(JSON.stringify({ 
            error: `Agent configuration error: ${agentError.message}`, 
            reply: getFallbackResponse()
          }), { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }
      }
    }

    // Build messages for the API request
    const messages = [];
    
    // Add system message if it exists
    if (finalSystemPrompt) {
      let fullPrompt = finalSystemPrompt;
      
      // Add context to system prompt if it exists
      if (contextContent) {
        fullPrompt += contextContent;
      }
      
      messages.push({
        role: 'system',
        content: fullPrompt
      });
    }
    
    // Add conversation messages
    finalConversation.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });
    
    // Add the current message if not already included
    if (message && !finalConversation.some(msg => msg.role === 'user' && msg.content === message)) {
      messages.push({
        role: 'user',
        content: message
      });
    }

    // Call Cerebras API with proper error handling
    try {
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
        const errorData = await response.json().catch(() => ({}));
        console.error('Cerebras API error:', errorData);
        
        // Determine error type for better user feedback
        let errorType = "general";
        if (response.status === 429) {
          errorType = "quota";
        } else if (response.status === 504 || response.status === 408) {
          errorType = "timeout";
        } else if (response.status >= 500) {
          errorType = "model";
        } else if (response.status >= 400 && response.status < 500) {
          errorType = "connection";
        }
        
        const errorMessage = `Cerebras API error: ${response.status} ${response.statusText}${errorData.error ? ` - ${errorData.error.message || errorData.error}` : ''}`;
        
        // Return a user-friendly error response
        return new Response(JSON.stringify({ 
          error: errorMessage, 
          reply: getFallbackResponse(errorType)
        }), { 
          status: 200, // Return 200 to client with fallback message
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      const data = await response.json();
      
      // Validate response format
      if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('Unexpected response format from Cerebras API:', data);
        return new Response(JSON.stringify({ 
          error: "Invalid API response format", 
          reply: getFallbackResponse("model")
        }), { 
          status: 200, // Return 200 to client with fallback message
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }
      
      // Extract the assistant's reply
      const assistantReply = data.choices[0].message.content;
      
      // Track token usage
      if (data.usage) {
        trackUsage(userId, agentId, data.usage.total_tokens || 0);
      }
      
      // Save response to conversation if needed
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
          // Continue despite error to at least return the response to the client
        }
      }
      
      // Return successful response
      return new Response(JSON.stringify({
        reply: assistantReply,
        usage: data.usage,
        conversationId: finalConversationId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (apiError) {
      console.error('Error calling Cerebras API:', apiError);
      return new Response(JSON.stringify({ 
        error: `API call failed: ${apiError.message}`, 
        reply: getFallbackResponse("connection")
      }), { 
        status: 200, // Return 200 to client with fallback message
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
  } catch (error) {
    console.error('Unhandled error in cerebras-chat function:', error);
    
    // Return a user-friendly error response
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
      reply: getFallbackResponse(),
      timestamp: new Date().toISOString()
    }), {
      status: 200, // Return 200 to client with fallback message
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
