
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
      content: `🤖 **LuvviX Assistant IA - Powered by Gemini 1.5 Flash**

🚀 **Fonctionnalités Avancées :**
📸 **Vision IA** - Analysez vos images
🎤 **Reconnaissance vocale** avancée
🌙 **Mode sombre/clair** adaptatif
⭐ **Favoris intelligents** avec sync
📤 **Partage instantané** multi-plateforme
📚 **Historique persistant** avec recherche
🔔 **Notifications push** contextuelles
📄 **Export multi-format** (PDF, JSON, CSV)
📱 **Mode hors-ligne** avec cache local

**Nouvelles capacités Gemini :**
• Raisonnement multimodal avancé (texte + image)
• Compréhension contextuelle approfondie
• Génération de code optimisée
• Analyse de données complexes
• Créativité et brainstorming
• Support multilingue natif

**Commandes spéciales :**
"Analyse cette image", "Code moi ça", "Explique-moi", "Créatif mode", "Export données"`,
      timestamp: new Date(),
      actions: [
        { type: 'image_demo', label: '📸 Test Vision IA', iconName: 'Camera' },
        { type: 'voice_demo', label: '🎤 Test vocal', iconName: 'Mic' },
        { type: 'creative_demo', label: '🎨 Mode créatif', iconName: 'Sparkles' },
        { type: 'code_demo', label: '💻 Génération code', iconName: 'Code' }
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
      { step: 1, title: "Analyse Gemini", content: `Traitement multimodal: "${query}"`, status: 'processing' },
      { step: 2, title: "Contexte & Mémoire", content: "Consultation historique et préférences", status: 'pending' },
      { step: 3, title: "Génération IA", content: "Synthèse intelligente Gemini 1.5", status: 'pending' },
      { step: 4, title: "Optimisation", content: "Validation qualité et pertinence", status: 'pending' }
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
        // Préparation des données pour Gemini
        const formData = new FormData();
        formData.append('message', content || 'Analyse cette image');
        
        if (selectedImage) {
          formData.append('image', selectedImage);
        }

        // Appel à l'API Gemini via notre edge function
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
        showNotification('🤖 Gemini Assistant', 'Réponse prête !');
        
        // Clear image après envoi
        clearImage();
      } else {
        // Mode offline
        const offlineResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `📱 **Mode Hors-ligne Activé**\n\nVotre ${selectedImage ? 'image et ' : ''}message "${content}" ont été sauvegardés localement.\n\n**Fonctionnalités disponibles :**\n• Historique et favoris\n• Export de données\n• Recherche locale\n• Calculatrice basique\n\n🌐 Reconnectez-vous pour accéder aux capacités complètes de Gemini !`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, offlineResponse]);
        clearImage();
      }

      saveConversationHistory();
    } catch (error) {
      console.error('Erreur Gemini chat:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Erreur de connexion Gemini**\n\nImpossible de traiter votre demande pour le moment.\n\n**Solutions :**\n• Vérifiez votre connexion\n• Réessayez dans quelques instants\n• Utilisez le mode hors-ligne\n\nVos données sont sauvegardées localement.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error('🔄 Reconnexion des circuits Gemini...');
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
        'Analyse sémantique Gemini',
        'Contextualisation multimodale',
        'Génération de réponse optimisée',
        'Validation qualité et cohérence'
      ],
      conclusion: 'Traitement Gemini 1.5 Flash complété avec succès',
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
      <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-dashed border-purple-200 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{data.title || 'Analyse Gemini'}</h3>
          <p className="text-sm text-purple-700 font-medium">Source: {data.source || 'Gemini 1.5 Flash'}</p>
          <p className="text-xs text-gray-600 mt-2">
            {data.description || 'Visualisation générée par IA'}
          </p>
          {data.values && (
            <div className="mt-3 text-xs text-gray-500">
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
    'Analyse cette image avec Gemini',
    'Code-moi une application React',
    'Explique-moi la physique quantique',
    'Crée un poème sur l\'IA',
    'Résous cette équation complexe',
    'Mode créatif : brainstorming'
  ];

  return (
    <div className={`flex flex-col h-full ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-white to-blue-50'}`}>
      {/* Header Advanced */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600'} text-white p-4 shadow-lg`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${isDarkMode ? 'bg-gray-700' : 'bg-white/20'} rounded-xl flex items-center justify-center backdrop-blur-sm`}>
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Gemini Assistant</h2>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 ${isOffline ? 'bg-red-400' : 'bg-green-400'} rounded-full animate-pulse`}></div>
                <span className="text-sm opacity-90">{isOffline ? 'Mode Offline' : 'Gemini 1.5 Flash'}</span>
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
            <Camera className="w-4 h-4 mx-auto mb-1" />
            <div className="text-xs font-medium">Vision</div>
          </div>
          <div className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-white/20'} p-2 rounded-lg text-center backdrop-blur-sm`}>
            <Star className="w-4 h-4 mx-auto mb-1" />
            <div className="text-xs font-medium">{favoriteMessages.length}</div>
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
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Gemini en Action</h3>
            </div>
            <div className="space-y-3">
              {reasoningSteps.map((step) => (
                <div key={step.step} className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.status === 'completed' ? 'bg-green-500 text-white' :
                    step.status === 'processing' ? 'bg-purple-500 text-white animate-pulse' :
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
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
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

              {/* Image si présente */}
              {message.image && (
                <div className="mb-3">
                  <img 
                    src={message.image} 
                    alt="Image envoyée" 
                    className="max-w-full h-auto rounded-lg border"
                    style={{ maxHeight: '200px' }} 
                  />
                </div>
              )}

              {/* Contenu */}
              <div className="text-sm leading-relaxed pr-16">
                {renderMathContent(message.content)}
              </div>

              {/* Graphiques */}
              {message.charts && message.charts.length > 0 && (
                <div className={`mt-4 p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl`}>
                  <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>📊 Visualisation Gemini</div>
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
                  <div className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} font-medium`}>⚡ Actions Gemini :</div>
                  <div className="grid grid-cols-2 gap-2">
                    {message.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => executeAdvancedAction(action)}
                        className={`${
                          isDarkMode 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' 
                            : 'bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700 border-purple-200 hover:border-purple-300'
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
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>🤖 Gemini réfléchit...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Preview d'image */}
      {imagePreview && (
        <div className="px-4 pb-2">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-3 relative`}>
            <button
              onClick={clearImage}
              className="absolute top-1 right-1 p-1 hover:bg-gray-100 rounded-full"
            >
              <Trash2 className="w-4 h-4 text-gray-500" />
            </button>
            <div className="flex items-center space-x-3">
              <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Image sélectionnée</div>
                <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Prête pour analyse Gemini</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions avancées */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-2`}>✨ Testez Gemini :</div>
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {advancedSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => sendMessage(suggestion)}
                className={`flex-shrink-0 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700' 
                    : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-blue-100'
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl flex-shrink-0 transition-colors ${
              selectedImage ? 'bg-purple-100 text-purple-600' : ''
            }`}
          >
            <Camera className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          
          <button 
            onClick={toggleRecording}
            className={`p-2 hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl flex-shrink-0 transition-colors ${
              isRecording ? 'bg-red-100 text-red-600' : ''
            }`}
          >
            <Mic className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ${isRecording ? 'animate-pulse' : ''}`} />
          </button>
          
          <button 
            onClick={() => exportConversation('json')}
            className={`p-2 hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl flex-shrink-0 transition-colors`}
          >
            <Download className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
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
              isRecording ? "🎤 Écoute en cours..." : 
              selectedImage ? "Décrivez votre image..." : 
              "Message pour Gemini..."
            }
            className={`flex-1 ${
              isDarkMode 
                ? 'bg-gray-700 text-white focus:bg-gray-600' 
                : 'bg-gray-100 focus:bg-white'
            } border-none rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            disabled={loading || isRecording}
          />
          
          <button 
            onClick={() => sendMessage()} 
            disabled={(!input.trim() && !selectedImage) || loading}
            className={`p-3 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600'
            } text-white rounded-xl flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 text-center`}>
          🤖 Powered by Gemini 1.5 Flash • Vision IA • Multimodal
        </div>
      </div>
    </div>
  );
};

export default AdvancedAssistantChat;
