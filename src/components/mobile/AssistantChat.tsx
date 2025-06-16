
import React, { useState, useEffect, useRef } from 'react';
import { Brain, Send, Sparkles, Calendar, Users, Zap, BookOpen, TrendingUp, Mic, Plus, MoreVertical } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { luvvixBrain } from '@/services/luvvix-brain';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: any[];
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
• Vous donner des insights personnalisés
• Gérer vos contacts et relations
• Créer du contenu optimisé
• Organiser votre calendrier
• Créer des cours personnalisés

Dites-moi simplement ce que vous voulez et je le ferai !`,
      timestamp: new Date(),
      actions: [
        { type: 'analyze_data', label: '📊 Analyser mes données', icon: TrendingUp },
        { type: 'create_event', label: '📅 Créer un événement', icon: Calendar },
        { type: 'create_post', label: '✏️ Publier un post', icon: Plus },
        { type: 'optimize_calendar', label: '⚡ Optimiser mon temps', icon: Zap }
      ]
    };

    setMessages([welcomeMessage]);
  };

  const loadInsights = async () => {
    if (!user) return;

    try {
      const userInsights = await luvvixBrain.getUserInsights(user.id);
      setInsights(userInsights);
      
      console.log('Insights chargés automatiquement:', userInsights);
    } catch (error) {
      console.error('Erreur insights:', error);
    }
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

    try {
      // Traquer l'interaction avec le cerveau
      await luvvixBrain.trackInteraction(
        user.id,
        'mobile_ai_chat',
        'MobileAssistant',
        { message: content }
      );

      // Obtenir la réponse du cerveau
      const response = await luvvixBrain.processConversation(
        user.id,
        content,
        { 
          component: 'MobileAssistant',
          device: 'mobile',
          timestamp: new Date()
        }
      );

      // Détecter les actions possibles
      const actions = await detectActions(content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        actions: actions
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

  const detectActions = async (content: string): Promise<any[]> => {
    const actions = [];
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('créer') && lowerContent.includes('événement')) {
      actions.push({
        type: 'create_event',
        label: 'Créer l\'événement maintenant',
        icon: '📅',
        data: { title: 'Événement demandé', description: content }
      });
    }

    if (lowerContent.includes('analyser') || lowerContent.includes('données')) {
      actions.push({
        type: 'analyze_data',
        label: 'Lancer l\'analyse complète',
        icon: '📊',
        data: { analysisType: 'complete' }
      });
    }

    if (lowerContent.includes('publier') || lowerContent.includes('post')) {
      actions.push({
        type: 'create_post',
        label: 'Publier maintenant',
        icon: '✏️',
        data: { content: content }
      });
    }

    if (lowerContent.includes('cours') && lowerContent.includes('créer')) {
      actions.push({
        type: 'create_course',
        label: 'Créer le cours',
        icon: '📚',
        data: { title: 'Nouveau cours IA', description: content }
      });
    }

    if (lowerContent.includes('contact') || lowerContent.includes('ami')) {
      actions.push({
        type: 'manage_contacts',
        label: 'Gérer les contacts',
        icon: '👥',
        data: { operation: 'analyze_relationships' }
      });
    }

    return actions;
  };

  const executeAction = async (action: any) => {
    if (!user) return;

    try {
      setLoading(true);
      
      const result = await luvvixBrain.executeAutomaticAction(user.id, {
        type: action.type,
        data: action.data,
        context: 'mobile_user_request'
      });

      const actionMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ ${action.label} - Action exécutée avec succès ! 

${action.type === 'create_event' ? '📅 Événement créé dans votre calendrier' : ''}
${action.type === 'create_post' ? '✏️ Post publié sur votre profil' : ''}
${action.type === 'analyze_data' ? '📊 Analyse complète terminée - consultez vos insights' : ''}
${action.type === 'create_course' ? '📚 Cours créé et disponible' : ''}
${action.type === 'manage_contacts' ? '👥 Analyse des relations terminée' : ''}

Résultat détaillé disponible dans l'interface correspondante.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, actionMessage]);

      toast.success(`${action.icon} ${action.label} réalisé !`);

    } catch (error) {
      console.error('Erreur exécution action:', error);
      toast.error("Impossible d'exécuter l'action");
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ Erreur lors de l'exécution de "${action.label}". Réessayons dans quelques instants.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickSuggestions = [
    'Analyse mes habitudes et donne-moi des conseils',
    'Crée un événement pour demain à 14h',
    'Publie un post inspirant sur mon profil',
    'Optimise mon calendrier pour la semaine',
    'Crée un cours sur l\'IA pour débutants',
    'Analyse mes relations sociales'
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header avec insights */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Cerveau IA</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Actif et analysant</span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Insights en temps réel */}
        {insights.length > 0 && (
          <div className="grid grid-cols-1 gap-2">
            {insights.slice(0, 2).map((insight, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {insight.type === 'productivity' ? '⚡ Productivité' : 
                       insight.type === 'social' ? '👥 Social' : '💡 Insight'}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {insight.data?.suggestion || insight.data?.message}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
              
              {/* Actions mobiles */}
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  <div className="text-xs text-gray-500 font-medium">Actions rapides :</div>
                  <div className="grid grid-cols-2 gap-2">
                    {message.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => executeAction(action)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium py-2 px-3 rounded-lg transition-colors text-left"
                      >
                        <div className="flex items-center space-x-1">
                          <span>{action.icon}</span>
                          <span className="truncate">{action.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-sm text-gray-600">Cerveau en action...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions rapides */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="text-xs text-gray-500 mb-2">Suggestions rapides :</div>
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => sendMessage(suggestion)}
                className="flex-shrink-0 bg-white border border-gray-200 text-xs text-gray-700 px-3 py-2 rounded-full whitespace-nowrap hover:bg-gray-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zone de saisie */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0">
            <Plus className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0">
            <Mic className="w-5 h-5 text-gray-500" />
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
            placeholder="Demandez-moi n'importe quoi..."
            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            disabled={loading}
          />
          
          <button 
            onClick={() => sendMessage()} 
            disabled={!input.trim() || loading}
            className="p-2 bg-blue-600 text-white rounded-full flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantChat;
