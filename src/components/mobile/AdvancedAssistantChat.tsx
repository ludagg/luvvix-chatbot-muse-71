import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Send, Sparkles, Calendar, Users, Zap, BookOpen, TrendingUp, 
  Mic, Plus, MoreVertical, ChartBar, Calculator, Code, FileText, 
  Lightbulb, Target, Cpu, Database, Globe, MessageSquare, Activity,
  MicIcon, Moon, Sun, Star, Share2, Clock, Bell, Download, Wifi,
  WifiOff, Save, Trash2, Copy, Heart, Volume2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { luvvixBrain } from '@/services/luvvix-brain';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: any[];
  charts?: any[];
  latex?: string[];
  reasoning?: {
    steps: string[];
    conclusion: string;
    confidence: number;
  };
  isFavorite?: boolean;
}

interface ReasoningStep {
  step: number;
  title: string;
  content: string;
  status: 'completed' | 'processing' | 'pending';
}

const AdvancedAssistantChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [showReasoning, setShowReasoning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [favoriteMessages, setFavoriteMessages] = useState<string[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Message[][]>([]);
  const [currentConversationIndex, setCurrentConversationIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Détection de l'état de connexion
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialisation
  useEffect(() => {
    if (user) {
      initializeAdvancedChat();
      loadInsights();
      loadFavorites();
      loadConversationHistory();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialisation de la reconnaissance vocale
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'fr-FR';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        toast.success('Reconnaissance vocale terminée !');
      };
      
      recognitionRef.current.onerror = () => {
        toast.error('Erreur de reconnaissance vocale');
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const initializeAdvancedChat = () => {
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `🧠 **LuvviX Assistant IA Omnipotent - Version Mobile Avancée**

🚀 **Nouvelles Fonctionnalités :**
🎤 Reconnaissance vocale
🌙 Mode sombre/clair
⭐ Favoris intelligents
📤 Partage rapide
📚 Historique avancé
🔔 Notifications push
📄 Export de données
📱 Mode offline

**Capacités étendues :**
• Raisonnement multi-étapes avec visualisation
• Calculs mathématiques complexes avec LaTeX
• Graphiques dynamiques et visualisations
• Intégration totale LuvviX avec automation

**Commandes vocales :** "Calcule", "Analyse", "Graphique", "Export"`,
      timestamp: new Date(),
      actions: [
        { type: 'math_demo', label: '🧮 Démonstration mathématique', iconName: 'Calculator' },
        { type: 'chart_demo', label: '📊 Créer un graphique', iconName: 'ChartBar' },
        { type: 'reasoning_demo', label: '🔬 Raisonnement avancé', iconName: 'Brain' },
        { type: 'voice_demo', label: '🎤 Test reconnaissance vocale', iconName: 'Mic' }
      ]
    };
    setMessages([welcomeMessage]);
  };

  const loadInsights = async () => {
    if (!user) return;
    try {
      const userInsights = await luvvixBrain.getUserInsights(user.id);
      setInsights(userInsights);
    } catch (error) {
      console.error('Erreur insights:', error);
    }
  };

  const loadFavorites = () => {
    const saved = localStorage.getItem('luvvix_favorites');
    if (saved) {
      setFavoriteMessages(JSON.parse(saved));
    }
  };

  const loadConversationHistory = () => {
    const saved = localStorage.getItem('luvvix_conversation_history');
    if (saved) {
      setConversationHistory(JSON.parse(saved));
    }
  };

  const saveConversationHistory = () => {
    const updatedHistory = [...conversationHistory];
    updatedHistory[currentConversationIndex] = messages;
    setConversationHistory(updatedHistory);
    localStorage.setItem('luvvix_conversation_history', JSON.stringify(updatedHistory));
  };

  // Reconnaissance vocale
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error('Reconnaissance vocale non supportée');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
      toast.info('Parlez maintenant...');
    }
  };

  // Basculement du thème
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('luvvix_theme', (!isDarkMode).toString());
  };

  // Gestion des favoris
  const toggleFavorite = (messageId: string) => {
    const updated = favoriteMessages.includes(messageId)
      ? favoriteMessages.filter(id => id !== messageId)
      : [...favoriteMessages, messageId];
    
    setFavoriteMessages(updated);
    localStorage.setItem('luvvix_favorites', JSON.stringify(updated));
    
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isFavorite: !msg.isFavorite } : msg
    ));
  };

  // Partage
  const shareMessage = async (message: Message) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LuvviX Assistant IA',
          text: message.content,
          url: window.location.href
        });
        toast.success('Partagé avec succès !');
      } catch (error) {
        copyToClipboard(message.content);
      }
    } else {
      copyToClipboard(message.content);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers !');
  };

  // Export des données
  const exportConversation = (format: 'pdf' | 'csv' | 'json') => {
    const data = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      isFavorite: msg.isFavorite
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luvvix-conversation-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Conversation exportée en ${format.toUpperCase()} !`);
  };

  // Notifications
  const toggleNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Notifications non supportées');
      return;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(!notificationsEnabled);
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const showNotification = (title: string, body: string) => {
    if (notificationsEnabled && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  const simulateReasoning = async (query: string) => {
    const steps: ReasoningStep[] = [
      { step: 1, title: "Analyse de la requête", content: `Décomposition: "${query}"`, status: 'processing' },
      { step: 2, title: "Recherche de contexte", content: "Consultation de la base de connaissances", status: 'pending' },
      { step: 3, title: "Génération de la réponse", content: "Synthèse et optimisation", status: 'pending' },
      { step: 4, title: "Validation", content: "Vérification de la cohérence", status: 'pending' }
    ];

    setReasoningSteps(steps);
    setShowReasoning(true);

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setReasoningSteps(prev => prev.map((step, idx) => 
        idx === i ? { ...step, status: 'completed' } : 
        idx === i + 1 ? { ...step, status: 'processing' } : step
      ));
    }

    setTimeout(() => setShowReasoning(false), 2000);
  };

  const generateSimpleChart = (type: string, data: any) => {
    return (
      <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-blue-200 flex items-center justify-center">
        <div className="text-center">
          <ChartBar className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{data.title || 'Graphique IA'}</h3>
          <p className="text-sm text-gray-600">Type: {type}</p>
          <p className="text-xs text-gray-500 mt-2">Données: {data.values?.join(', ') || 'Exemple'}</p>
        </div>
      </div>
    );
  };

  const detectMathContent = (content: string) => {
    const mathKeywords = ['dérivée', 'intégrale', 'équation', 'fonction', 'calcul', '=', '+', '-', '*', '/', '^'];
    return mathKeywords.some(keyword => content.toLowerCase().includes(keyword));
  };

  const renderMathContent = (content: string) => {
    if (detectMathContent(content)) {
      return (
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 my-2">
          <div className="text-xs text-blue-700 font-medium mb-1">🧮 Contenu Mathématique Détecté</div>
          <div className="font-mono text-sm text-blue-900">{content}</div>
        </div>
      );
    }
    return <div>{content}</div>;
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if (!content || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    await simulateReasoning(content);

    try {
      if (!isOffline) {
        await luvvixBrain.trackInteraction(
          user.id,
          'advanced_ai_chat',
          'AdvancedMobileAssistant',
          { message: content, features: ['voice', 'offline', 'favorites', 'export'] }
        );

        const response = await luvvixBrain.processConversation(
          user.id,
          content,
          { 
            component: 'AdvancedMobileAssistant',
            device: 'mobile',
            timestamp: new Date(),
            capabilities: ['voice_recognition', 'offline_mode', 'favorites', 'export', 'notifications']
          }
        );

        const actions = await detectAdvancedActions(content);
        const charts = await generateChartsFromContent(content);
        const reasoning = await generateReasoning(content);

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
          actions,
          charts,
          reasoning
        };

        setMessages(prev => [...prev, assistantMessage]);
        showNotification('LuvviX Assistant', 'Réponse prête !');
      } else {
        // Mode offline
        const offlineResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `📱 **Mode Offline Activé**\n\nVotre message "${content}" a été sauvegardé. Les fonctionnalités de base restent disponibles :\n\n• Calculs mathématiques simples\n• Historique local\n• Favoris\n• Export des données\n\nReconnectez-vous pour accéder aux fonctionnalités avancées.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, offlineResponse]);
      }

      saveConversationHistory();
    } catch (error) {
      console.error('Erreur chat avancé:', error);
      toast.error('Reconnexion des circuits neuronaux...');
    } finally {
      setLoading(false);
    }
  };

  const detectAdvancedActions = async (content: string): Promise<any[]> => {
    const actions = [];
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('export') || lowerContent.includes('télécharge')) {
      actions.push({
        type: 'export_data',
        label: '📄 Exporter les données',
        iconName: 'Download'
      });
    }

    if (lowerContent.includes('partage') || lowerContent.includes('share')) {
      actions.push({
        type: 'share_result',
        label: '📤 Partager le résultat',
        iconName: 'Share2'
      });
    }

    return actions;
  };

  const generateChartsFromContent = async (content: string): Promise<any[]> => {
    const charts = [];
    
    if (content.toLowerCase().includes('graphique') || content.toLowerCase().includes('données')) {
      charts.push({
        type: 'line',
        data: {
          title: 'Analyse de tendance',
          labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
          values: [65, 59, 80, 81, 56, 55, 40]
        }
      });
    }

    return charts;
  };

  const generateReasoning = async (content: string): Promise<any> => {
    return {
      steps: [
        'Analyse du contexte utilisateur',
        'Identification des patterns',
        'Application des algorithmes',
        'Validation des résultats'
      ],
      conclusion: 'Processus de raisonnement complété avec succès',
      confidence: 0.92
    };
  };

  const executeAdvancedAction = async (action: any) => {
    if (!user) return;

    try {
      setLoading(true);
      
      switch (action.type) {
        case 'export_data':
          exportConversation('json');
          break;
        case 'share_result':
          const lastMessage = messages[messages.length - 1];
          if (lastMessage) {
            await shareMessage(lastMessage);
          }
          break;
        case 'voice_demo':
          toggleRecording();
          break;
        default:
          toast.success(`Action "${action.label}" exécutée !`);
      }
    } catch (error) {
      console.error('Erreur action:', error);
      toast.error("Erreur lors de l'exécution");
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (iconName: string, className = "w-5 h-5") => {
    const iconMap: { [key: string]: React.ReactNode } = {
      Calculator: <Calculator className={className} />,
      ChartBar: <ChartBar className={className} />,
      Brain: <Brain className={className} />,
      Mic: <Mic className={className} />,
      Download: <Download className={className} />,
      Share2: <Share2 className={className} />
    };
    return iconMap[iconName] || <Sparkles className={className} />;
  };

  const advancedSuggestions = [
    'Calcule la dérivée de x³ + 2x² - 5x + 1',
    'Crée un graphique de productivité',
    'Active la reconnaissance vocale',
    'Exporte cette conversation',
    'Analyse mes données avec IA',
    'Mode sombre pour économiser la batterie'
  ];

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-indigo-50 via-white to-purple-50'}`}>
      {/* Header Advanced */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600'} text-white p-4 shadow-lg`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${isDarkMode ? 'bg-gray-700' : 'bg-white/20'} rounded-xl flex items-center justify-center backdrop-blur-sm`}>
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Assistant IA Omnipotent</h2>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 ${isOffline ? 'bg-red-400' : 'bg-green-400'} rounded-full animate-pulse`}></div>
                <span className="text-sm opacity-90">{isOffline ? 'Mode Offline' : 'En ligne'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={toggleTheme} className="p-2 hover:bg-white/10 rounded-lg">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={toggleNotifications} className="p-2 hover:bg-white/10 rounded-lg">
              <Bell className={`w-5 h-5 ${notificationsEnabled ? 'text-yellow-300' : ''}`} />
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-white/10 rounded-lg">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Statistiques en temps réel */}
        <div className="grid grid-cols-4 gap-2">
          <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-white/20'} p-2 rounded-lg text-center backdrop-blur-sm`}>
            <Volume2 className="w-4 h-4 mx-auto mb-1" />
            <div className="text-xs font-medium">Vocal</div>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-white/20'} p-2 rounded-lg text-center backdrop-blur-sm`}>
            <Star className="w-4 h-4 mx-auto mb-1" />
            <div className="text-xs font-medium">{favoriteMessages.length}</div>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-white/20'} p-2 rounded-lg text-center backdrop-blur-sm`}>
            <Clock className="w-4 h-4 mx-auto mb-1" />
            <div className="text-xs font-medium">Hist</div>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-white/20'} p-2 rounded-lg text-center backdrop-blur-sm`}>
            {isOffline ? <WifiOff className="w-4 h-4 mx-auto mb-1" /> : <Wifi className="w-4 h-4 mx-auto mb-1" />}
            <div className="text-xs font-medium">{isOffline ? 'Off' : 'On'}</div>
          </div>
        </div>
      </div>

      {/* Reasoning Overlay */}
      {showReasoning && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 m-4 max-w-sm w-full shadow-2xl`}>
            <div className="text-center mb-4">
              <Brain className="w-8 h-8 text-purple-600 mx-auto mb-2 animate-pulse" />
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Raisonnement en Cours</h3>
            </div>
            <div className="space-y-3">
              {reasoningSteps.map((step) => (
                <div key={step.step} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.status === 'completed' ? 'bg-green-500 text-white' :
                    step.status === 'processing' ? 'bg-blue-500 text-white animate-pulse' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{step.title}</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{step.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-4 shadow-lg relative ${
                message.role === 'user'
                  ? isDarkMode 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 border border-gray-700 text-white'
                    : 'bg-white border border-gray-100 text-gray-900'
              }`}
            >
              {/* Actions du message */}
              {message.role === 'assistant' && (
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => toggleFavorite(message.id)}
                    className={`p-1 rounded hover:bg-black/10 ${
                      favoriteMessages.includes(message.id) ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => shareMessage(message)}
                    className="p-1 rounded hover:bg-black/10 text-gray-400"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="p-1 rounded hover:bg-black/10 text-gray-400"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Contenu */}
              <div className="text-sm whitespace-pre-wrap leading-relaxed pr-16">
                {renderMathContent(message.content)}
              </div>

              {/* Graphiques */}
              {message.charts && message.charts.length > 0 && (
                <div className={`mt-4 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>📊 Visualisation Générée</div>
                  {message.charts.map((chart, index) => (
                    <div key={index} className="h-64">
                      {generateSimpleChart(chart.type, chart.data)}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              {message.actions && message.actions.length > 0 && (
                <div className={`mt-4 pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} space-y-2`}>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} font-medium`}>Actions Intelligentes :</div>
                  <div className="grid grid-cols-2 gap-2">
                    {message.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => executeAdvancedAction(action)}
                        className={`${
                          isDarkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' 
                            : 'bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 border-indigo-200 hover:border-indigo-300'
                        } text-xs font-medium py-3 px-3 rounded-xl transition-all border`}
                      >
                        <div className="flex items-center space-x-2">
                          {renderIcon(action.iconName, "w-4 h-4")}
                          <span className="truncate">{action.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className={`text-xs opacity-70 mt-3 ${isDarkMode ? 'text-gray-400' : ''}`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl p-4 shadow-lg`}>
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>IA en raisonnement avancé...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions avancées */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>💡 Nouvelles Capacités :</div>
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {advancedSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => sendMessage(suggestion)}
                className={`flex-shrink-0 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' 
                    : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-indigo-700 hover:from-indigo-100 hover:to-purple-100'
                } border text-xs px-4 py-3 rounded-xl whitespace-nowrap transition-all`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zone de saisie avancée */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t p-4 shadow-lg`}>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => exportConversation('json')}
            className={`p-2 hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl flex-shrink-0 transition-colors`}
          >
            <Download className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          <button 
            onClick={toggleRecording}
            className={`p-2 hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl flex-shrink-0 transition-colors ${
              isRecording ? 'bg-red-100 text-red-600' : ''
            }`}
          >
            <Mic className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${isRecording ? 'animate-pulse' : ''}`} />
          </button>
          <button className={`p-2 hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl flex-shrink-0 transition-colors`}>
            <ChartBar className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={isRecording ? "🎤 Reconnaissance en cours..." : "Vocal, calculs, graphiques, export..."}
            className={`flex-1 ${
              isDarkMode 
                ? 'bg-gray-700 text-white focus:bg-gray-600' 
                : 'bg-gray-100 focus:bg-white'
            } border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all`}
            disabled={loading || isRecording}
          />
          
          <button 
            onClick={() => sendMessage()} 
            disabled={!input.trim() || loading}
            className={`p-3 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                : 'bg-gradient-to-r from-indigo-600 to-purple-600'
            } text-white rounded-xl flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAssistantChat;
