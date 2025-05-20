
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Request received by ai-studio-chat function");
    
    let requestData;
    try {
      requestData = await req.json();
      console.log("Request data:", JSON.stringify(requestData));
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      throw new Error("Invalid request format: " + parseError.message);
    }
    
    const { agentId, message, sessionId, conversationId } = requestData;
    
    if (!agentId) {
      throw new Error("Agent ID is required");
    }
    
    if (!message) {
      throw new Error("Message is required");
    }
    
    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get agent configuration
    const { data: agent, error: agentError } = await supabase
      .from("ai_agents")
      .select("*")
      .eq("id", agentId)
      .single();
      
    if (agentError || !agent) {
      console.error("Agent not found:", agentError);
      throw new Error("Agent not found");
    }
    
    console.log("Agent found:", agent.name);
    
    // Get agent context
    const { data: contextData } = await supabase
      .from("ai_agent_context")
      .select("*")
      .eq("agent_id", agentId);
      
    // Get admin configuration
    const { data: adminConfig, error: configError } = await supabase
      .from("ai_admin_config")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();
      
    if (configError || !adminConfig) {
      console.error("Admin configuration not found:", configError);
      throw new Error("Admin configuration not found");
    }
    
    console.log("Admin config loaded, endpoint:", adminConfig.endpoint_url);
    
    let convoId = conversationId;
    
    // Create new conversation if needed
    if (!convoId) {
      console.log("Creating new conversation");
      const { data: newConversation, error: convoError } = await supabase
        .from("ai_conversations")
        .insert({
          agent_id: agentId,
          user_id: req.headers.get("authorization") ? undefined : null,
          is_guest: !req.headers.get("authorization"),
          session_id: sessionId,
        })
        .select("id")
        .single();
        
      if (convoError || !newConversation) {
        console.error("Failed to create conversation:", convoError);
        throw new Error("Failed to create conversation");
      }
      
      convoId = newConversation.id;
      console.log("New conversation created:", convoId);
    }
    
    // Store user message
    const { error: msgError } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: convoId,
        content: message,
        role: "user",
      });
      
    if (msgError) {
      console.error("Error storing user message:", msgError);
    }
      
    // Build context for the AI model
    let contextPrompt = "";
    if (contextData && contextData.length > 0) {
      console.log(`Adding ${contextData.length} context items`);
      contextData.forEach(item => {
        if (item.content_type === "text" && item.content) {
          contextPrompt += `${item.content}\n\n`;
        } else if (item.content_type === "url" && item.url) {
          contextPrompt += `Information from URL: ${item.url}\n\n`;
        }
      });
    }
    
    let systemPrompt = `You are an AI assistant named ${agent.name}. `;
    
    // Add personality
    switch (agent.personality) {
      case "expert":
        systemPrompt += "You are an expert in your field and provide detailed, accurate information. Your tone is professional and authoritative. ";
        break;
      case "friendly":
        systemPrompt += "You are friendly, casual, and approachable. You use simple language and sometimes add humor to your responses. ";
        break;
      case "concise":
        systemPrompt += "You give brief, to-the-point responses without unnecessary details. ";
        break;
      case "empathetic":
        systemPrompt += "You are warm, understanding, and compassionate. You acknowledge emotions and provide supportive responses. ";
        break;
      default:
        systemPrompt += "You are helpful and informative. ";
    }
    
    // Add objective
    systemPrompt += `Your purpose is: ${agent.objective}. `;
    
    // Add context if available
    if (contextPrompt) {
      systemPrompt += `\n\nUse the following information to inform your responses: ${contextPrompt}`;
    }
    
    // Get conversation history
    const { data: messages, error: historyError } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true });
      
    if (historyError) {
      console.error("Error fetching message history:", historyError);
    }
      
    // Format messages for the model
    const formattedMessages = [
      { role: "system", content: systemPrompt }
    ];
    
    if (messages && messages.length > 0) {
      console.log(`Adding ${messages.length} history messages`);
      messages.forEach(msg => {
        formattedMessages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }
    
    // Use Cerebras API with the default API key from the configuration
    const cerebrasApiKey = adminConfig.api_key || "csk-enyey34chrpw34wmy8md698cxk3crdevnknrxe8649xtkjrv";
    const cerebrasEndpoint = adminConfig.endpoint_url || "https://api.cerebras.ai/v1/chat/completions";
    const cerebrasModel = adminConfig.model_name || "llama-4-scout-17b-16e-instruct";
    
    console.log("Calling API with model:", cerebrasModel);
    
    try {
      // Call AI model endpoint
      const modelResponse = await fetch(cerebrasEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cerebrasApiKey}`
        },
        body: JSON.stringify({
          model: cerebrasModel,
          messages: formattedMessages,
          max_tokens: adminConfig.max_tokens || 2000,
          temperature: 0.7,
          stream: false
        })
      });
      
      if (!modelResponse.ok) {
        const errorText = await modelResponse.text();
        console.error("API error response:", errorText);
        throw new Error(`Error from AI provider: ${modelResponse.status} ${modelResponse.statusText} - ${errorText}`);
      }
      
      const modelData = await modelResponse.json();
      console.log("Cerebras API response received");
      
      const aiResponse = modelData.choices && modelData.choices[0]?.message?.content || 
                         "I'm sorry, I couldn't generate a response at this time.";
      
      // Store AI response
      const { error: replyError } = await supabase
        .from("ai_messages")
        .insert({
          conversation_id: convoId,
          content: aiResponse,
          role: "assistant",
        });
        
      if (replyError) {
        console.error("Error storing AI reply:", replyError);
      }
      
      // Increment view count for the agent
      try {
        await supabase
          .from("ai_agents")
          .update({ views: (agent.views || 0) + 1 })
          .eq("id", agentId);
      } catch (viewError) {
        console.error("Failed to increment views:", viewError);
        // Continue execution even if this fails
      }
      
      // Return the AI response
      return new Response(
        JSON.stringify({ 
          response: aiResponse,
          conversationId: convoId 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    } catch (apiError) {
      console.error("Error calling Cerebras API:", apiError);
      throw apiError;
    }
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
        status: 500
      }
    );
  }
});
