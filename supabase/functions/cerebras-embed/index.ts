import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Security-Policy': "frame-ancestors 'self' *"
};

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Cache system for improved performance
const agentCache = new Map();
const responseCache = new Map();
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

function getCachedResponse(key) {
  const cachedData = responseCache.get(key);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_TTL) {
    return cachedData.response;
  }
  return null;
}

function setCachedResponse(key, response) {
  responseCache.set(key, {
    timestamp: Date.now(),
    response
  });
}

function generateChatHtml(agent, theme, accentColor, hideCredit, startMessage, isPreview = false, embedType = "iframe") {
  // Create color variants based on the accent color
  const accentHexColor = accentColor.replace('#', '');
  const primaryColor = accentColor;
  const primaryLightColor = `#${accentHexColor}20`; // 20% opacity version
  const primaryDarkColor = `#${accentHexColor}`;
  
  // Theme-specific styles
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1a1f2c' : 'white';
  const textColor = isDark ? 'white' : '#1a1f2c';
  const borderColor = isDark ? '#ffffff20' : '#e5e7eb';
  const inputBgColor = isDark ? '#ffffff10' : '#f9fafb';
  const messageBgUser = primaryColor;
  const messageBgBot = isDark ? '#374151' : '#f3f4f6';
  const messageColorUser = '#ffffff';
  const messageColorBot = isDark ? '#e5e7eb' : '#1f2937';

  // Handle different embed types for preview mode
  let previewJS = '';
  if (isPreview) {
    if (embedType === 'script') {
      previewJS = `
        window.addEventListener('DOMContentLoaded', () => {
          document.getElementById('luvvix-preview-container').innerHTML = '<div style="padding: 20px; text-align: center;">Le script s\'intégrerait ici sur votre site, affichant l\'interface de chat directement dans votre page.</div>';
        });
      `;
    } else if (embedType === 'popup') {
      previewJS = `
        window.addEventListener('DOMContentLoaded', () => {
          const container = document.getElementById('luvvix-preview-container');
          container.innerHTML = '<div style="padding: 20px; text-align: center;"><button id="preview-popup-btn" style="background: ${primaryColor}; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">Chat avec ${agent.name}</button></div>';
          
          document.getElementById('preview-popup-btn').addEventListener('click', () => {
            const popup = document.createElement('div');
            popup.style.position = 'fixed';
            popup.style.bottom = '20px';
            popup.style.right = '20px';
            popup.style.width = '350px';
            popup.style.height = '500px';
            popup.style.background = '${bgColor}';
            popup.style.borderRadius = '8px';
            popup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            popup.style.zIndex = '10000';
            popup.style.overflow = 'hidden';
            popup.style.display = 'flex';
            popup.style.flexDirection = 'column';
            
            popup.innerHTML = document.getElementById('luvvix-chat-container').outerHTML;
            
            // Add close button
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '10px';
            closeBtn.style.right = '10px';
            closeBtn.style.background = 'transparent';
            closeBtn.style.border = 'none';
            closeBtn.style.fontSize = '20px';
            closeBtn.style.color = '${textColor}';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.zIndex = '10001';
            
            closeBtn.addEventListener('click', () => {
              document.body.removeChild(popup);
            });
            
            popup.appendChild(closeBtn);
            document.body.appendChild(popup);
          });
        });
      `;
    } else {
      // iframe preview mode - just show the normal chat interface
      previewJS = '';
    }
  }

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>LuvviX AI - ${agent.name}</title>
      <style>
        body, html { 
          margin: 0; 
          padding: 0; 
          height: 100%; 
          font-family: system-ui, sans-serif; 
          background: transparent;
        }
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          max-width: 100%;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          background: ${bgColor};
          color: ${textColor};
        }
        .chat-header {
          padding: 12px 16px;
          background: ${isDark ? '#1A1F2C' : primaryColor};
          color: white;
          display: flex;
          align-items: center;
        }
        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${primaryLightColor};
          color: ${primaryColor};
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-weight: bold;
        }
        .messages {
          flex-grow: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .input-area {
          display: flex;
          padding: 12px;
          border-top: 1px solid ${borderColor};
          background: ${bgColor};
        }
        input {
          flex-grow: 1;
          padding: 8px 12px;
          border: 1px solid ${borderColor};
          border-radius: 4px;
          margin-right: 8px;
          background: ${inputBgColor};
          color: ${textColor};
        }
        button {
          background: ${primaryColor};
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 16px;
          cursor: pointer;
        }
        button:hover {
          opacity: 0.9;
        }
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .message {
          max-width: 85%;
          padding: 10px 14px;
          border-radius: 18px;
          line-height: 1.4;
          white-space: pre-wrap;
        }
        .bot {
          align-self: flex-start;
          background: ${messageBgBot};
          color: ${messageColorBot};
          border-top-left-radius: 4px;
        }
        .user {
          align-self: flex-end;
          background: ${messageBgUser};
          color: ${messageColorUser};
          border-top-right-radius: 4px;
        }
        .credit {
          ${hideCredit ? 'display: none;' : ''}
          font-size: 10px;
          text-align: center;
          margin-top: 4px;
          color: #9ca3af;
        }
        .credit a {
          color: ${primaryColor};
          text-decoration: none;
        }
        .loader {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid ${isDark ? '#374151' : '#f3f4f6'};
          border-radius: 50%;
          border-top-color: ${primaryColor};
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }
        .agent-description {
          font-size: 12px;
          opacity: 0.8;
          margin-top: 2px;
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .hidden {
          display: none;
        }
        .markdown-content code {
          background: ${isDark ? '#1f2937' : '#f1f5f9'};
          padding: 2px 4px;
          border-radius: 4px;
          font-family: monospace;
        }
        .markdown-content pre {
          background: ${isDark ? '#1f2937' : '#f1f5f9'};
          padding: 8px;
          border-radius: 4px;
          overflow-x: auto;
        }
        .markdown-content a {
          color: ${primaryColor};
          text-decoration: underline;
        }
        .markdown-content ul, .markdown-content ol {
          padding-left: 20px;
        }
        
        ${isPreview ? `
        #luvvix-preview-container {
          width: 100%;
          height: 100%;
        }
        .preview-note {
          background-color: ${primaryColor}20;
          color: ${primaryColor};
          border-left: 4px solid ${primaryColor};
          padding: 8px 12px;
          margin: 0;
          font-size: 12px;
        }
        ` : ''}
      </style>
    </head>
    <body>
      ${isPreview ? 
        `<div class="preview-note">Aperçu du mode d'intégration: ${embedType === 'iframe' ? 'iFrame' : embedType === 'script' ? 'Script' : 'Popup'}</div>
         <div id="luvvix-preview-container"></div>` 
        : ''
      }
      
      <div id="luvvix-chat-container" class="chat-container ${isPreview && (embedType === 'script' || embedType === 'popup') ? 'hidden' : ''}">
        <div class="chat-header">
          <div class="avatar">${agent.name.charAt(0)}</div>
          <div>
            <div>${agent.name}</div>
            ${agent.objective ? `<div class="agent-description">${agent.objective}</div>` : ''}
          </div>
        </div>
        <div class="messages" id="messages">
          <div class="message bot markdown-content">Bonjour ! Comment puis-je vous aider aujourd'hui ?</div>
        </div>
        <div class="input-area">
          <input type="text" id="user-input" placeholder="Posez votre question..." />
          <button id="send-btn">Envoyer</button>
        </div>
      </div>
      <div class="credit">Propulsé par <a href="https://luvvix.it.com/ai-studio" target="_blank">LuvviX AI Studio</a></div>

      <script>
        // Simple markdown-like formatting
        function formatMarkdown(text) {
          if (!text) return '';
          
          // Code blocks
          text = text.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>');
          
          // Inline code
          text = text.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
          
          // Bold
          text = text.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
          
          // Italic
          text = text.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
          
          // Links
          text = text.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
          
          // Lists
          text = text.replace(/^\s*-\s+(.+)/gm, '<li>$1</li>').replace(/(<li>[\\s\\S]*?<\/li>)/g, '<ul>$1</ul>');
          text = text.replace(/^\s*\\d+\\.\\s+(.+)/gm, '<li>$1</li>').replace(/(<li>[\\s\\S]*?<\/li>)/g, '<ol>$1</ol>');
          
          // Paragraphs
          text = text.replace(/\\n\\n/g, '<br><br>');
          
          return text;
        }
      
        const messages = document.getElementById('messages');
        const userInput = document.getElementById('user-input');
        const sendButton = document.getElementById('send-btn');
        const agentId = "${agent.id}";
        let sessionId = localStorage.getItem('luvvix_session_id') || crypto.randomUUID();
        localStorage.setItem('luvvix_session_id', sessionId);
        
        let conversationId = null;
        let isLoading = false;

        // Initialize with custom start message if provided
        ${startMessage ? `
        window.addEventListener('DOMContentLoaded', () => {
          if(userInput) {
            userInput.value = "${startMessage.replace(/"/g, '\\"')}";
            setTimeout(() => sendMessage(), 500);
          }
        });
        ` : ''}

        async function sendMessage() {
          if (isLoading) return;
          
          const userMessage = userInput.value.trim();
          if (!userMessage) return;
          
          // Add user message to chat
          const userMessageElement = document.createElement('div');
          userMessageElement.className = 'message user';
          userMessageElement.textContent = userMessage;
          messages.appendChild(userMessageElement);
          
          // Clear input
          userInput.value = '';
          
          // Disable input and button while loading
          userInput.disabled = true;
          sendButton.disabled = true;
          
          // Show loading indicator
          isLoading = true;
          const loadingElement = document.createElement('div');
          loadingElement.className = 'message bot';
          loadingElement.innerHTML = '<span class="loader"></span> En train de réfléchir...';
          messages.appendChild(loadingElement);
          
          // Auto scroll to bottom
          messages.scrollTop = messages.scrollHeight;
          
          try {
            // Prepare message data
            const messageData = {
              agentId,
              message: userMessage,
              conversationId,
              sessionId,
              embedded: true
            };
            
            // Call API
            const response = await fetch('https://luvvix.it.com/functions/v1/cerebras-chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(messageData)
            });
            
            const data = await response.json();
            
            // Remove loading indicator
            messages.removeChild(loadingElement);
            
            if (data.error) {
              throw new Error(data.error);
            }
            
            // Save conversation ID for future requests
            if (data.conversationId) {
              conversationId = data.conversationId;
            }
            
            // Add bot response to chat
            const botMessageElement = document.createElement('div');
            botMessageElement.className = 'message bot markdown-content';
            botMessageElement.innerHTML = formatMarkdown(data.reply || data.message);
            messages.appendChild(botMessageElement);
          } catch (error) {
            console.error('Error sending message:', error);
            
            // Remove loading indicator if still present
            if (messages.contains(loadingElement)) {
              messages.removeChild(loadingElement);
            }
            
            // Show error message
            const errorElement = document.createElement('div');
            errorElement.className = 'message bot';
            errorElement.textContent = 'Désolé, une erreur est survenue. Veuillez réessayer.';
            messages.appendChild(errorElement);
          } finally {
            isLoading = false;
            // Re-enable input and button
            userInput.disabled = false;
            sendButton.disabled = false;
            // Auto scroll to bottom
            messages.scrollTop = messages.scrollHeight;
          }
        }
        
        // Event listeners
        sendButton.addEventListener('click', sendMessage);
        userInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') sendMessage();
        });
        
        ${previewJS}
      </script>
    </body>
    </html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const agentId = url.searchParams.get('agentId');
    
    // Get URL parameters for customization
    const theme = url.searchParams.get('theme') || 'light'; // light or dark
    const accentColor = url.searchParams.get('accentColor') || '#6366f1'; // Hex color
    const hideCredit = url.searchParams.get('hideCredit') === 'true';
    const startMessage = url.searchParams.get('startMessage') || '';
    
    // New parameter for preview mode
    const isPreview = url.pathname.includes('/preview-embed/') || url.searchParams.get('preview') === 'true';
    const embedType = url.searchParams.get('embedType') || 'iframe';
    
    // For GET requests, send the HTML for embedding the agent
    if (req.method === 'GET') {
      if (!agentId) {
        throw new Error('Agent ID non spécifié');
      }

      console.log(`Processing GET request for agent ${agentId}, isPreview: ${isPreview}, embedType: ${embedType}`);

      // Check if agent is in cache
      let agent = getCachedAgent(agentId);
      
      // If not in cache, fetch from database
      if (!agent) {
        // Check if agent exists and is public
        const { data, error } = await supabase
          .from('ai_agents')
          .select('id, name, avatar_style, is_public, slug, objective')
          .eq('id', agentId)
          .single();

        if (error || !data) {
          console.error(`Agent not found error: ${error?.message}`);
          throw new Error('Agent non trouvé');
        }

        if (!data.is_public) {
          console.error(`Agent ${agentId} is not public`);
          throw new Error('Cet agent n\'est pas disponible pour l\'intégration');
        }
        
        agent = data;
        setCachedAgent(agentId, agent);
        
        // Increment view counter
        await supabase.rpc('increment_agent_views', { agent_id: agentId });
      }

      // Generate embed HTML with appropriate CORS settings
      const html = generateChatHtml(agent, theme, accentColor, hideCredit, startMessage, isPreview, embedType);
      
      // Cache the response for future use
      const cacheKey = `html_${agentId}_${theme}_${accentColor}_${hideCredit}_${startMessage}_${isPreview}_${embedType}`;
      setCachedResponse(cacheKey, html);

      return new Response(html, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      });
    }
    
    // Handle POST requests (for the chat API)
    if (req.method === 'POST') {
      const { conversation, message, agentId, sessionId, embedded = false } = await req.json();
      
      if (!agentId) {
        throw new Error('Agent ID est requis');
      }

      console.log(`Processing POST request for agent ${agentId}, sessionId: ${sessionId?.substring(0, 8)}...`);

      // Check if we have a cached agent
      let agent = getCachedAgent(agentId);
      
      // If not in cache, fetch from database
      if (!agent) {
        const { data: agentData, error: agentError } = await supabase
          .from('ai_agents')
          .select('*')
          .eq('id', agentId)
          .single();

        if (agentError || !agentData) {
          console.error(`Agent not found: ${agentError?.message}`);
          throw new Error('Agent non trouvé');
        }
        
        agent = agentData;
        setCachedAgent(agentId, agent);
      }

      // Construire le prompt système
      let systemPrompt = agent.system_prompt;
      
      if (!systemPrompt) {
        systemPrompt = `Tu es ${agent.name}, `;
        
        if (agent.personality) {
          switch (agent.personality) {
            case 'expert':
              systemPrompt += `un expert formel et précis dans ton domaine. `;
              break;
            case 'friendly':
              systemPrompt += `avec une personnalité chaleureuse et décontractée. `;
              break;
            case 'concise':
              systemPrompt += `avec un style direct et efficace. `;
              break;
            case 'empathetic':
              systemPrompt += `avec une approche empathique et compréhensive. `;
              break;
            default:
              systemPrompt += `avec une personnalité ${agent.personality}. `;
          }
        }
        
        if (agent.objective) {
          systemPrompt += `Ton objectif est ${agent.objective}.`;
        }
      }

      // Récupérer la clé API Cerebras et la configuration depuis les secrets
      const cerebrasApiKey = Deno.env.get('CEREBRAS_API_KEY') || '';
      const endpoint = Deno.env.get('CEREBRAS_ENDPOINT') || 'https://api.cerebras.ai/v1/chat/completions';
      const modelName = Deno.env.get('CEREBRAS_MODEL') || 'cerebras/Cerebras-GPT-4.5-8B-Base';
      
      if (!cerebrasApiKey) {
        throw new Error('Clé API Cerebras non configurée');
      }
      
      console.log(`Using Cerebras model: ${modelName}`);
      
      // Récupérer le contexte de l'agent depuis la base de données
      let contextContent = "";
      const { data: contextData, error: contextError } = await supabase
        .from('ai_agent_context')
        .select('content_type, content, url')
        .eq('agent_id', agentId);
        
      if (!contextError && contextData && contextData.length > 0) {
        // Ajouter le contenu du contexte au prompt système
        contextContent = "\n\nVoici des informations supplémentaires à connaître:\n\n";
        
        for (const ctx of contextData) {
          if (ctx.content_type === "text" && ctx.content) {
            contextContent += ctx.content + "\n\n";
          } else if (ctx.content_type === "url" && ctx.url) {
            contextContent += `Information provenant de: ${ctx.url}\n\n`;
          }
        }
      }
      
      // Ajouter le contexte au prompt système s'il existe
      if (contextContent) {
        systemPrompt += contextContent;
      }

      // Construire les messages pour l'API
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        }
      ];
      
      // Ajouter les messages de conversation précédents si disponibles
      if (conversation && Array.isArray(conversation)) {
        conversation.forEach(msg => {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        });
      }
      
      // Ajouter le nouveau message de l'utilisateur
      if (message) {
        messages.push({
          role: 'user',
          content: message
        });
      }

      // Check if we have a cached response for this exact request
      const requestHash = `req_${agentId}_${message}_${JSON.stringify(conversation)}`;
      const cachedResp = getCachedResponse(requestHash);
      
      if (cachedResp) {
        console.log(`Using cached response for request ${requestHash.substring(0, 20)}...`);
        return new Response(JSON.stringify(cachedResp), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`Calling Cerebras API with ${messages.length} messages`);

      // Appeler l'API Cerebras
      const response = await fetch('https://luvvix.it.com/functions/v1/cerebras-chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cerebrasApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: modelName,
          messages: messages,
          max_tokens: 2000,
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
      console.log(`Got response from Cerebras API, tokens: ${data.usage?.total_tokens || 'unknown'}`);

      const result = {
        reply: data.choices[0].message.content,
        usage: data.usage,
        conversationId: null
      };

      // Si c'est une conversation intégrée avec un ID de session, sauvegarder la conversation
      if (embedded && sessionId) {
        try {
          // Vérifier si une conversation existe déjà pour cette session et cet agent
          let conversationId = null;
          
          const { data: existingConv } = await supabase
            .from('ai_conversations')
            .select('id')
            .eq('agent_id', agentId)
            .eq('session_id', sessionId)
            .eq('is_guest', true)
            .maybeSingle();
            
          if (existingConv) {
            conversationId = existingConv.id;
            console.log(`Using existing conversation ID: ${conversationId}`);
          } else {
            // Créer une nouvelle conversation
            const { data: newConversation, error: convError } = await supabase
              .from('ai_conversations')
              .insert({
                agent_id: agentId,
                is_guest: true,
                session_id: sessionId
              })
              .select()
              .single();
              
            if (!convError) {
              conversationId = newConversation.id;
              console.log(`Created new conversation ID: ${conversationId}`);
            }
          }
          
          if (conversationId) {
            // Ajouter le message utilisateur
            await supabase
              .from('ai_messages')
              .insert({
                conversation_id: conversationId,
                content: message,
                role: 'user'
              });
              
            // Ajouter la réponse de l'assistant
            await supabase
              .from('ai_messages')
              .insert({
                conversation_id: conversationId,
                content: result.reply,
                role: 'assistant'
              });
              
            result.conversationId = conversationId;
          }
        } catch (error) {
          console.error('Error saving conversation:', error);
          // Continue même en cas d'erreur pour ne pas bloquer l'utilisateur
        }
      }
      
      // Cache the result
      setCachedResponse(requestHash, result);
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Méthode non supportée');
  } catch (error) {
    console.error('Error in cerebras-embed function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
