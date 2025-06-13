
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Plus, Zap, Brain, Globe, Cloud, Users, FileText, Settings, Sparkles, Calendar, BarChart3, Translate, Home, Bot } from 'lucide-react';
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
      content: 'Bonjour ! Je suis votre assistant IA LuvviX. Je peux vous aider avec tout dans l\'écosystème : créer des documents, gérer vos fichiers cloud, traduire du contenu, consulter la météo, gérer votre calendrier, créer des formulaires, et bien plus encore. Comment puis-je vous aider aujourd\'hui ?',
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
      id: 'calendar',
      name: 'Calendrier',
      icon: <Calendar className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-600',
      description: 'Gestion des événements'
    },
    {
      id: 'forms',
      name: 'Formulaires',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-orange-500 to-red-600',
      description: 'Création et gestion'
    },
    {
      id: 'translation',
      name: 'Traduction',
      icon: <Translate className="w-5 h-5" />,
      color: 'from-rose-500 to-pink-600',
      description: 'Traduction multilingue'
    },
    {
      id: 'cloud',
      name: 'Gestion Cloud',
      icon: <Cloud className="w-5 h-5" />,
      color: 'from-teal-500 to-cyan-600',
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
      id: 'analytics',
      name: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-violet-500 to-purple-600',
      description: 'Analyse de données'
    }
  ];

  const quickActions = [
    { text: 'Créer un événement', mode: 'calendar', icon: <Calendar className="w-4 h-4" /> },
    { text: 'Nouveau formulaire', mode: 'forms', icon: <FileText className="w-4 h-4" /> },
    { text: 'Traduire ce texte', mode: 'translation', icon: <Translate className="w-4 h-4" /> },
    { text: 'Consulter la météo', mode: 'general', icon: <Cloud className="w-4 h-4" /> },
    { text: 'Organiser mes fichiers', mode: 'cloud', icon: <Cloud className="w-4 h-4" /> },
    { text: 'Créer une publication', mode: 'social', icon: <Users className="w-4 h-4" /> },
    { text: 'Analyser des données', mode: 'analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { text: 'Programmer un rappel', mode: 'calendar', icon: <Calendar className="w-4 h-4" /> }
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
    const currentInput = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      // Appel à l'IA Gemini avec contexte du mode sélectionné
      const response = await fetch('https://qlhovvqcwjdbirmekdoy.supabase.co/functions/v1/gemini-chat-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaG92dnFjd2pkYmlybWVrZG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwOTEyOTUsImV4cCI6MjA1OTY2NzI5NX0.jqR7F_bdl-11Hl6SP0tkdrg4V2o76V66fL6xj8zghUI`
        },
        body: JSON.stringify({
          message: currentInput,
          context: getContextForMode(selectedMode),
          temperature: 0.7
        })
      });

      const data = await response.json();
      
      if (data.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.response,
          timestamp: new Date(),
          actions: getActionButtons(currentInput, selectedMode)
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Erreur IA:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Désolé, je rencontre une difficulté technique. Pouvez-vous réessayer ?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getContextForMode = (mode: string) => {
    const contexts = {
      general: 'Tu es un assistant IA général pour LuvviX OS. Tu peux aider avec toutes les fonctionnalités de l\'écosystème.',
      productivity: 'Tu es spécialisé dans l\'optimisation de la productivité avec LuvviX. Tu peux créer des workflows automatisés.',
      calendar: 'Tu es un assistant calendrier intelligent. Tu peux créer, modifier et gérer des événements dans LuvviX Calendar.',
      forms: 'Tu es spécialisé dans la création et gestion de formulaires avec LuvviX Forms. Tu peux optimiser les questions et analyser les réponses.',
      translation: 'Tu es un assistant de traduction avec LuvviX Translate. Tu peux traduire, détecter les langues et améliorer les traductions.',
      cloud: 'Tu es spécialisé dans la gestion de fichiers avec LuvviX Cloud. Tu peux organiser, partager et synchroniser des fichiers.',
      social: 'Tu es un assistant pour LuvviX Center, le réseau social. Tu peux créer des publications, gérer des groupes et connecter des utilisateurs.',
      analytics: 'Tu es spécialisé dans l\'analyse de données avec LuvviX Analytics. Tu peux interpréter des données et créer des rapports.'
    };
    return contexts[mode as keyof typeof contexts] || contexts.general;
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
      calendar: [
        { label: 'Ouvrir Calendar', action: 'navigate_calendar' },
        { label: 'Créer Événement', action: 'create_event' }
      ],
      forms: [
        { label: 'Ouvrir Forms', action: 'navigate_forms' },
        { label: 'Nouveau Formulaire', action: 'create_form' }
      ],
      translation: [
        { label: 'Ouvrir Translate', action: 'navigate_translate' },
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
      analytics: [
        { label: 'Ouvrir Analytics', action: 'navigate_analytics' },
        { label: 'Nouveau Rapport', action: 'create_report' }
      ]
    };
    return actions[mode as keyof typeof actions] || actions.general;
  };

  const handleActionClick = (action: string) => {
    const navigationActions = {
      navigate_services: () => window.dispatchEvent(new CustomEvent('navigate-to-services')),
      navigate_calendar: () => window.dispatchEvent(new CustomEvent('navigate-to-calendar')),
      navigate_forms: () => window.dispatchEvent(new CustomEvent('navigate-to-forms')),
      navigate_translate: () => window.dispatchEvent(new CustomEvent('navigate-to-translate')),
      navigate_cloud: () => window.dispatchEvent(new CustomEvent('navigate-to-cloud')),
      navigate_center: () => window.dispatchEvent(new CustomEvent('navigate-to-center')),
      navigate_analytics: () => window.dispatchEvent(new CustomEvent('navigate-to-analytics'))
    };

    if (navigationActions[action as keyof typeof navigationActions]) {
      navigationActions[action as keyof typeof navigationActions]();
    } else {
      toast({
        title: "Action exécutée",
        description: `Action: ${action}`,
      });
    }
  };

  const handleQuickAction = (action: any) => {
    setSelectedMode(action.mode);
    setInputText(action.text);
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

  const getModeInfo = () => {
    return assistantModes.find(mode => mode.id === selectedMode);
  };

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 pb-20">
      {/* Header avec design moderne */}
      <div className="bg-white border-b border-gray-200 p-4 pt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Assistant IA</h1>
              <p className="text-sm text-gray-600">Propulsé par Gemini 1.5 Flash</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">En ligne</span>
            </div>
          </div>
        </div>

        {/* Mode sélectionné */}
        <div className="mb-4">
          <div className={`bg-gradient-to-r ${getModeInfo()?.color} p-4 rounded-2xl text-white`}>
            <div className="flex items-center space-x-3">
              {getModeInfo()?.icon}
              <div>
                <h3 className="font-semibold">{getModeInfo()?.name}</h3>
                <p className="text-sm opacity-90">{getModeInfo()?.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sélecteur de mode */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {assistantModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 ${
                selectedMode === mode.id
                  ? `bg-gradient-to-r ${mode.color} text-white shadow-lg scale-105`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {mode.icon}
              <span>{mode.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zone de messages avec design amélioré */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-3xl p-4 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-900 shadow-sm border border-gray-100'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600">LuvviX IA</span>
                </div>
              )}
              
              <p className="text-sm leading-relaxed">{message.content}</p>
              
              {message.actions && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {message.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleActionClick(action.action)}
                      className="px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-100"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
              
              <p className="text-xs opacity-70 mt-3">
                {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 max-w-[85%]">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-600">LuvviX IA</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">L'assistant réfléchit...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Actions rapides avec design amélioré */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-yellow-500" />
            Actions rapides
          </h3>
          <div className="flex space-x-2 overflow-x-auto">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                className="flex-shrink-0 flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-2xl text-xs hover:from-gray-100 hover:to-gray-200 transition-all border border-gray-200"
              >
                {action.icon}
                <span>{action.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Zone de saisie améliorée */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={`Demandez quelque chose en mode ${getModeInfo()?.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full px-4 py-4 bg-gray-50 border-0 rounded-3xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-sm shadow-inner"
            />
          </div>
          
          <button
            onClick={toggleVoiceRecording}
            className={`p-4 rounded-3xl transition-all shadow-lg ${
              isListening 
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-3xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileAssistant;
