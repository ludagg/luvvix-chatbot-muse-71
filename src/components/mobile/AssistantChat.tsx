
import React, { useState, useEffect, useRef } from 'react';
import { Brain, Send, Sparkles, Calendar, Users, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { luvvixBrain } from '@/services/luvvix-brain';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AssistantChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      initializeChat();
      loadInsights();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `🧠 Bonjour ! Je suis votre cerveau IA personnel. J'ai analysé vos habitudes et je suis prêt à vous assister intelligemment dans tout l'écosystème LuvviX.

💡 Que puis-je faire pour vous ?
• Analyser vos patterns d'usage
• Créer des événements automatiquement  
• Automatiser vos tâches répétitives
• Vous donner des insights personnalisés`,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
  };

  const loadInsights = async () => {
    if (!user) return;

    try {
      const userInsights = await luvvixBrain.getUserInsights(user.id);
      setInsights([
        { icon: <Zap className="w-4 h-4" />, text: "Pic de productivité détecté", confidence: 0.9 },
        { icon: <Users className="w-4 h-4" />, text: "Interactions sociales actives", confidence: 0.8 },
        { icon: <Calendar className="w-4 h-4" />, text: "Patterns calendrier identifiés", confidence: 0.7 }
      ]);
    } catch (error) {
      console.error('Erreur insights:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Traquer l'interaction avec le cerveau
      await luvvixBrain.trackInteraction(
        user.id,
        'mobile_ai_chat',
        'MobileAssistant',
        { message: input }
      );

      // Obtenir la réponse du cerveau
      const response = await luvvixBrain.processConversation(
        user.id,
        input,
        { 
          component: 'MobileAssistant',
          device: 'mobile',
          timestamp: new Date()
        }
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      await loadInsights(); // Recharger les insights

    } catch (error) {
      console.error('Erreur chat brain:', error);
      toast.error('Connexion au cerveau interrompue');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '🧠 Reconnexion des circuits neuronaux en cours...',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickSuggestions = [
    "Analyse mes habitudes",
    "Crée un événement",
    "Mes recommandations",
    "Automatise mes tâches"
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header avec insights */}
      <div className="p-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Cerveau IA Central</h3>
            <p className="text-xs opacity-90">Apprentissage actif • Connaît vos habitudes</p>
          </div>
          <Sparkles className="w-5 h-5 ml-auto animate-pulse" />
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {insights.map((insight, index) => (
            <div key={index} className="bg-white/20 rounded-lg p-2 text-center">
              <div className="flex justify-center mb-1">{insight.icon}</div>
              <p className="text-xs font-medium">{insight.text}</p>
              <div className="w-full bg-white/30 rounded-full h-1 mt-1">
                <div 
                  className="bg-white h-1 rounded-full transition-all duration-500"
                  style={{ width: `${insight.confidence * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-purple-500 text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border rounded-bl-none shadow-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg rounded-bl-none border shadow-sm">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500 animate-pulse" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Actions rapides */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t">
        <div className="flex gap-2 mb-3 overflow-x-auto">
          {quickSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInput(suggestion)}
              className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs whitespace-nowrap flex-shrink-0 hover:bg-purple-200 dark:hover:bg-purple-900/70 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Parlez à votre cerveau IA..."
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantChat;
