
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
    console.log("Request received by cerebras-chat function");
    
    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      console.log("Request data parsed:", JSON.stringify(requestData));
    } catch (parseError) {
      console.error("Error parsing request data:", parseError);
      throw new Error("Invalid request format: " + parseError.message);
    }
    
    const { 
      conversation = [], 
      systemPrompt = '', 
      maxTokens = 2000, 
      agentId, 
      message, 
      conversationId, 
      sessionId, 
      embedded = false, 
      userId = null 
    } = requestData;
    
    // Get API key and endpoint configuration
    // Fixed API key for reliable access
    const cerebrasApiKey = 'csk-enyey34chrpw34wmy8md698cxk3crdevnknrxe8649xtkjrv';
    const endpoint = 'https://api.cerebras.ai/v1/chat/completions';
    const modelName = 'llama-4-scout-17b-16e-instruct';
    
    console.log("Using Cerebras configuration:", {
      endpoint,
      model: modelName,
      hasApiKey: !!cerebrasApiKey
    });

    if (!cerebrasApiKey) {
      throw new Error('Cerebras API key not configured');
    }

    let finalSystemPrompt = systemPrompt;
    let finalConversation = conversation || [];
    let finalConversationId = conversationId;
    let contextContent = "";
    
    // If agent ID is provided, get system prompt from database
    if (agentId) {
      console.log("Getting agent data for ID:", agentId);
      
      // Get agent from database
      const { data, error } = await supabase
        .from('ai_agents')
        .select('name, objective, personality, user_id, views')
        .eq('id', agentId)
        .single();

      if (error) {
        console.error("Error fetching agent:", error);
        throw new Error(`Error retrieving agent: ${error.message}`);
      }

      if (data) {
        console.log("Agent data retrieved:", data.name);
        
        // Build system prompt based on agent attributes
        finalSystemPrompt = `You are ${data.name}, `;
        
        if (data.personality) {
          switch (data.personality) {
            case 'expert':
              finalSystemPrompt += `a formal and precise expert in your field. `;
              break;
            case 'friendly':
              finalSystemPrompt += `with a warm and casual personality. `;
              break;
            case 'concise':
              finalSystemPrompt += `with a direct and efficient style. `;
              break;
            case 'empathetic':
              finalSystemPrompt += `with an empathetic and understanding approach. `;
              break;
            default:
              finalSystemPrompt += `with a ${data.personality} personality. `;
          }
        }
        
        if (data.objective) {
          finalSystemPrompt += `Your objective is ${data.objective}.`;
        }
        
        // Get agent context
        const { data: contextData } = await supabase
          .from('ai_agent_context')
          .select('content_type, content, url')
          .eq('agent_id', agentId);
          
        // Add context content to system prompt
        if (contextData && contextData.length > 0) {
          contextContent = "\n\nHere is additional information you should know:\n\n";
          
          for (const ctx of contextData) {
            if (ctx.content_type === "text" && ctx.content) {
              contextContent += ctx.content + "\n\n";
            } else if (ctx.content_type === "url" && ctx.url) {
              contextContent += `Information from: ${ctx.url}\n\n`;
            }
          }
        }
        
        // Increment view count if not embedded
        if (!embedded) {
          try {
            await supabase
              .from('ai_agents')
              .update({ views: (data.views || 0) + 1 })
              .eq('id', agentId);
          } catch (viewError) {
            console.error('Failed to increment views:', viewError);
            // Continue execution even if this fails
          }
        }
        
        // Handle conversation session
        if (sessionId) {
          console.log("Processing session:", sessionId);
          
          // Check if conversation exists
          if (finalConversationId) {
            console.log("Getting existing conversation:", finalConversationId);
            
            // Get existing messages
            const { data: existingMessages, error: msgError } = await supabase
              .from('ai_messages')
              .select('content, role')
              .eq('conversation_id', finalConversationId)
              .order('created_at', { ascending: true });
              
            if (msgError) {
              console.error("Error fetching messages:", msgError);
            }
              
            if (existingMessages && existingMessages.length > 0) {
              console.log(`Found ${existingMessages.length} existing messages`);
              finalConversation = existingMessages;
            }
          } else {
            console.log("Creating new conversation");
            
            // Create new conversation
            const { data: newConversation, error: convError } = await supabase
              .from('ai_conversations')
              .insert({
                agent_id: agentId,
                is_guest: !userId,
                session_id: sessionId,
                user_id: userId
              })
              .select()
              .single();
              
            if (convError) {
              console.error('Error creating conversation:', convError);
            } else {
              console.log("New conversation created:", newConversation.id);
              finalConversationId = newConversation.id;
            }
          }
          
          // Add user message to database if needed
          if (message && finalConversationId) {
            console.log("Storing user message in database");
            
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
    finalConversation.forEach((msg: any) => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });
    
    // Add user message if not in conversation
    if (message && !finalConversation.some((msg: any) => msg.role === 'user' && msg.content === message)) {
      messages.push({
        role: 'user',
        content: message
      });
    }

    console.log("Calling Cerebras API with:", {
      model: modelName,
      messagesCount: messages.length,
      maxTokens: maxTokens || 2000
    });

    // Call Cerebras API with the updated configuration
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
          temperature: 0.2,
          top_p: 1,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cerebras API error response:', errorText);
        throw new Error(`Cerebras API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Cerebras API response:", {
        choices: data.choices?.length || 0,
        usage: data.usage
      });
      
      const assistantReply = data.choices && data.choices[0]?.message?.content || 
                        "I'm sorry, I couldn't generate a response at this time.";
      
      // If this is a conversation with an ID, save the response
      if (finalConversationId) {
        console.log("Storing assistant reply in database");
        
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
    } catch (apiError) {
      console.error("Error calling Cerebras API:", apiError);
      throw apiError;
    }
  } catch (error) {
    console.error('Error in cerebras-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
