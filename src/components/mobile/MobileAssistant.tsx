
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Plus, Zap, Brain, Globe, Cloud, Users, FileText, Settings, Sparkles, Calendar, Map, Calculator, BookOpen, Palette, Code, BarChart3, MessageCircle, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: ActionButton[];
}

interface ActionButton {
  label: string;
  action: string;
  icon?: React.ReactNode;
}

const MobileAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Bonjour ! Je suis votre assistant IA LuvviX, alimenté par Gemini 1.5 Flash. Je peux vous aider avec tout dans l\'écosystème : créer des documents, gérer vos fichiers cloud, traduire du contenu, consulter la météo, organiser votre calendrier, créer des formulaires, et bien plus encore. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
      actions: [
        { label: 'Voir mes services', action: 'navigate_services', icon: <Zap className="w-4 h-4" /> },
        { label: 'Organiser ma journée', action: 'organize_day', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Créer un formulaire', action: 'create_form', icon: <FileText className="w-4 h-4" /> }
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedMode, setSelectedMode] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
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
      description: 'Gestion d\'agenda et événements'
    },
    {
      id: 'forms',
      name: 'Formulaires',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-orange-500 to-red-600',
      description: 'Création et gestion de formulaires'
    },
    {
      id: 'translation',
      name: 'Traduction',
      icon: <Globe className="w-5 h-5" />,
      color: 'from-indigo-500 to-purple-600',
      description: 'Traduction multilingue'
    },
    {
      id: 'weather',
      name: 'Météo',
      icon: <Cloud className="w-5 h-5" />,
      color: 'from-cyan-500 to-blue-600',
      description: 'Prévisions et analyses météo'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-pink-500 to-rose-600',
      description: 'Analyse de données'
    },
    {
      id: 'creative',
      name: 'Créatif',
      icon: <Palette className="w-5 h-5" />,
      color: 'from-violet-500 to-purple-600',
      description: 'Design et créativité'
    }
  ];

  const quickActions = [
    { label: 'Créer un événement', action: 'create_event', icon: <Calendar className="w-4 h-4" /> },
    { label: 'Traduire ce texte', action: 'translate_text', icon: <Globe className="w-4 h-4" /> },
    { label: 'Consulter la météo', action: 'check_weather', icon: <Cloud className="w-4 h-4" /> },
    { label: 'Nouveau formulaire', action: 'create_form', icon: <FileText className="w-4 h-4" /> },
    { label: 'Organiser mes fichiers', action: 'organize_files', icon: <FileText className="w-4 h-4" /> },
    { label: 'Analyser des données', action: 'analyze_data', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Créer une publication', action: 'create_post', icon: <MessageCircle className="w-4 h-4" /> },
    { label: 'Programmer un rappel', action: 'set_reminder', icon: <Calendar className="w-4 h-4" /> }
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
    setIsTyping(true);

    try {
      // Simuler un appel à Gemini 1.5 Flash
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: getAIResponse(inputText, selectedMode),
        timestamp: new Date(),
        actions: getActionButtons(inputText, selectedMode)
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre demande",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const getAIResponse = (input: string, mode: string) => {
    const responses = {
      general: `Je comprends votre demande "${input}". Voici ce que je peux faire pour vous aider avec l'écosystème LuvviX. Grâce à Gemini 1.5 Flash, je peux analyser votre demande et vous proposer des solutions personnalisées.`,
      productivity: `Pour optimiser votre productivité avec "${input}", je peux créer un workflow automatisé, vous suggérer des raccourcis ou intégrer vos outils. Que préférez-vous ?`,
      calendar: `Concernant votre calendrier et "${input}", je peux créer des événements, analyser votre planning, suggérer des créneaux libres ou envoyer des rappels intelligents.`,
      forms: `Pour "${input}", je peux créer un formulaire personnalisé avec l'IA, analyser les réponses existantes ou vous aider à optimiser vos questions.`,
      translation: `Je peux traduire "${input}" dans plus de 100 langues avec une précision contextuelle. Dans quelle langue souhaitez-vous la traduction ?`,
      weather: `Concernant la météo et "${input}", je peux analyser les conditions actuelles, prévoir l'impact sur vos activités ou vous donner des recommandations personnalisées.`,
      analytics: `Pour analyser "${input}", je peux créer des visualisations, extraire des insights ou générer des rapports détaillés avec mes capacités d'analyse de données.`,
      creative: `Pour vos projets créatifs liés à "${input}", je peux générer des idées, créer du contenu, suggérer des palettes de couleurs ou vous aider dans votre processus créatif.`
    };
    return responses[mode as keyof typeof responses] || responses.general;
  };

  const getActionButtons = (input: string, mode: string): ActionButton[] => {
    const actions = {
      general: [
        { label: 'Ouvrir Services', action: 'navigate_services', icon: <Zap className="w-4 h-4" /> },
        { label: 'Voir Profil', action: 'navigate_profile', icon: <Users className="w-4 h-4" /> },
        { label: 'Aide complète', action: 'show_help', icon: <BookOpen className="w-4 h-4" /> }
      ],
      productivity: [
        { label: 'Créer Workflow', action: 'create_workflow', icon: <Settings className="w-4 h-4" /> },
        { label: 'Ouvrir Forms', action: 'navigate_forms', icon: <FileText className="w-4 h-4" /> },
        { label: 'Analytics', action: 'navigate_analytics', icon: <BarChart3 className="w-4 h-4" /> }
      ],
      calendar: [
        { label: 'Ouvrir Calendrier', action: 'navigate_calendar', icon: <Calendar className="w-4 h-4" /> },
        { label: 'Nouvel Événement', action: 'create_event', icon: <Plus className="w-4 h-4" /> },
        { label: 'Analyser Planning', action: 'analyze_schedule', icon: <BarChart3 className="w-4 h-4" /> }
      ],
      forms: [
        { label: 'Créer Formulaire', action: 'navigate_forms', icon: <FileText className="w-4 h-4" /> },
        { label: 'Formulaire IA', action: 'create_ai_form', icon: <Sparkles className="w-4 h-4" /> },
        { label: 'Analyser Réponses', action: 'analyze_responses', icon: <BarChart3 className="w-4 h-4" /> }
      ],
      translation: [
        { label: 'LuvviX Translate', action: 'navigate_translate', icon: <Globe className="w-4 h-4" /> },
        { label: 'Traduire maintenant', action: 'translate_now', icon: <Zap className="w-4 h-4" /> },
        { label: 'Historique', action: 'translation_history', icon: <BookOpen className="w-4 h-4" /> }
      ],
      weather: [
        { label: 'LuvviX Météo', action: 'navigate_weather', icon: <Cloud className="w-4 h-4" /> },
        { label: 'Analyse IA', action: 'weather_ai_analysis', icon: <Sparkles className="w-4 h-4" /> },
        { label: 'Alertes Météo', action: 'weather_alerts', icon: <Bell className="w-4 h-4" /> }
      ],
      analytics: [
        { label: 'Ouvrir Analytics', action: 'navigate_analytics', icon: <BarChart3 className="w-4 h-4" /> },
        { label: 'Créer Rapport', action: 'create_report', icon: <FileText className="w-4 h-4" /> },
        { label: 'Dashboard', action: 'open_dashboard', icon: <Monitor className="w-4 h-4" /> }
      ],
      creative: [
        { label: 'Générer Idées', action: 'generate_ideas', icon: <Sparkles className="w-4 h-4" /> },
        { label: 'Palette Couleurs', action: 'color_palette', icon: <Palette className="w-4 h-4" /> },
        { label: 'Design Assistant', action: 'design_help', icon: <Settings className="w-4 h-4" /> }
      ]
    };
    return actions[mode as keyof typeof actions] || actions.general;
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'navigate_calendar':
        window.dispatchEvent(new CustomEvent('navigate-to-calendar'));
        break;
      case 'navigate_forms':
        window.dispatchEvent(new CustomEvent('navigate-to-forms'));
        break;
      case 'navigate_translate':
        window.dispatchEvent(new CustomEvent('navigate-to-translate'));
        break;
      case 'navigate_weather':
        window.dispatchEvent(new CustomEvent('navigate-to-weather'));
        break;
      case 'create_event':
        window.dispatchEvent(new CustomEvent('navigate-to-calendar'));
        toast({
          title: "Calendrier ouvert",
          description: "Vous pouvez maintenant créer un événement",
        });
        break;
      case 'create_form':
        window.dispatchEvent(new CustomEvent('navigate-to-forms'));
        toast({
          title: "Formulaires ouverts",
          description: "Vous pouvez maintenant créer un formulaire",
        });
        break;
      case 'create_ai_form':
        window.dispatchEvent(new CustomEvent('navigate-to-forms'));
        toast({
          title: "Génération IA",
          description: "Utilisez la génération automatique dans LuvviX Forms",
        });
        break;
      case 'weather_ai_analysis':
        window.dispatchEvent(new CustomEvent('navigate-to-weather'));
        toast({
          title: "Analyse météo IA",
          description: "Consultez l'analyse IA dans LuvviX Météo",
        });
        break;
      default:
        toast({
          title: "Action exécutée",
          description: `Action: ${action}`,
        });
    }
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
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      {/* Header moderne */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Assistant IA</h1>
              <p className="text-sm text-gray-600">Alimenté par Gemini 1.5 Flash</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-700 font-medium">En ligne</span>
            </div>
          </div>
        </div>

        {/* Sélecteur de mode amélioré */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {assistantModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center space-x-2 shadow-sm ${
                selectedMode === mode.id
                  ? `bg-gradient-to-r ${mode.color} text-white shadow-lg transform scale-105`
                  : 'bg-white/70 text-gray-600 hover:bg-white hover:shadow-md'
              }`}
            >
              {mode.icon}
              <span>{mode.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Zone de messages améliorée */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white/90 backdrop-blur-sm text-gray-900 shadow-lg border border-white/20'
              }`}
            >
              {message.type === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-purple-600">LuvviX AI</span>
                </div>
              )}
              
              <p className="text-sm leading-relaxed">{message.content}</p>
              
              {message.actions && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {message.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleActionClick(action.action)}
                      className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-all hover:scale-105 shadow-sm"
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
              
              <p className="text-xs opacity-70 mt-3">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
              <div className="flex items-center space-x-2 mb-2">
                <Bot className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-semibold text-purple-600">LuvviX AI</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-purple-600">L'assistant réfléchit...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Actions rapides améliorées */}
      <div className="bg-white/80 backdrop-blur-lg border-t border-gray-200/50 p-4 shadow-lg">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Zap className="w-4 h-4 mr-2 text-purple-600" />
            Actions rapides
          </h3>
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.label)}
                className="flex-shrink-0 flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg text-xs hover:from-purple-100 hover:to-blue-100 hover:text-purple-700 transition-all shadow-sm"
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Zone de saisie améliorée */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={`Demandez à l'IA en mode ${assistantModes.find(m => m.id === selectedMode)?.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm shadow-sm"
            />
          </div>
          
          <button
            onClick={toggleVoiceRecording}
            className={`p-3 rounded-2xl transition-all shadow-lg ${
              isListening 
                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-red-200' 
                : 'bg-white text-gray-600 hover:bg-gray-50 shadow-gray-200'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-200 hover:shadow-purple-300"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileAssistant;
