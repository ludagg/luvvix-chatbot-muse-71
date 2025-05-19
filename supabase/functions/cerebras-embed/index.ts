
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Security-Policy': "frame-ancestors 'self' *.luvvix.it.com luvvix.it.com"
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
    const url = new URL(req.url);
    const agentId = url.searchParams.get('agentId');
    
    // For GET requests, send the HTML for embedding the agent
    if (req.method === 'GET') {
      if (!agentId) {
        throw new Error('Agent ID non spécifié');
      }

      // Check if agent exists and is public
      const { data: agent, error } = await supabase
        .from('ai_agents')
        .select('id, name, avatar_style, is_public, slug')
        .eq('id', agentId)
        .single();

      if (error || !agent) {
        throw new Error('Agent non trouvé');
      }

      if (!agent.is_public) {
        throw new Error('Cet agent n\'est pas disponible pour l\'intégration');
      }

      // Generate embed HTML with appropriate CORS settings
      const html = `
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
              background: white;
            }
            .chat-header {
              padding: 12px 16px;
              background: #1A1F2C;
              color: white;
              display: flex;
              align-items: center;
            }
            .avatar {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #6366f1;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;
              color: white;
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
              border-top: 1px solid #e5e7eb;
            }
            input {
              flex-grow: 1;
              padding: 8px 12px;
              border: 1px solid #d1d5db;
              border-radius: 4px;
              margin-right: 8px;
            }
            button {
              background: #6366f1;
              color: white;
              border: none;
              border-radius: 4px;
              padding: 8px 16px;
              cursor: pointer;
            }
            .message {
              max-width: 85%;
              padding: 10px 14px;
              border-radius: 18px;
              line-height: 1.4;
            }
            .bot {
              align-self: flex-start;
              background: #f3f4f6;
              border-top-left-radius: 4px;
            }
            .user {
              align-self: flex-end;
              background: #6366f1;
              color: white;
              border-top-right-radius: 4px;
            }
            .credit {
              font-size: 10px;
              text-align: center;
              margin-top: 4px;
              color: #9ca3af;
            }
            .credit a {
              color: #6366f1;
              text-decoration: none;
            }
            .loader {
              display: inline-block;
              width: 20px;
              height: 20px;
              border: 2px solid #f3f4f6;
              border-radius: 50%;
              border-top-color: #6366f1;
              animation: spin 1s linear infinite;
              margin-right: 8px;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            .hidden {
              display: none;
            }
          </style>
        </head>
        <body>
          <div class="chat-container">
            <div class="chat-header">
              <div class="avatar">${agent.name.charAt(0)}</div>
              <div>${agent.name}</div>
            </div>
            <div class="messages" id="messages">
              <div class="message bot">Bonjour ! Comment puis-je vous aider aujourd'hui ?</div>
            </div>
            <div class="input-area">
              <input type="text" id="user-input" placeholder="Posez votre question..." />
              <button id="send-btn">Envoyer</button>
            </div>
          </div>
          <div class="credit">Propulsé par <a href="https://luvvix.it.com/ai-studio" target="_blank">LuvviX AI Studio</a></div>

          <script>
            const messages = document.getElementById('messages');
            const userInput = document.getElementById('user-input');
            const sendButton = document.getElementById('send-btn');
            const agentId = "${agent.id}";
            let sessionId = localStorage.getItem('luvvix_session_id') || crypto.randomUUID();
            localStorage.setItem('luvvix_session_id', sessionId);
            
            let conversationId = null;
            let isLoading = false;

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
                const response = await fetch('https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/cerebras-chat', {
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
                botMessageElement.className = 'message bot';
                botMessageElement.textContent = data.reply || data.message;
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
                // Auto scroll to bottom
                messages.scrollTop = messages.scrollHeight;
              }
            }
            
            // Event listeners
            sendButton.addEventListener('click', sendMessage);
            userInput.addEventListener('keypress', (e) => {
              if (e.key === 'Enter') sendMessage();
            });
          </script>
        </body>
        </html>
      `;

      return new Response(html, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
        }
      });
    }
    
    // Handle POST requests (for the chat API)
    if (req.method === 'POST') {
      const { conversation, message, agentId, sessionId, embedded = false } = await req.json();
      
      if (!agentId) {
        throw new Error('Agent ID est requis');
      }

      // Récupérer l'agent depuis la base de données
      const { data: agent, error: agentError } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (agentError || !agent) {
        throw new Error('Agent non trouvé');
      }

      // Récupérer la clé API Cerebras et la configuration depuis les secrets
      const cerebrasApiKey = Deno.env.get('CEREBRAS_API_KEY') || '';
      const endpoint = Deno.env.get('CEREBRAS_ENDPOINT') || 'https://api.cerebras.ai/v1/completions';
      const modelName = Deno.env.get('CEREBRAS_MODEL') || 'cerebras/Cerebras-GPT-4.5-8B-Base';
      
      if (!cerebrasApiKey) {
        throw new Error('Clé API Cerebras non configurée');
      }

      // Construire le prompt système
      let systemPrompt = `Tu es ${agent.name}, `;
      
      if (agent.personality) {
        systemPrompt += `avec une personnalité ${agent.personality}. `;
      }
      
      if (agent.objective) {
        systemPrompt += `Ton objectif est ${agent.objective}.`;
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
          max_tokens: 1000,
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
