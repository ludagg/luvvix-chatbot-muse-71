
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
    const { agentId, message, sessionId, conversationId } = await req.json();
    
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
      throw new Error("Agent not found");
    }
    
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
      throw new Error("Admin configuration not found");
    }
    
    let convoId = conversationId;
    
    // Create new conversation if needed
    if (!convoId) {
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
        throw new Error("Failed to create conversation");
      }
      
      convoId = newConversation.id;
    }
    
    // Store user message
    await supabase
      .from("ai_messages")
      .insert({
        conversation_id: convoId,
        content: message,
        role: "user",
      });
      
    // Build context for the AI model
    let contextPrompt = "";
    if (contextData && contextData.length > 0) {
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
    const { data: messages } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true });
      
    // Format messages for the model
    const formattedMessages = [
      { role: "system", content: systemPrompt }
    ];
    
    if (messages && messages.length > 0) {
      messages.forEach(msg => {
        formattedMessages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }
    
    // Call AI model endpoint
    const modelResponse = await fetch(adminConfig.endpoint_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminConfig.api_key}`
      },
      body: JSON.stringify({
        model: adminConfig.model_name,
        messages: formattedMessages,
        max_tokens: adminConfig.max_tokens,
        temperature: 0.7
      })
    });
    
    const modelData = await modelResponse.json();
    const aiResponse = modelData.choices && modelData.choices[0]?.message?.content || 
                       "I'm sorry, I couldn't generate a response at this time.";
    
    // Store AI response
    await supabase
      .from("ai_messages")
      .insert({
        conversation_id: convoId,
        content: aiResponse,
        role: "assistant",
      });
    
    // Increment view count for the agent
    await supabase.rpc("increment_agent_views", { agent_id: agentId });
    
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
