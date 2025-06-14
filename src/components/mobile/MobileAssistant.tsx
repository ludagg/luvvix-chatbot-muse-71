
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Mic, Plus, MessageCircle, Sparkles, Lightbulb, Calendar, Cloud, Settings, TrendingUp } from 'lucide-react';
import { luvvixAIAssistant } from '@/services/luvvix-ai-assistant';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface MobileAssistantProps {
  onBack: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MobileAssistant = ({ onBack }: MobileAssistantProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const quickSuggestions = [
    "Analyse mes habitudes de productivité",
    "Créer un rappel pour demain matin",
    "Quelles sont mes heures de pic ?",
    "Créer un événement réunion équipe",
    "Optimiser mon planning de la semaine",
    "Créer un formulaire de feedback",
    "Comment améliorer ma productivité ?",
    "Analyser mes interactions LuvviX"
  ];

  const functionSuggestions = [
    {
      icon: Calendar,
      title: "Créer un événement",
      description: "Programmer une réunion ou tâche",
      example: "Créer une réunion équipe demain à 14h"
    },
    {
      icon: Lightbulb,
      title: "Créer un rappel",
      description: "Ne jamais oublier vos tâches",
      example: "Me rappeler d'appeler le client lundi"
    },
    {
      icon: TrendingUp,
      title: "Analyser mes habitudes",
      description: "Comprendre vos patterns",
      example: "Analyser ma productivité ce mois"
    },
    {
      icon: Settings,
      title: "Créer un formulaire",
      description: "Collecter des informations",
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
    // Message de bienvenue personnalisé
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

Je comprends et apprends de vos interactions pour vous offrir des suggestions personnalisées. Comment puis-je vous aider aujourd'hui ?`,
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

  const handleFunctionSuggestionClick = (example: string) => {
    setInputMessage(example);
    inputRef.current?.focus();
  };

  const renderWelcomeScreen = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">LuvviX Assistant IA</h2>
      <p className="text-gray-600 mb-8 max-w-sm">
        Votre assistant personnel intelligent qui apprend de vos habitudes et vous aide à optimiser votre productivité.
      </p>

      {/* Fonctions principales */}
      <div className="w-full max-w-md space-y-3 mb-6">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <Settings className="w-4 h-4 mr-2" />
          Fonctions disponibles
        </h3>
        
        {functionSuggestions.map((func, index) => (
          <button
            key={index}
            onClick={() => handleFunctionSuggestionClick(func.example)}
            className="w-full p-3 text-left bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 rounded-lg transition-colors border border-blue-200"
          >
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <func.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{func.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{func.description}</p>
                <p className="text-xs text-blue-600 mt-1 italic">"{func.example}"</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Suggestions rapides */}
      <div className="w-full max-w-md space-y-3">
        <h3 className="text-sm font-medium text-gray-700 flex items-center">
          <Lightbulb className="w-4 h-4 mr-2" />
          Suggestions rapides
        </h3>
        
        {quickSuggestions.slice(0, 3).map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );

  const renderConversation = () => (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-auto p-4 space-y-4">
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
    </div>
  );

  const renderSidebar = () => (
    <div className={`fixed inset-y-0 left-0 w-80 bg-white border-r border-gray-200 transform transition-transform z-50 ${
      showSidebar ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Assistant IA</h3>
        <button
          onClick={() => setShowSidebar(false)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4">
        <button
          onClick={() => {
            setMessages([]);
            luvvixAIAssistant.clearConversationHistory(user?.id || '');
            setShowSidebar(false);
          }}
          className="w-full flex items-center space-x-2 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle conversation</span>
        </button>
      </div>
      
      <div className="px-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Fonctions rapides</h4>
        <div className="space-y-2">
          {functionSuggestions.map((func, index) => (
            <button
              key={index}
              onClick={() => {
                handleFunctionSuggestionClick(func.example);
                setShowSidebar(false);
              }}
              className="w-full p-2 text-left hover:bg-gray-50 rounded-lg text-sm border border-gray-200"
            >
              <div className="flex items-center space-x-2">
                <func.icon className="w-4 h-4 text-blue-500" />
                <span className="font-medium">{func.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-white/20 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold">LuvviX Assistant IA</h1>
            <p className="text-xs opacity-90">Assistant personnel intelligent</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowSidebar(true)}
          className="p-2 hover:bg-white/20 rounded-full"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      {messages.length === 0 ? renderWelcomeScreen() : renderConversation()}

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
              placeholder="Tapez votre message ou demande..."
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
            {quickSuggestions.slice(3, 6).map((suggestion, index) => (
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

      {/* Sidebar */}
      {renderSidebar()}
      
      {/* Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};

export default MobileAssistant;
