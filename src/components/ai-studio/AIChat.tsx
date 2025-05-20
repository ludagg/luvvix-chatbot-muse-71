import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { incrementAgentViews } from '@/integrations/supabase/client';

interface AIMessage {
  role: 'assistant' | 'user';
  content: string;
}

interface AIAgent {
  id: string;
  name: string;
  objective: string;
  avatar_url?: string;
  user_profiles?: {
    full_name?: string;
    avatar_url?: string;
    username?: string;
  };
}

interface AIChatProps {
  agent: AIAgent;
  className?: string;
  embedded?: boolean;
}

const AIChat = ({ agent, className = "", embedded = false }: AIChatProps) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    { role: 'assistant', content: `Bonjour ! Je suis ${agent.name}. ${agent.objective}` }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Increment views count when the chat is opened in embedded mode
  useState(() => {
    if (embedded && agent?.id) {
      incrementAgentViews(agent.id).catch(console.error);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Simulate AI response (in a real app, this would call an API)
      setTimeout(() => {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            content: `Merci pour votre message. En tant que ${agent.name}, je suis là pour vous aider avec ${agent.objective}.` 
          }
        ]);
        setIsLoading(false);
      }, 1000);
      
      // In a real implementation, you would call your AI endpoint here:
      /*
      const response = await fetch('your-ai-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          agentId: agent.id,
          // other required params
        })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      */
      
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Désolé, j'ai rencontré un problème. Veuillez réessayer." 
      }]);
      setIsLoading(false);
    }
  };

  return (
    <Card className={`flex flex-col overflow-hidden ${className} ${embedded ? 'border-0 shadow-none rounded-none' : 'shadow-md border border-slate-200 dark:border-slate-700'}`}>
      <CardHeader className={`p-4 border-b flex items-center gap-3 ${embedded ? 'bg-gradient-to-br from-indigo-600/90 to-violet-800/90 text-white' : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'}`}>
        <Avatar className="h-10 w-10 border-2 border-white/20">
          {agent.avatar_url ? (
            <img 
              src={agent.avatar_url} 
              alt={agent.name} 
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-violet-500 text-white text-lg font-semibold">
              {agent.name.charAt(0)}
            </div>
          )}
        </Avatar>
        <div>
          <h3 className={`font-medium text-lg ${embedded ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
            {agent.name}
          </h3>
          {!embedded && agent.user_profiles && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Par {agent.user_profiles.full_name || agent.user_profiles.username || "Utilisateur"}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow overflow-auto p-0">
        <div className="flex flex-col p-4 gap-4 min-h-[300px] max-h-[600px] overflow-y-auto">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user' 
                    ? 'bg-violet-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1 text-xs text-violet-600 dark:text-violet-400 font-medium">
                    <Sparkles size={12} />
                    {agent.name}
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg px-4 py-2 bg-slate-100 dark:bg-slate-800">
                <div className="flex items-center gap-2 text-xs text-violet-600 dark:text-violet-400 font-medium mb-1">
                  <Sparkles size={12} />
                  {agent.name}
                </div>
                <div className="flex gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce animation-delay-200">.</span>
                  <span className="animate-bounce animation-delay-400">.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-2 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
          <Input
            className="flex-grow"
            placeholder="Tapez votre message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isLoading}
            className="bg-violet-600 hover:bg-violet-700 text-white"
          >
            <Send size={18} />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default AIChat;
