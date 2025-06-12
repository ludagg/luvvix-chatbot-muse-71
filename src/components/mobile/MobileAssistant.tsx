
import React, { useState, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

const MobileAssistant = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Bonjour ! Je suis votre assistant IA LuvviX. Comment puis-je vous aider aujourd'hui ?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { 
      id: 'weather', 
      text: 'Météo du jour', 
      icon: '☀️',
      response: 'La température actuelle est de 22°C avec un ciel dégagé. Parfait pour une promenade !'
    },
    { 
      id: 'schedule', 
      text: 'Mon planning', 
      icon: '📅',
      response: 'Vous avez une réunion équipe projet prévue à 14:30 aujourd\'hui en salle de conférence A.'
    },
    { 
      id: 'news', 
      text: 'Actualités', 
      icon: '📰',
      response: 'Voici les dernières actualités : Les développements en IA continuent de progresser rapidement...'
    },
    { 
      id: 'translate', 
      text: 'Traduire', 
      icon: '🌐',
      response: 'Je peux vous aider à traduire dans plus de 100 langues. Que souhaitez-vous traduire ?'
    },
    { 
      id: 'help', 
      text: 'Aide', 
      icon: '❓',
      response: 'Je peux vous aider avec la météo, vos rendez-vous, traduire du texte, chercher des informations et bien plus !'
    },
    { 
      id: 'services', 
      text: 'Services LuvviX', 
      icon: '⚡',
      response: 'LuvviX offre une suite complète de services : AI Studio, Translate, Weather, Forms, Learn, News, Cloud, Mail et bien plus !'
    }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('météo') || lowerMessage.includes('temps')) {
      return 'Il fait actuellement 22°C avec un ciel dégagé. La température maximale prévue est de 25°C. Parfait pour sortir !';
    }
    
    if (lowerMessage.includes('planning') || lowerMessage.includes('agenda') || lowerMessage.includes('rendez-vous')) {
      return 'Selon votre agenda, vous avez une réunion équipe projet à 14:30 aujourd\'hui. Souhaitez-vous que je vous rappelle 15 minutes avant ?';
    }
    
    if (lowerMessage.includes('actualité') || lowerMessage.includes('news') || lowerMessage.includes('nouvelle')) {
      return 'Voici les dernières actualités importantes : Les innovations en intelligence artificielle continuent de transformer notre quotidien...';
    }
    
    if (lowerMessage.includes('traduire') || lowerMessage.includes('traduction')) {
      return 'Je peux traduire dans plus de 100 langues grâce à LuvviX Translate. Dans quelle langue souhaitez-vous traduire ?';
    }
    
    if (lowerMessage.includes('services') || lowerMessage.includes('luvvix')) {
      return 'LuvviX propose une suite complète de services intelligents : AI Studio pour créer des agents IA, Translate pour la traduction, Weather pour la météo, Forms pour les formulaires, Learn pour l\'apprentissage, et bien plus encore !';
    }
    
    if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
      return 'Je suis là pour vous aider ! Je peux vous renseigner sur la météo, vos rendez-vous, traduire du texte, vous donner les actualités, vous expliquer les services LuvviX, et répondre à vos questions.';
    }
    
    // Réponses génériques intelligentes
    const responses = [
      'C\'est une excellente question ! Laissez-moi vous aider avec ça.',
      'Je comprends votre demande. Voici ce que je peux vous proposer...',
      'Intéressant ! Permettez-moi de vous donner plus d\'informations à ce sujet.',
      'Je vais faire de mon mieux pour vous aider. Pouvez-vous me donner plus de détails ?',
      'C\'est dans mes compétences ! Je vais vous assister avec plaisir.'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);

    // Simuler le temps de réponse de l'IA
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: generateAIResponse(inputText),
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // 1-3 secondes
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    const userMessage: Message = {
      id: messages.length + 1,
      text: action.text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: action.response,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
      };

      recognition.onerror = () => {
        toast({
          title: "Erreur",
          description: "Impossible d'accéder au microphone",
          variant: "destructive",
        });
      };

      recognition.start();
    } else {
      toast({
        title: "Non supporté",
        description: "La reconnaissance vocale n'est pas supportée par votre navigateur",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Assistant LuvviX</h2>
            <p className="text-sm text-green-500 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              En ligne
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className={`text-xs mt-2 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 border border-gray-200 shadow-sm px-4 py-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 bg-white border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-3">Actions rapides :</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action)}
              className="flex items-center space-x-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors active:scale-95"
            >
              <span className="text-lg">{action.icon}</span>
              <span className="text-sm font-medium text-gray-700">{action.text}</span>
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-2xl border-0 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          
          <button
            onClick={handleVoiceInput}
            className="w-12 h-12 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
            </svg>
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileAssistant;
