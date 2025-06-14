
import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedResults?: string[];
}

interface AIAssistantProps {
  messages: AIMessage[];
  isThinking: boolean;
  onMessage: (message: string) => void;
}

const AIAssistant = ({ messages, isThinking, onMessage }: AIAssistantProps) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="h-96 flex flex-col">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Assistant IA</h3>
            <p className="text-xs text-gray-500">Toujours prêt à vous aider</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-sm">
                Posez-moi une question sur vos recherches !
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.content}
              </div>
              
              {message.type === 'user' && (
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          
          {isThinking && (
            <div className="flex gap-3 justify-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-lg px-3 py-2 text-sm">
                <div className="flex items-center gap-1">
                  <span>Je réfléchis</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Demandez quelque chose..."
            className="flex-1"
            disabled={isThinking}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isThinking}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AIAssistant;
