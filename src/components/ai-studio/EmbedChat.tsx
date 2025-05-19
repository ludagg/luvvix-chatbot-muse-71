
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bot, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TooltipProvider } from "@/components/ui/tooltip";

interface EmbedChatProps {
  agentId: string;
  theme?: 'light' | 'dark';
  accentColor?: string;
  hideCredit?: boolean;
  startMessage?: string;
  mode?: 'inline' | 'popup';
}

export default function EmbedChat({ 
  agentId, 
  theme = 'light', 
  accentColor = '#6366f1',
  hideCredit = false,
  startMessage = '',
  mode = 'inline'
}: EmbedChatProps) {
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState(startMessage);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => localStorage.getItem('luvvix_chat_session') || crypto.randomUUID());
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(mode === 'inline');

  // Format markdown-like syntax
  const formatMessage = (text: string) => {
    if (!text) return '';
    
    // Code blocks
    let formattedText = text.replace(/```([^`]+)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold
    formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    formattedText = formattedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Links
    formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Line breaks
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    return formattedText;
  };

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Save session ID
  useEffect(() => {
    localStorage.setItem('luvvix_chat_session', sessionId);
  }, [sessionId]);

  // Fetch agent information
  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const { data, error } = await supabase
          .from("ai_agents")
          .select("*")
          .eq("id", agentId)
          .single();
          
        if (error) throw error;
        
        setAgent(data);
        
        // Add welcome message
        setMessages([{
          role: 'assistant',
          content: `Bonjour ! Je suis ${data.name}. Comment puis-je vous aider aujourd'hui ?`
        }]);
      } catch (error) {
        console.error("Error fetching agent:", error);
        setMessages([{
          role: 'assistant',
          content: "Désolé, je n'ai pas pu charger les informations de l'agent. Veuillez réessayer plus tard."
        }]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgent();
  }, [agentId]);

  // Auto-send start message if provided
  useEffect(() => {
    if (startMessage && !isTyping && agent) {
      handleSendMessage();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    setIsTyping(true);

    try {
      // Call Cerebras function
      const { data, error } = await supabase.functions.invoke('cerebras-chat', {
        body: {
          message: userMessage,
          agentId,
          conversationId,
          sessionId,
          embedded: true
        }
      });

      if (error) throw error;
      
      // Save conversation ID for future requests
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
      
      // Add bot response to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply || "Je n'ai pas pu générer une réponse." }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Désolé, une erreur est survenue. Veuillez réessayer." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const togglePopup = () => {
    setIsExpanded(!isExpanded);
  };

  const isDarkTheme = theme === 'dark';
  
  // Style variables based on theme and accent color
  const styles = {
    backgroundColor: isDarkTheme ? '#1a1f2c' : '#ffffff',
    textColor: isDarkTheme ? '#ffffff' : '#1a1f2c',
    inputBgColor: isDarkTheme ? '#374151' : '#f9fafb',
    borderColor: isDarkTheme ? '#374151' : '#e5e7eb',
    messageBgUser: accentColor,
    messageBgBot: isDarkTheme ? '#374151' : '#f3f4f6',
    messageColorUser: '#ffffff',
    messageColorBot: isDarkTheme ? '#e5e7eb' : '#1f2937',
  };

  // Popup button style
  if (mode === 'popup' && !isExpanded) {
    return (
      <TooltipProvider>
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={togglePopup} 
            style={{ backgroundColor: accentColor }}
            className="flex items-center shadow-lg rounded-full p-4 h-14 w-14">
            <Bot className="h-6 w-6" />
          </Button>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div 
        className={`flex flex-col ${mode === 'popup' ? 'fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] shadow-lg rounded-md overflow-hidden' : 'w-full h-full'}`}
        style={{ backgroundColor: styles.backgroundColor, color: styles.textColor }}
      >
        {/* Header */}
        <div className="flex items-center p-3 border-b" style={{ borderColor: styles.borderColor }}>
          {agent && (
            <>
              <Avatar className="h-8 w-8 mr-3 bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300">
                <AvatarFallback>
                  {agent.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium text-sm">{agent?.name || "Agent IA"}</h3>
                <p className="text-xs opacity-70 truncate max-w-[180px]">
                  {agent?.objective || "Assistant virtuel"}
                </p>
              </div>
            </>
          )}
          
          {mode === 'popup' && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={togglePopup}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Messages */}
        <div 
          className="flex-1 overflow-y-auto p-3 space-y-3"
          style={{ backgroundColor: isDarkTheme ? '#111827' : '#f9fafb' }}
        >
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user' 
                    ? 'rounded-br-none' 
                    : 'rounded-bl-none'
                }`}
                style={{
                  backgroundColor: msg.role === 'user' ? styles.messageBgUser : styles.messageBgBot,
                  color: msg.role === 'user' ? styles.messageColorUser : styles.messageColorBot
                }}
              >
                <div 
                  className="markdown-content"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div 
                className="max-w-[80%] rounded-lg rounded-bl-none px-3 py-2 text-sm"
                style={{
                  backgroundColor: styles.messageBgBot,
                  color: styles.messageColorBot
                }}
              >
                <div className="typing-indicator">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div 
          className="p-3 border-t flex items-center"
          style={{ borderColor: styles.borderColor }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question..."
            className="flex-1 px-3 py-2 rounded-full text-sm focus:outline-none focus:ring-2"
            style={{ 
              backgroundColor: styles.inputBgColor,
              borderColor: styles.borderColor,
              color: styles.textColor,
              focusRing: accentColor
            }}
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="ml-2 rounded-full w-8 h-8 p-0 flex items-center justify-center"
            style={{ 
              backgroundColor: accentColor,
              opacity: !inputValue.trim() || isTyping ? 0.7 : 1 
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Credit */}
        {!hideCredit && (
          <div className="text-center py-1 text-xs opacity-50">
            Propulsé par <a 
              href="https://luvvix.it.com/ai-studio" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: accentColor }}
            >
              LuvviX AI Studio
            </a>
          </div>
        )}
        
        <style jsx>{`
          .typing-indicator {
            display: flex;
            align-items: center;
          }
          
          .dot {
            width: 6px;
            height: 6px;
            background: currentColor;
            border-radius: 50%;
            margin-right: 3px;
            animation: bounce 1s infinite alternate;
            opacity: 0.6;
          }
          
          .dot:nth-child(2) {
            animation-delay: 0.2s;
          }
          
          .dot:nth-child(3) {
            animation-delay: 0.3s;
            margin-right: 0;
          }
          
          @keyframes bounce {
            0% {
              transform: translateY(0);
            }
            100% {
              transform: translateY(-4px);
            }
          }
          
          code {
            font-family: monospace;
            background-color: rgba(0,0,0,0.1);
            padding: 2px 4px;
            border-radius: 3px;
            font-size: 90%;
          }
          
          pre {
            background-color: rgba(0,0,0,0.1);
            padding: 10px;
            border-radius: 6px;
            overflow-x: auto;
          }
          
          pre code {
            background-color: transparent;
            padding: 0;
          }
        `}</style>
      </div>
    </TooltipProvider>
  );
}
