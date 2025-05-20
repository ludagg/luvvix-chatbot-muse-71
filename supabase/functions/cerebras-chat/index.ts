
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

// Créer un client Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestStart = Date.now();
  console.log(`[${requestStart}] Requête reçue par cerebras-chat`);
  
  try {
    // Récupérer la configuration
    const config = await getConfig();
    console.log(`[${Date.now() - requestStart}ms] Configuration chargée: Model=${config.model}, Timeout=${config.timeoutMs}ms`);

    // Analyser la requête
    let requestData;
    try {
      requestData = await req.json();
      console.log(`[${Date.now() - requestStart}ms] Données de requête analysées`);
    } catch (parseError) {
      console.error("Erreur d'analyse des données de la requête:", parseError);
      throw new Error("Format de requête invalide: " + parseError.message);
    }
    
    const { 
      conversation = [], 
      systemPrompt = '', 
      maxTokens = config.defaultMaxTokens, 
      agentId, 
      message, 
      conversationId, 
      sessionId, 
      embedded = false, 
      userId = null 
    } = requestData;
    
    // Valider les paramètres requis
    if (!agentId) {
      throw new Error("L'ID de l'agent est obligatoire");
    }
    
    if (!message && !conversation.length) {
      throw new Error("Un message ou une conversation est requis");
    }

    if (!sessionId) {
      throw new Error("L'ID de session est obligatoire");
    }
    
    console.log(`[${Date.now() - requestStart}ms] Paramètres validés:`, {
      agentId,
      hasMessage: !!message,
      conversationId: conversationId || 'nouveau',
      embedded
    });
    
    let finalSystemPrompt = systemPrompt;
    let finalConversation = conversation || [];
    let finalConversationId = conversationId;
    let contextContent = "";
    let agentData = null;
    
    // Si l'ID de l'agent est fourni, récupérer le prompt système depuis la base de données
    console.log(`[${Date.now() - requestStart}ms] Récupération des données de l'agent ID: ${agentId}`);
    
    // Obtenir l'agent depuis la base de données
    const { data, error } = await supabase
      .from('ai_agents')
      .select('name, objective, personality, user_id, views, avatar_url')
      .eq('id', agentId)
      .single();

    if (error) {
      console.error("Erreur lors de la récupération de l'agent:", error);
      throw new Error(`Erreur lors de la récupération de l'agent: ${error.message}`);
    }

    if (!data) {
      throw new Error("Agent non trouvé");
    }

    agentData = data;
    console.log(`[${Date.now() - requestStart}ms] Données de l'agent récupérées:`, data.name);
    
    // Construire le prompt système basé sur les attributs de l'agent
    finalSystemPrompt = `Vous êtes ${data.name}, `;
    
    if (data.personality) {
      switch (data.personality) {
        case 'expert':
          finalSystemPrompt += `un expert formel et précis dans votre domaine. `;
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
          finalSystemPrompt += `avec une personnalité serviable. `;
      }
    }
    
    if (data.objective) {
      finalSystemPrompt += `Votre objectif est ${data.objective}.`;
    }
    
    // Récupérer le contexte de l'agent
    const { data: contextData } = await supabase
      .from('ai_agent_context')
      .select('content_type, content, url')
      .eq('agent_id', agentId);
      
    // Ajouter le contenu du contexte au prompt système
    if (contextData && contextData.length > 0) {
      contextContent = "\n\nVoici des informations supplémentaires que vous devez connaître:\n\n";
      
      for (const ctx of contextData) {
        if (ctx.content_type === "text" && ctx.content) {
          contextContent += ctx.content + "\n\n";
        } else if (ctx.content_type === "url" && ctx.url) {
          contextContent += `Information de: ${ctx.url}\n\n`;
        }
      }
    }
    
    // Incrémenter le compteur de vues si non intégré
    if (!embedded) {
      try {
        await supabase
          .from('ai_agents')
          .update({ views: (data.views || 0) + 1 })
          .eq('id', agentId);
        
        console.log(`[${Date.now() - requestStart}ms] Vues incrémentées pour l'agent`);
      } catch (viewError) {
        console.error('Échec de l\'incrémentation des vues:', viewError);
        // Continuer l'exécution même en cas d'échec
      }
    }
    
    // Gérer la session de conversation
    if (sessionId) {
      console.log(`[${Date.now() - requestStart}ms] Traitement de la session: ${sessionId}`);
      
      // Vérifier si la conversation existe
      if (finalConversationId) {
        console.log(`[${Date.now() - requestStart}ms] Récupération de la conversation existante: ${finalConversationId}`);
        
        // Récupérer les messages existants
        const { data: existingMessages, error: msgError } = await supabase
          .from('ai_messages')
          .select('content, role')
          .eq('conversation_id', finalConversationId)
          .order('created_at', { ascending: true });
          
        if (msgError) {
          console.error("Erreur lors de la récupération des messages:", msgError);
        }
          
        if (existingMessages && existingMessages.length > 0) {
          console.log(`[${Date.now() - requestStart}ms] ${existingMessages.length} messages existants trouvés`);
          finalConversation = existingMessages;
        }
      } else {
        console.log(`[${Date.now() - requestStart}ms] Création d'une nouvelle conversation`);
        
        // Créer une nouvelle conversation
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
          console.error('Erreur lors de la création de la conversation:', convError);
          throw new Error(`Échec de la création de la conversation: ${convError.message}`);
        } else {
          console.log(`[${Date.now() - requestStart}ms] Nouvelle conversation créée: ${newConversation.id}`);
          finalConversationId = newConversation.id;
        }
      }
      
      // Ajouter le message de l'utilisateur à la base de données si nécessaire
      if (message && finalConversationId) {
        console.log(`[${Date.now() - requestStart}ms] Stockage du message de l'utilisateur dans la base de données`);
        
        const { error: msgInsertError } = await supabase
          .from('ai_messages')
          .insert({
            conversation_id: finalConversationId,
            content: message,
            role: 'user'
          });
          
        if (msgInsertError) {
          console.error("Erreur lors de l'insertion du message utilisateur:", msgInsertError);
          // Continuer quand même pour obtenir une réponse
        }
          
        // Ajouter le message à la conversation actuelle
        finalConversation.push({
          role: 'user',
          content: message
        });
      }
    }

    // Construire les messages pour l'API
    const messages = [];
    
    // Ajouter le message système s'il existe
    if (finalSystemPrompt) {
      let fullPrompt = finalSystemPrompt;
      
      // Ajouter le contexte s'il existe
      if (contextContent) {
        fullPrompt += contextContent;
      }
      
      messages.push({
        role: 'system',
        content: fullPrompt
      });
    }
    
    // Ajouter les messages de conversation
    if (finalConversation && finalConversation.length > 0) {
      finalConversation.forEach((msg: any) => {
        if (msg && msg.role && msg.content) {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
    }
    
    // Ajouter le message utilisateur s'il ne figure pas dans la conversation
    if (message && (!finalConversation || !finalConversation.some((msg: any) => msg.role === 'user' && msg.content === message))) {
      messages.push({
        role: 'user',
        content: message
      });
    }

    // S'assurer qu'il y a au moins un message à envoyer
    if (messages.length === 0) {
      messages.push({
        role: 'system',
        content: 'Bonjour, comment puis-je vous aider?'
      });
    }

    console.log(`[${Date.now() - requestStart}ms] Appel de l'API Cerebras avec:`, {
      model: config.model,
      messagesCount: messages.length,
      maxTokens: maxTokens || config.defaultMaxTokens
    });

    // Appel de l'API Cerebras avec la configuration mise à jour
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);
      
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages: messages,
          max_tokens: maxTokens || config.defaultMaxTokens,
          temperature: config.temperature,
          top_p: 1,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[${Date.now() - requestStart}ms] Erreur de l'API Cerebras:`, errorText);
        
        // Vérifier si c'est une erreur d'authentification
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Erreur d'authentification API: Vérifiez que la clé API est valide. (${response.status})`);
        } else {
          throw new Error(`Erreur de l'API Cerebras: ${response.status} ${response.statusText} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log(`[${Date.now() - requestStart}ms] Réponse de l'API Cerebras reçue:`, {
        choices: data.choices?.length || 0,
        usage: data.usage
      });
      
      const assistantReply = data.choices && data.choices[0]?.message?.content || 
                    "Je suis désolé, je n'ai pas pu générer une réponse pour le moment. Veuillez réessayer.";
      
      // Si c'est une conversation avec un ID, enregistrer la réponse
      if (finalConversationId) {
        console.log(`[${Date.now() - requestStart}ms] Stockage de la réponse de l'assistant dans la base de données`);
        
        const { error: replyError } = await supabase
          .from('ai_messages')
          .insert({
            conversation_id: finalConversationId,
            content: assistantReply,
            role: 'assistant'
          });
          
        if (replyError) {
          console.error("Erreur lors du stockage de la réponse de l'assistant:", replyError);
          // Continuer quand même pour renvoyer la réponse
        }
      }
      
      // Calculer le temps total de traitement
      const totalTime = Date.now() - requestStart;
      console.log(`[${totalTime}ms] Traitement terminé avec succès`);
      
      return new Response(JSON.stringify({
        reply: assistantReply,
        usage: data.usage,
        conversationId: finalConversationId,
        agentName: agentData.name,
        agentAvatar: agentData.avatar_url,
        processingTime: totalTime,
        success: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (apiError: any) {
      // Vérifier si c'est une erreur de timeout
      if (apiError.name === 'AbortError') {
        console.error(`[${Date.now() - requestStart}ms] Timeout de l'API Cerebras après ${config.timeoutMs}ms`);
        throw new Error(`L'API Cerebras n'a pas répondu dans le délai imparti de ${config.timeoutMs/1000} secondes`);
      }
      
      console.error(`[${Date.now() - requestStart}ms] Erreur lors de l'appel à l'API Cerebras:`, apiError);
      throw apiError;
    }
  } catch (error: any) {
    const totalTime = Date.now() - requestStart;
    console.error(`[${totalTime}ms] Erreur dans la fonction cerebras-chat:`, error);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Une erreur inconnue s'est produite",
      errorType: error.name || 'Error',
      success: false,
      processingTime: totalTime,
      errorDetails: error.stack || "Pas de détails disponibles",
      authenticationType: "Cerebras API"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
