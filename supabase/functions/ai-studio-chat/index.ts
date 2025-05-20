
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Configuration de l'API Cerebras
const getConfig = async () => {
  try {
    // Récupérer la clé API depuis les secrets de Supabase
    const apiKey = Deno.env.get('CEREBRAS_API_KEY') || 'csk-enyey34chrpw34wmy8md698cxk3crdevnknrxe8649xtkjrv';
    const endpoint = Deno.env.get('CEREBRAS_ENDPOINT') || 'https://api.cerebras.ai/v1/chat/completions';
    const model = Deno.env.get('CEREBRAS_MODEL') || 'llama-4-scout-17b-16e-instruct';
    const timeoutMs = 30000; // 30 secondes de timeout
    const defaultMaxTokens = 2000;
    const temperature = 0.5;

    return {
      apiKey,
      endpoint,
      model,
      timeoutMs,
      defaultMaxTokens,
      temperature
    };
  } catch (error) {
    console.error("Erreur lors de la récupération de la configuration:", error);
    // Valeurs par défaut en cas d'erreur
    return {
      apiKey: 'csk-enyey34chrpw34wmy8md698cxk3crdevnknrxe8649xtkjrv',
      endpoint: 'https://api.cerebras.ai/v1/chat/completions',
      model: 'llama-4-scout-17b-16e-instruct',
      timeoutMs: 30000,
      defaultMaxTokens: 2000,
      temperature: 0.5
    };
  }
};

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  const requestStart = Date.now();
  
  try {
    console.log(`[${requestStart}] Requête reçue par ai-studio-chat (fallback)`);
    
    // Récupérer la configuration
    const config = await getConfig();
    console.log(`[${Date.now() - requestStart}ms] Configuration chargée: Model=${config.model}, Timeout=${config.timeoutMs}ms`);
    
    let requestData;
    try {
      requestData = await req.json();
      console.log(`[${Date.now() - requestStart}ms] Données de requête analysées:`, JSON.stringify(requestData));
    } catch (parseError) {
      console.error(`[${Date.now() - requestStart}ms] Erreur d'analyse du corps de la requête:`, parseError);
      throw new Error("Format de requête invalide: " + parseError.message);
    }
    
    const { agentId, message, sessionId, conversationId, userId } = requestData;
    
    // Validation des données requises
    if (!agentId) {
      throw new Error("L'ID de l'agent est obligatoire");
    }
    
    if (!message) {
      throw new Error("Le message est obligatoire");
    }
    
    if (!sessionId) {
      throw new Error("L'ID de session est obligatoire");
    }
    
    // Obtenir le client Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Récupérer la configuration de l'agent
    const { data: agent, error: agentError } = await supabase
      .from("ai_agents")
      .select("*")
      .eq("id", agentId)
      .single();
      
    if (agentError || !agent) {
      console.error(`[${Date.now() - requestStart}ms] Agent non trouvé:`, agentError);
      throw new Error("Agent non trouvé");
    }
    
    console.log(`[${Date.now() - requestStart}ms] Agent trouvé:`, agent.name);
    
    // Récupérer le contexte de l'agent
    const { data: contextData } = await supabase
      .from("ai_agent_context")
      .select("*")
      .eq("agent_id", agentId);
      
    console.log(`[${Date.now() - requestStart}ms] Utilisation de la configuration Cerebras:`, {
      model: config.model,
      endpoint: config.endpoint,
      hasApiKey: !!config.apiKey
    });
    
    let convoId = conversationId;
    
    // Créer une nouvelle conversation si nécessaire
    if (!convoId) {
      console.log(`[${Date.now() - requestStart}ms] Création d'une nouvelle conversation`);
      const { data: newConversation, error: convoError } = await supabase
        .from("ai_conversations")
        .insert({
          agent_id: agentId,
          user_id: userId || null,
          is_guest: !userId,
          session_id: sessionId,
        })
        .select("id")
        .single();
        
      if (convoError || !newConversation) {
        console.error(`[${Date.now() - requestStart}ms] Échec de la création de la conversation:`, convoError);
        throw new Error("Échec de la création de la conversation");
      }
      
      convoId = newConversation.id;
      console.log(`[${Date.now() - requestStart}ms] Nouvelle conversation créée:`, convoId);
    }
    
    // Stocker le message de l'utilisateur
    const { error: msgError } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: convoId,
        content: message,
        role: "user",
      });
      
    if (msgError) {
      console.error(`[${Date.now() - requestStart}ms] Erreur lors du stockage du message utilisateur:`, msgError);
      // Continuer quand même
    }
      
    // Construire le contexte pour le modèle d'IA
    let contextPrompt = "";
    if (contextData && contextData.length > 0) {
      console.log(`[${Date.now() - requestStart}ms] Ajout de ${contextData.length} éléments de contexte`);
      contextData.forEach(item => {
        if (item.content_type === "text" && item.content) {
          contextPrompt += `${item.content}\n\n`;
        } else if (item.content_type === "url" && item.url) {
          contextPrompt += `Informations de l'URL: ${item.url}\n\n`;
        }
      });
    }
    
    let systemPrompt = `Vous êtes un assistant IA nommé ${agent.name}. `;
    
    // Ajouter la personnalité
    switch (agent.personality) {
      case "expert":
        systemPrompt += "Vous êtes un expert dans votre domaine et fournissez des informations détaillées et précises. Votre ton est professionnel et autoritaire. ";
        break;
      case "friendly":
        systemPrompt += "Vous êtes amical, décontracté et accessible. Vous utilisez un langage simple et ajoutez parfois de l'humour à vos réponses. ";
        break;
      case "concise":
        systemPrompt += "Vous donnez des réponses brèves et précises sans détails superflus. ";
        break;
      case "empathetic":
        systemPrompt += "Vous êtes chaleureux, compréhensif et compatissant. Vous reconnaissez les émotions et fournissez des réponses de soutien. ";
        break;
      default:
        systemPrompt += "Vous êtes serviable et informatif. ";
    }
    
    // Ajouter l'objectif
    systemPrompt += `Votre objectif est: ${agent.objective}. `;
    
    // Ajouter le contexte si disponible
    if (contextPrompt) {
      systemPrompt += `\n\nUtilisez les informations suivantes pour éclairer vos réponses: ${contextPrompt}`;
    }
    
    // Récupérer l'historique de la conversation
    const { data: messages, error: historyError } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true });
      
    if (historyError) {
      console.error(`[${Date.now() - requestStart}ms] Erreur lors de la récupération de l'historique des messages:`, historyError);
      // Continuer quand même
    }
      
    // Formater les messages pour le modèle
    const formattedMessages = [
      { role: "system", content: systemPrompt }
    ];
    
    if (messages && messages.length > 0) {
      console.log(`[${Date.now() - requestStart}ms] Ajout de ${messages.length} messages d'historique`);
      messages.forEach(msg => {
        if (msg && msg.role && msg.content) {
          formattedMessages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
    }
    
    console.log(`[${Date.now() - requestStart}ms] Appel de l'API Cerebras avec le modèle:`, config.model);
    
    try {
      // Créer un contrôleur pour gérer le timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);
      
      // Appeler le point de terminaison du modèle d'IA
      const modelResponse = await fetch(config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: formattedMessages,
          max_tokens: config.defaultMaxTokens,
          temperature: config.temperature,
          stream: false
        }),
        signal: controller.signal
      });
      
      // Effacer le timeout
      clearTimeout(timeoutId);
      
      if (!modelResponse.ok) {
        const errorText = await modelResponse.text();
        console.error(`[${Date.now() - requestStart}ms] Erreur de réponse de l'API:`, errorText, "Statut:", modelResponse.status);
        
        // Vérifier si c'est une erreur d'authentification
        if (modelResponse.status === 401 || modelResponse.status === 403) {
          throw new Error(`Erreur d'authentification API: Vérifiez que la clé API est valide. (${modelResponse.status})`);
        } else {
          throw new Error(`Erreur du fournisseur d'IA: ${modelResponse.status} ${modelResponse.statusText} - ${errorText}`);
        }
      }
      
      const modelData = await modelResponse.json();
      console.log(`[${Date.now() - requestStart}ms] Réponse de l'API Cerebras reçue`);
      
      const aiResponse = modelData.choices && modelData.choices[0]?.message?.content || 
                       "Je suis désolé, je n'ai pas pu générer une réponse pour le moment. Veuillez réessayer.";
      
      // Stocker la réponse de l'IA
      const { error: replyError } = await supabase
        .from("ai_messages")
        .insert({
          conversation_id: convoId,
          content: aiResponse,
          role: "assistant",
        });
        
      if (replyError) {
        console.error(`[${Date.now() - requestStart}ms] Erreur lors du stockage de la réponse de l'IA:`, replyError);
        // Continuer quand même
      }
      
      // Incrémenter le compteur de vues pour l'agent
      try {
        await supabase
          .from("ai_agents")
          .update({ views: (agent.views || 0) + 1 })
          .eq("id", agentId);
      } catch (viewError) {
        console.error(`[${Date.now() - requestStart}ms] Échec de l'incrémentation des vues:`, viewError);
        // Continuer l'exécution même si cela échoue
      }
      
      const totalTime = Date.now() - requestStart;
      console.log(`[${totalTime}ms] Traitement terminé avec succès`);
      
      // Retourner la réponse de l'IA
      return new Response(
        JSON.stringify({ 
          response: aiResponse,
          conversationId: convoId,
          success: true,
          processingTime: totalTime
        }),
        { 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          } 
        }
      );
    } catch (apiError: any) {
      // Vérifier si c'est une erreur de timeout
      if (apiError.name === 'AbortError') {
        console.error(`[${Date.now() - requestStart}ms] Timeout de l'API après ${config.timeoutMs}ms`);
        throw new Error(`L'API n'a pas répondu dans le délai imparti de ${config.timeoutMs/1000} secondes`);
      }
      
      console.error(`[${Date.now() - requestStart}ms] Erreur lors de l'appel à l'API Cerebras:`, apiError);
      throw apiError;
    }
  } catch (error: any) {
    const totalTime = Date.now() - requestStart;
    console.error(`[${totalTime}ms] Erreur:`, error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        errorType: error.name || 'Error',
        success: false,
        processingTime: totalTime,
        authenticationType: "Cerebras API (Fallback)"
      }),
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
