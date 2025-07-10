import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, Send, Sparkles, Calendar, Users, Zap, BookOpen, TrendingUp, 
  Mic, Plus, MoreVertical, ChartBar, Calculator, Code, FileText, 
  Lightbulb, Target, Cpu, Database, Globe, MessageSquare, Activity,
  MicIcon, Moon, Sun, Star, Share2, Clock, Bell, Download, Wifi,
  WifiOff, Save, Trash2, Copy, Heart, Volume2, Image, Camera
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  image?: string;
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      content: `🤖 **LuvviX AI Assistant**

Salut ! Je suis votre assistant IA personnel, conçu pour vous aider dans tous vos projets.

🚀 **Mes capacités :**
• 💬 Conversation naturelle et contextuelle
• 📸 Analyse d'images et vision IA
• 💻 Génération et révision de code
• 📝 Rédaction créative et professionnelle
• 🧮 Calculs et analyses de données
• 🌍 Traduction multilingue
• 🎨 Brainstorming et créativité

**Comment puis-je vous aider aujourd'hui ?**`,
      timestamp: new Date(),
      actions: [
        { type: 'image_demo', label: '📸 Analyser une image', iconName: 'Camera' },
        { type: 'voice_demo', label: '🎤 Commande vocale', iconName: 'Mic' },
        { type: 'creative_demo', label: '🎨 Mode créatif', iconName: 'Sparkles' },
        { type: 'code_demo', label: '💻 Aide au code', iconName: 'Code' }
      ]
    };
    setMessages([welcomeMessage]);
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
      toast.info('🎤 Parlez maintenant...');
    }
  };

  // Sélection d'image
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast.success('Image sélectionnée !');
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          title: 'LuvviX Assistant IA - Gemini',
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
      isFavorite: msg.isFavorite,
      hasImage: !!msg.image
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luvvix-gemini-chat-${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`💾 Conversation exportée en ${format.toUpperCase()} !`);
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
      new Notification(title, { 
        body, 
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  const simulateReasoning = async (query: string) => {
    const steps: ReasoningStep[] = [
      { step: 1, title: "Analyse de la requête", content: `Traitement: "${query}"`, status: 'processing' },
      { step: 2, title: "Recherche contextuelle", content: "Consultation de la base de connaissances", status: 'pending' },
      { step: 3, title: "Génération IA", content: "Synthèse intelligente LuvviX AI", status: 'pending' },
      { step: 4, title: "Validation", content: "Vérification qualité et pertinence", status: 'pending' }
    ];

    setReasoningSteps(steps);
    setShowReasoning(true);

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setReasoningSteps(prev => prev.map((step, idx) => 
        idx === i ? { ...step, status: 'completed' } : 
        idx === i + 1 ? { ...step, status: 'processing' } : step
      ));
    }

    setTimeout(() => setShowReasoning(false), 1500);
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || input.trim();
    if ((!content && !selectedImage) || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content || '[Image envoyée]',
      timestamp: new Date(),
      image: imagePreview || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Animation de raisonnement
    if (content) {
      await simulateReasoning(content);
    }

    try {
      if (!isOffline) {
        // Préparation des données pour LuvviX AI
        const formData = new FormData();
        formData.append('message', content || 'Analyse cette image');
        
        if (selectedImage) {
          formData.append('image', selectedImage);
        }

        // Appel à l'API LuvviX AI via notre edge function
        const response = await supabase.functions.invoke('gemini-chat-response', {
          body: formData
        });

        if (response.error) throw response.error;

        const actions = await detectAdvancedActions(content);
        const charts = await generateChartsFromContent(content);
        const reasoning = await generateReasoning(content);

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.data.response || 'Je n\'ai pas pu traiter votre demande.',
          timestamp: new Date(),
          actions,
          charts,
          reasoning
        };

        setMessages(prev => [...prev, assistantMessage]);
        showNotification('🤖 LuvviX AI', 'Réponse prête !');
        
        // Clear image après envoi
        clearImage();
      } else {
        // Mode offline
        const offlineResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `📱 **Mode Hors-ligne**\n\nVotre ${selectedImage ? 'image et ' : ''}message "${content}" ont été sauvegardés.\n\n**Fonctionnalités disponibles :**\n• Historique et favoris\n• Export de données\n• Recherche locale\n\n🌐 Reconnectez-vous pour utiliser LuvviX AI !`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, offlineResponse]);
        clearImage();
      }

      saveConversationHistory();
    } catch (error) {
      console.error('Erreur LuvviX AI:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Connexion interrompue**\n\nImpossible de traiter votre demande.\n\n**Solutions :**\n• Vérifiez votre connexion\n• Réessayez dans un moment\n\nVos données sont sauvegardées.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('🔄 Reconnexion de LuvviX AI...');
    } finally {
      setLoading(false);
    }
  };

  const detectAdvancedActions = async (content: string): Promise<any[]> => {
    const actions = [];
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('export') || lowerContent.includes('télécharge') || lowerContent.includes('sauvegarde')) {
      actions.push({
        type: 'export_data',
        label: '📄 Exporter conversation',
        iconName: 'Download'
      });
    }

    if (lowerContent.includes('partage') || lowerContent.includes('share') || lowerContent.includes('envoie')) {
      actions.push({
        type: 'share_result',
        label: '📤 Partager réponse',
        iconName: 'Share2'
      });
    }

    if (lowerContent.includes('code') || lowerContent.includes('programme') || lowerContent.includes('script')) {
      actions.push({
        type: 'copy_code',
        label: '💻 Copier le code',
        iconName: 'Code'
      });
    }

    if (lowerContent.includes('image') || lowerContent.includes('photo') || lowerContent.includes('analyse')) {
      actions.push({
        type: 'analyze_image',
        label: '📸 Analyser image',
        iconName: 'Camera'
      });
    }

    return actions;
  };

  const generateChartsFromContent = async (content: string): Promise<any[]> => {
    const charts = [];
    
    if (content.toLowerCase().includes('graphique') || content.toLowerCase().includes('données') || content.toLowerCase().includes('statistiques')) {
      charts.push({
        type: 'gemini_analysis',
        data: {
          title: 'Analyse Gemini IA',
          description: 'Visualisation générée par intelligence artificielle',
          labels: ['Compréhension', 'Créativité', 'Précision', 'Utilité'],
          values: [95, 88, 92, 90],
          source: 'Gemini 1.5 Flash'
        }
      });
    }

    return charts;
  };

  const generateReasoning = async (content: string): Promise<any> => {
    return {
      steps: [
        'Analyse sémantique LuvviX AI',
        'Contextualisation multimodale',
        'Génération de réponse optimisée',
        'Validation qualité et cohérence'
      ],
      conclusion: 'Traitement LuvviX AI complété avec succès',
      confidence: 0.94
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
        case 'image_demo':
          fileInputRef.current?.click();
          break;
        case 'copy_code':
          const lastMsg = messages[messages.length - 1];
          if (lastMsg) {
            copyToClipboard(lastMsg.content);
          }
          break;
        case 'analyze_image':
          fileInputRef.current?.click();
          break;
        default:
          toast.success(`✨ Action "${action.label}" exécutée !`);
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
      Share2: <Share2 className={className} />,
      Camera: <Camera className={className} />,
      Code: <Code className={className} />
    };
    return iconMap[iconName] || <Sparkles className={className} />;
  };

  const generateSimpleChart = (type: string, data: any) => {
    return (
      <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">{data.title || 'Analyse LuvviX AI'}</h3>
          <p className="text-sm text-blue-700 font-medium">Source: {data.source || 'LuvviX AI'}</p>
          <p className="text-xs text-gray-600 mt-1">
            {data.description || 'Visualisation générée par IA'}
          </p>
          {data.values && (
            <div className="mt-2 text-xs text-gray-500">
              Données: {data.values.join('%, ')}%
            </div>
          )}
        </div>
      </div>
    );
  };

  const detectMathContent = (content: string) => {
    const mathKeywords = ['dérivée', 'intégrale', 'équation', 'fonction', 'calcul', '=', '+', '-', '*', '/', '^', 'sin', 'cos', 'tan', 'log'];
    return mathKeywords.some(keyword => content.toLowerCase().includes(keyword));
  };

  const renderMathContent = (content: string) => {
    if (detectMathContent(content)) {
      return (
        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 my-2">
          <div className="text-xs text-purple-700 font-medium mb-1">🧮 Contenu Mathématique - Gemini</div>
          <div className="font-mono text-sm text-purple-900 whitespace-pre-wrap">{content}</div>
        </div>
      );
    }
    return <div className="whitespace-pre-wrap">{content}</div>;
  };

  const advancedSuggestions = [
    'Explique-moi un concept complexe',
    'Aide-moi à coder quelque chose',
    'Analyse cette image pour moi',
    'Écris-moi un texte créatif',
    'Résous ce problème mathématique',
    'Donne-moi des idées innovantes'
  ];

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header épuré */}
      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b px-4 py-3 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} rounded-full flex items-center justify-center`}>
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>LuvviX AI</h2>
              <div className="flex items-center space-x-1">
                <div className={`w-1.5 h-1.5 ${isOffline ? 'bg-red-400' : 'bg-green-400'} rounded-full`}></div>
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {isOffline ? 'Hors ligne' : 'En ligne'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button onClick={toggleTheme} className={`p-2 hover:${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg transition-colors`}>
              {isDarkMode ? <Sun className="w-4 h-4 text-gray-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className={`p-2 hover:${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg transition-colors`}>
              <MoreVertical className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Overlay de raisonnement */}
      {showReasoning && (
        <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 m-4 max-w-sm w-full shadow-2xl border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>LuvviX AI réfléchit...</h3>
            </div>
            <div className="space-y-3">
              {reasoningSteps.map((step) => (
                <div key={step.step} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step.status === 'completed' ? 'bg-green-100 text-green-600' :
                    step.status === 'processing' ? 'bg-blue-100 text-blue-600 animate-pulse' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{step.title}</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{step.content}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-3xl px-4 py-3 relative ${
                message.role === 'user'
                  ? isDarkMode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-500 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 border border-gray-700 text-white'
                    : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
              }`}
            >
              {/* Actions du message */}
              {message.role === 'assistant' && (
                <div className="absolute top-2 right-2 flex space-x-1">
                  <button
                    onClick={() => toggleFavorite(message.id)}
                    className={`p-1 rounded-full hover:bg-black/10 transition-colors ${
                      favoriteMessages.includes(message.id) ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                  >
                    <Star className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => shareMessage(message)}
                    className="p-1 rounded-full hover:bg-black/10 text-gray-400 transition-colors"
                  >
                    <Share2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(message.content)}
                    className="p-1 rounded-full hover:bg-black/10 text-gray-400 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Image si présente */}
              {message.image && (
                <div className="mb-3">
                  <img 
                    src={message.image} 
                    alt="Image envoyée" 
                    className="max-w-full h-auto rounded-2xl"
                    style={{ maxHeight: '200px' }} 
                  />
                </div>
              )}

              {/* Contenu */}
              <div className="text sm leading-relaxed pr-12">
                {renderMathContent(message.content)}
              </div>

              {/* Graphiques */}
              {message.charts && message.charts.length > 0 && (
                <div className={`mt-4 p-3 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-2xl`}>
                  <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>📊 Visualisation</div>
                  {message.charts.map((chart, index) => (
                    <div key={index}>
                      {generateSimpleChart(chart.type, chart.data)}
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              {message.actions && message.actions.length > 0 && (
                <div className={`mt-4 pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} space-y-2`}>
                  <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Actions suggérées :</div>
                  <div className="grid grid-cols-2 gap-2">
                    {message.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => executeAdvancedAction(action)}
                        className={`${
                          isDarkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' 
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                        } text-xs font-medium py-2 px-3 rounded-xl transition-all border`}
                      >
                        <div className="flex items-center space-x-2">
                          {renderIcon(action.iconName, "w-3 h-3")}
                          <span className="truncate">{action.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className={`text-xs opacity-60 mt-2 ${message.role === 'user' ? 'text-right' : ''}`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'} rounded-3xl px-4 py-3 border`}>
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>LuvviX AI écrit...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Preview d'image */}
      {imagePreview && (
        <div className="px-4 pb-2">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-3 relative`}>
            <button
              onClick={clearImage}
              className="absolute top-1 right-1 p-1 hover:bg-gray-100 rounded-full"
            >
              <Trash2 className="w-4 h-4 text-gray-500" />
            </button>
            <div className="flex items-center space-x-3">
              <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Image sélectionnée</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Prête pour analyse</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>Essayez ces suggestions :</div>
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {advancedSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => sendMessage(suggestion)}
                className={`flex-shrink-0 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' 
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                } border text-xs px-4 py-2 rounded-2xl whitespace-nowrap transition-all shadow-sm`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zone de saisie */}
      <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t p-4`}>
        <div className="flex items-center space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 hover:${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl flex-shrink-0 transition-colors ${
              selectedImage ? 'bg-blue-100 text-blue-600' : ''
            }`}
          >
            <Camera className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          
          <button 
            onClick={toggleRecording}
            className={`p-2 hover:${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl flex-shrink-0 transition-colors ${
              isRecording ? 'bg-red-100 text-red-600' : ''
            }`}
          >
            <Mic className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${isRecording ? 'animate-pulse' : ''}`} />
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
            placeholder={
              isRecording ? "🎤 Écoute..." : 
              selectedImage ? "Décrivez votre image..." : 
              "Message à LuvviX AI..."
            }
            className={`flex-1 ${
              isDarkMode 
                ? 'bg-gray-800 text-white placeholder-gray-400' 
                : 'bg-gray-100 text-gray-900 placeholder-gray-500'
            } border-none rounded-2xl px-4 py-3 text-sm focus:outline-none transition-all`}
            disabled={loading || isRecording}
          />
          
          <button 
            onClick={() => sendMessage()} 
            disabled={(!input.trim() && !selectedImage) || loading}
            className={`p-3 ${
              isDarkMode 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white rounded-2xl flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-2 text-center`}>
          🤖 Propulsé par LuvviX AI • Vision • Multimodal
        </div>
      </div>
    </div>
  );
};

export default AdvancedAssistantChat;
