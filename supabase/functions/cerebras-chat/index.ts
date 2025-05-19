
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation, systemPrompt, maxTokens, agentId, message, conversationId, sessionId, embedded = false } = await req.json();
    
    // Get API key and configuration from Supabase secrets
    const cerebrasApiKey = Deno.env.get('CEREBRAS_API_KEY') || 'csk-enyey34chrpw34wmy8md698cxk3crdevnknrxe8649xtkjrv';
    const endpoint = Deno.env.get('CEREBRAS_ENDPOINT') || 'https://api.cerebras.ai/v1/chat/completions';
    const modelName = Deno.env.get('CEREBRAS_MODEL') || 'llama-4-scout-17b-16e-instruct';
    
    if (!cerebrasApiKey) {
      throw new Error('Clé API Cerebras non configurée');
    }

    let finalSystemPrompt = systemPrompt;
    let finalConversation = conversation || [];
    let finalConversationId = conversationId;
    let userId = null;
    let contextContent = "";
    
    // If agent ID is provided, get system prompt from database
    if (agentId) {
      // Get agent from database
      const { data, error } = await supabase
        .from('ai_agents')
        .select('name, objective, personality, user_id')
        .eq('id', agentId)
        .single();

      if (error) {
        throw new Error(`Erreur lors de la récupération de l'agent: ${error.message}`);
      }

      if (data) {
        // Store user ID for usage tracking
        userId = data.user_id;
        
        // Build system prompt based on agent attributes
        finalSystemPrompt = `Tu es ${data.name}, `;
        
        if (data.personality) {
          switch (data.personality) {
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
              finalSystemPrompt += `avec une personnalité ${data.personality}. `;
          }
        }
        
        if (data.objective) {
          finalSystemPrompt += `Ton objectif est ${data.objective}.`;
        }
        
        // Get agent context
        const { data: contextData } = await supabase
          .from('ai_agent_context')
          .select('content_type, content, url')
          .eq('agent_id', agentId);
          
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
        
        // Increment view count if not embedded
        if (!embedded) {
          try {
            await supabase.rpc('increment_agent_views', { agent_id: agentId });
          } catch (error) {
            console.error('Failed to increment views:', error);
            // Continue execution even if this fails
          }
        }
        
        // Handle conversation session
        if (sessionId) {
          // Check if conversation exists
          if (conversationId) {
            // Get existing messages
            const { data: existingMessages } = await supabase
              .from('ai_messages')
              .select('content, role')
              .eq('conversation_id', conversationId)
              .order('created_at', { ascending: true });
              
            if (existingMessages && existingMessages.length > 0) {
              finalConversation = existingMessages;
            }
          } else {
            // Create new conversation
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
          
          // Add user message to database if needed
          if (message && finalConversationId) {
            await supabase
              .from('ai_messages')
              .insert({
                conversation_id: finalConversationId,
                content: message,
                role: 'user'
              });
              
            // Add message to current conversation
            finalConversation.push({
              role: 'user',
              content: message
            });
          }
        }
      }
    }

    // Build messages for API
    const messages = [];
    
    // Add system message if it exists
    if (finalSystemPrompt) {
      let fullPrompt = finalSystemPrompt;
      
      // Add context if it exists
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
    
    // Add user message if not in conversation
    if (message && !finalConversation.some(msg => msg.role === 'user' && msg.content === message)) {
      messages.push({
        role: 'user',
        content: message
      });
    }

    console.log("Calling Cerebras API with messages:", JSON.stringify(messages));

    // Call Cerebras API
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
        temperature: 0.2,
        top_p: 1,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cerebras API error response:', errorText);
      throw new Error(`Erreur API Cerebras: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const assistantReply = data.choices[0].message.content;
    
    // If this is a conversation with an ID, save the response
    if (finalConversationId) {
      await supabase
        .from('ai_messages')
        .insert({
          conversation_id: finalConversationId,
          content: assistantReply,
          role: 'assistant'
        });
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
