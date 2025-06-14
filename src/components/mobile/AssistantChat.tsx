
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Lightbulb, Calendar, Settings, TrendingUp } from 'lucide-react';
import { luvvixAIAssistant } from '@/services/luvvix-ai-assistant';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AssistantChatProps {
  onClose?: () => void;
}

const AssistantChat = ({ onClose }: AssistantChatProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const quickSuggestions = [
    "Analyser mes habitudes de productivité",
    "Créer un rappel pour demain matin",
    "Optimiser mon planning de la semaine",
    "Comment améliorer ma productivité ?"
  ];

  const functionSuggestions = [
    {
      icon: Calendar,
      title: "Créer un événement",
      example: "Créer une réunion équipe demain à 14h"
    },
    {
      icon: Lightbulb,
      title: "Créer un rappel",
      example: "Me rappeler d'appeler le client lundi"
    },
    {
      icon: TrendingUp,
      title: "Analyser mes habitudes",
      example: "Analyser ma productivité ce mois"
    },
    {
      icon: Settings,
      title: "Créer un formulaire",
      example: "Créer un formulaire de satisfaction"
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Bonjour ! Je suis votre assistant IA personnel LuvviX. 🚀

Je vous aide à :
• 📅 Gérer votre calendrier et créer des événements
• 🔔 Créer des rappels intelligents
• 📊 Analyser vos habitudes et patterns
• 📝 Créer des formulaires personnalisés
• 🎯 Optimiser votre productivité

Comment puis-je vous aider aujourd'hui ?`,
        timestamp: new Date()
      }]);
    }
  }, [user]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;
    
    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await luvvixAIAssistant.processMessage(user.id, inputMessage);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erreur assistant IA:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre demande",
        variant: "destructive"
      });
      
      const errorMessage: Message = {
        role: 'assistant',
        content: "Désolé, je rencontre des difficultés techniques. Pouvez-vous réessayer ?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Fonctions disponibles</h3>
              {functionSuggestions.map((func, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(func.example)}
                  className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <func.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{func.title}</h4>
                      <p className="text-xs text-blue-600 mt-1 italic">"{func.example}"</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
              <p className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {format(message.timestamp, 'HH:mm')}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500">L'IA réfléchit...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {quickSuggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssistantChat;
