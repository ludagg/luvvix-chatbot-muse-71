
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'text/html; charset=utf-8'
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get agent information from URL
    const url = new URL(req.url);
    const agentId = url.searchParams.get('agent_id');
    const parentDomain = url.searchParams.get('parent') || '*';
    const theme = url.searchParams.get('theme') || 'light';
    
    if (!agentId) {
      throw new Error("L'ID de l'agent est requis");
    }

    // Create a simple embedded chat interface
    const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>LuvviX AI Agent</title>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          height: 100%;
        }
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: ${theme === 'dark' ? '#1A1F2C' : '#fff'};
          color: ${theme === 'dark' ? '#fff' : '#333'};
        }
        .chat-header {
          padding: 10px;
          background-color: ${theme === 'dark' ? '#2C1F3D' : '#f0f0f0'};
          display: flex;
          align-items: center;
          border-bottom: 1px solid ${theme === 'dark' ? '#3D2952' : '#e0e0e0'};
        }
        .chat-header h3 {
          margin: 0;
          font-size: 16px;
        }
        .chat-header .logo {
          height: 24px;
          margin-right: 10px;
        }
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 15px;
        }
        .message {
          margin-bottom: 10px;
          padding: 8px 12px;
          border-radius: 8px;
          max-width: 80%;
          word-break: break-word;
        }
        .user-message {
          background-color: ${theme === 'dark' ? '#3D2952' : '#e1f5fe'};
          margin-left: auto;
        }
        .bot-message {
          background-color: ${theme === 'dark' ? '#2C1F3D' : '#f5f5f5'};
        }
        .input-area {
          padding: 10px;
          border-top: 1px solid ${theme === 'dark' ? '#3D2952' : '#e0e0e0'};
          display: flex;
        }
        .input-area input {
          flex: 1;
          padding: 10px;
          border: 1px solid ${theme === 'dark' ? '#3D2952' : '#ddd'};
          border-radius: 4px;
          background-color: ${theme === 'dark' ? '#1A1F2C' : '#fff'};
          color: ${theme === 'dark' ? '#fff' : '#333'};
        }
        .input-area button {
          margin-left: 10px;
          padding: 10px 15px;
          background-color: #7c3aed;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .attribution {
          font-size: 11px;
          text-align: center;
          padding: 5px;
          color: ${theme === 'dark' ? '#aaa' : '#888'};
        }
      </style>
    </head>
    <body>
      <div class="chat-container">
        <div class="chat-header">
          <img src="https://luvvix.it.com/logo.png" alt="LuvviX Logo" class="logo" onerror="this.style.display='none'">
          <h3>LuvviX AI Assistant</h3>
        </div>
        <div class="messages-container" id="messages">
          <div class="message bot-message">Bonjour ! Comment puis-je vous aider aujourd'hui ?</div>
        </div>
        <div class="input-area">
          <input type="text" id="user-input" placeholder="Écrivez votre message...">
          <button onclick="sendMessage()">Envoyer</button>
        </div>
        <div class="attribution">
          Propulsé par <a href="https://luvvix.it.com/ai-studio" target="_blank">LuvviX AI Studio</a>
        </div>
      </div>

      <script>
        const agentId = "${agentId}";
        const messagesContainer = document.getElementById('messages');
        const userInput = document.getElementById('user-input');
        
        // Handle sending messages
        async function sendMessage() {
          const message = userInput.value.trim();
          if (!message) return;
          
          // Add user message to chat
          addMessage(message, 'user');
          userInput.value = '';
          
          try {
            // Call Cerebras API via our edge function
            const response = await fetch('https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/cerebras-chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                conversation: [{ role: 'user', content: message }],
                agentId: agentId,
                maxTokens: 1000
              }),
            });
            
            const data = await response.json();
            
            if (data.reply) {
              addMessage(data.reply, 'bot');
            } else if (data.error) {
              addMessage("Désolé, une erreur s'est produite: " + data.error, 'bot');
            }
          } catch (error) {
            addMessage("Désolé, je ne peux pas répondre pour le moment. Veuillez réessayer plus tard.", 'bot');
            console.error('Error:', error);
          }
        }
        
        // Add a message to the chat
        function addMessage(text, sender) {
          const messageDiv = document.createElement('div');
          messageDiv.classList.add('message');
          messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
          messageDiv.textContent = text;
          messagesContainer.appendChild(messageDiv);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        // Press Enter to send message
        userInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            sendMessage();
          }
        });

        // Communicate with parent window if embedded in iframe
        window.addEventListener('message', function(event) {
          // Check origin for security
          const allowedOrigin = "${parentDomain}";
          if (allowedOrigin !== '*' && event.origin !== allowedOrigin) return;
          
          if (event.data && event.data.type === 'sendMessage') {
            userInput.value = event.data.message;
            sendMessage();
          }
        });
      </script>
    </body>
    </html>
    `;

    return new Response(html, { 
      headers: {
        ...corsHeaders,
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': `frame-ancestors ${parentDomain};`
      }
    });
  } catch (error) {
    console.error('Error in cerebras-embed function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
