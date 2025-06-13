
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Plus, Zap, Brain, Globe, Cloud, Users, FileText, Settings, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: any[];
}

const MobileAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA LuvviX. Je peux vous aider avec tout dans l\'écosystème : créer des documents, gérer vos fichiers cloud, traduire du contenu, consulter la météo, et bien plus encore. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedMode, setSelectedMode] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const assistantModes = [
    {
      id: 'general',
      name: 'Assistant Général',
      icon: <Brain className="w-5 h-5" />,
      color: 'from-purple-500 to-indigo-600',
      description: 'Questions générales et aide'
    },
    {
      id: 'productivity',
      name: 'Productivité',
      icon: <Zap className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-600',
      description: 'Workflows et automatisation'
    },
    {
      id: 'translation',
      name: 'Traduction',
      icon: <Globe className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-600',
      description: 'Traduction multilingue'
    },
    {
      id: 'cloud',
      name: 'Gestion Cloud',
      icon: <Cloud className="w-5 h-5" />,
      color: 'from-orange-500 to-red-600',
      description: 'Organiser vos fichiers'
    },
    {
      id: 'social',
      name: 'Réseau Social',
      icon: <Users className="w-5 h-5" />,
      color: 'from-pink-500 to-rose-600',
      description: 'Publications et groupes'
    },
    {
      id: 'content',
      name: 'Création Contenu',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-violet-500 to-purple-600',
      description: 'Rédaction et édition'
    }
  ];

  const quickActions = [
    'Créer un document',
    'Traduire ce texte',
    'Consulter la météo',
    'Organiser mes fichiers',
    'Créer une publication',
    'Chercher des groupes',
    'Programmer un rappel',
    'Analyser des données'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simuler une réponse de l'IA
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getAIResponse(inputText, selectedMode),
        timestamp: new Date(),
        actions: getActionButtons(inputText, selectedMode)
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const getAIResponse = (input: string, mode: string) => {
    const responses = {
      general: `Je comprends votre demande "${input}". Voici ce que je peux faire pour vous aider avec l'écosystème LuvviX.`,
      productivity: `Pour optimiser votre productivité avec "${input}", je peux créer un workflow automatisé ou vous suggérer des raccourcis.`,
      translation: `Je peux traduire "${input}" dans la langue de votre choix. Dans quelle langue souhaitez-vous la traduction ?`,
      cloud: `Pour gérer "${input}" dans votre cloud, je peux organiser vos fichiers ou créer une nouvelle structure.`,
      social: `Concernant "${input}", je peux vous aider à créer du contenu pour vos réseaux sociaux ou trouver des groupes pertinents.`,
      content: `Pour créer du contenu sur "${input}", je peux rédiger un article, une présentation ou tout autre format que vous souhaitez.`
    };
    return responses[mode as keyof typeof responses] || responses.general;
  };

  const getActionButtons = (input: string, mode: string) => {
    const actions = {
      general: [
        { label: 'Ouvrir Services', action: 'navigate_services' },
        { label: 'Voir Profil', action: 'navigate_profile' }
      ],
      productivity: [
        { label: 'Créer Workflow', action: 'create_workflow' },
        { label: 'Ouvrir Forms', action: 'navigate_forms' }
      ],
      translation: [
        { label: 'LuvviX Translate', action: 'open_translate' },
        { label: 'Traduire maintenant', action: 'translate_now' }
      ],
      cloud: [
        { label: 'Ouvrir Cloud', action: 'navigate_cloud' },
        { label: 'Créer Dossier', action: 'create_folder' }
      ],
      social: [
        { label: 'LuvviX Center', action: 'navigate_center' },
        { label: 'Créer Publication', action: 'create_post' }
      ],
      content: [
        { label: 'LuvviX Docs', action: 'navigate_docs' },
        { label: 'Nouveau Document', action: 'create_document' }
      ]
    };
    return actions[mode as keyof typeof actions] || actions.general;
  };

  const handleActionClick = (action: string) => {
    toast({
      title: "Action exécutée",
      description: `Action: ${action}`,
    });
  };

  const handleQuickAction = (action: string) => {
    setInputText(action);
  };

  const toggleVoiceRecording = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast({
        title: "Écoute vocale",
        description: "Fonction vocale bientôt disponible",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 pb-20">
      {/* Header avec modes */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Assistant IA</h1>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-600 font-medium">En ligne</span>
          </div>
        </div>

        {/* Sélecteur de mode */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {assistantModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                selectedMode === mode.id
                  ? `bg-gradient-to-r ${mode.color} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {mode.icon}
              <span>{mode.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-900 shadow-sm border border-gray-100'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              
              {message.actions && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleActionClick(action.action)}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              
              <p className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">L'assistant réfléchit...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Actions rapides */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Actions rapides</h3>
          <div className="flex space-x-2 overflow-x-auto">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                className="flex-shrink-0 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs hover:bg-gray-200 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Zone de saisie */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={`Demandez quelque chose en mode ${assistantModes.find(m => m.id === selectedMode)?.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
            />
          </div>
          
          <button
            onClick={toggleVoiceRecording}
            className={`p-3 rounded-2xl transition-all ${
              isListening 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileAssistant;
