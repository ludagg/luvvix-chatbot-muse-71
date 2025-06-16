
import React, { useState, useEffect, useRef } from 'react';
import { Send, Brain, Sparkles, Zap, Calendar, Users, BookOpen, Mail, TrendingUp, Settings, Mic, Image, Paperclip, MoreHorizontal, Trash2, Archive, Edit3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { luvvixBrain } from '@/services/luvvix-brain';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: any[];
  insights?: any[];
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastMessage: Date;
}

const ModernAIChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      initializeBrain();
      loadConversations();
      loadInsights();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const initializeBrain = async () => {
    if (!user) return;
    
    try {
      // Analyser les patterns utilisateur au démarrage
      await luvvixBrain.analyzeUserPatterns(user.id);
      
      // Charger les suggestions intelligentes
      const smartSuggestions = await luvvixBrain.getUserInsights(user.id);
      setSuggestions(smartSuggestions);
      
      console.log('🧠 Cerveau LuvviX initialisé');
    } catch (error) {
      console.error('Erreur initialisation cerveau:', error);
    }
  };

  const loadInsights = async () => {
    if (!user) return;
    
    try {
      const userInsights = await luvvixBrain.getUserInsights(user.id);
      setInsights(userInsights);
      
      console.log('Insights chargés automatiquement:', userInsights);
    } catch (error) {
      console.error('Erreur chargement insights:', error);
    }
  };

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_assistant_conversations')
        .select(`
          *,
          ai_assistant_messages (*)
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedConversations: Conversation[] = (data || []).map(conv => ({
        id: conv.id,
        title: conv.title,
        lastMessage: new Date(conv.updated_at),
        messages: (conv.ai_assistant_messages || []).map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.created_at)
        }))
      }));

      setConversations(formattedConversations);
      
      if (formattedConversations.length > 0 && !currentConversation) {
        setCurrentConversation(formattedConversations[0]);
      }
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
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

    // Ajouter le message à la conversation courante
    if (currentConversation) {
      setCurrentConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, userMessage]
      } : null);
    } else {
      // Créer une nouvelle conversation
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: content.slice(0, 50) + '...',
        messages: [userMessage],
        lastMessage: new Date()
      };
      setCurrentConversation(newConversation);
      setConversations(prev => [newConversation, ...prev]);
    }

    setInput('');
    setIsThinking(true);

    try {
      // Traquer l'interaction avec le cerveau
      await luvvixBrain.trackInteraction(
        user.id,
        'ai_chat',
        'ModernAIChat',
        { message: content, timestamp: new Date() }
      );

      // Obtenir la réponse du cerveau
      const response = await luvvixBrain.processConversation(
        user.id,
        content,
        { 
          conversation: currentConversation,
          component: 'ModernAIChat',
          capabilities: ['create_events', 'create_posts', 'manage_contacts', 'analyze_data', 'course_creation']
        }
      );

      // Obtenir des actions automatiques si applicables
      const actions = await detectPossibleActions(content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        actions: actions,
        insights: await luvvixBrain.getUserInsights(user.id)
      };

      setCurrentConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, assistantMessage]
      } : null);

      // Sauvegarder en base
      await saveConversation();
      
      // Recharger les insights
      await loadInsights();

    } catch (error) {
      console.error('Erreur chat brain:', error);
      toast({
        title: "Erreur cerveau IA",
        description: "Reconnexion des circuits neuronaux...",
        variant: "destructive"
      });
    } finally {
      setIsThinking(false);
    }
  };

  const detectPossibleActions = async (content: string): Promise<any[]> => {
    const actions = [];
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('créer') && (lowerContent.includes('événement') || lowerContent.includes('rdv'))) {
      actions.push({
        type: 'create_event',
        label: 'Créer l\'événement',
        icon: Calendar,
        data: { title: 'Événement demandé', description: content }
      });
    }

    if (lowerContent.includes('publier') || lowerContent.includes('poster')) {
      actions.push({
        type: 'create_post',
        label: 'Publier le post',
        icon: Edit3,
        data: { content: content }
      });
    }

    if (lowerContent.includes('cours') && lowerContent.includes('créer')) {
      actions.push({
        type: 'create_course',
        label: 'Créer le cours',
        icon: BookOpen,
        data: { title: 'Nouveau cours', description: content }
      });
    }

    if (lowerContent.includes('analyser') || lowerContent.includes('statistiques')) {
      actions.push({
        type: 'analyze_data',
        label: 'Analyser les données',
        icon: TrendingUp,
        data: { analysisType: 'general' }
      });
    }

    return actions;
  };

  const executeAction = async (action: any) => {
    if (!user) return;

    try {
      setIsThinking(true);
      
      const result = await luvvixBrain.executeAutomaticAction(user.id, {
        type: action.type,
        data: action.data,
        context: 'user_request'
      });

      const actionMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `✅ Action exécutée avec succès ! ${action.label} a été réalisé. Voici les détails : ${JSON.stringify(result)}`,
        timestamp: new Date()
      };

      setCurrentConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, actionMessage]
      } : null);

      toast({
        title: "🧠 Action exécutée",
        description: `${action.label} réalisé avec succès !`
      });

    } catch (error) {
      console.error('Erreur exécution action:', error);
      toast({
        title: "Erreur action",
        description: "Impossible d'exécuter l'action demandée",
        variant: "destructive"
      });
    } finally {
      setIsThinking(false);
    }
  };

  const saveConversation = async () => {
    if (!currentConversation || !user) return;

    try {
      // Sauvegarder ou mettre à jour la conversation
      const { data: convData, error: convError } = await supabase
        .from('ai_assistant_conversations')
        .upsert({
          id: currentConversation.id,
          user_id: user.id,
          title: currentConversation.title,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (convError) throw convError;

      // Sauvegarder les nouveaux messages
      for (const message of currentConversation.messages) {
        await supabase
          .from('ai_assistant_messages')
          .upsert({
            id: message.id,
            conversation_id: convData.id,
            role: message.role,
            content: message.content,
            created_at: message.timestamp.toISOString()
          });
      }
    } catch (error) {
      console.error('Erreur sauvegarde conversation:', error);
    }
  };

  const quickActions = [
    { label: 'Analyser mes données', icon: TrendingUp, action: () => sendMessage('Analyse mes données et donne moi des insights détaillés') },
    { label: 'Créer un événement', icon: Calendar, action: () => sendMessage('Crée moi un événement pour demain à 14h') },
    { label: 'Publier un post', icon: Edit3, action: () => sendMessage('Publie un post inspirant sur mon profil') },
    { label: 'Gérer mes contacts', icon: Users, action: () => sendMessage('Analyse mes relations et suggère des améliorations') },
    { label: 'Créer un cours', icon: BookOpen, action: () => sendMessage('Crée moi un cours sur l\'intelligence artificielle') },
    { label: 'Optimiser mon temps', icon: Zap, action: () => sendMessage('Optimise mon calendrier et mes habitudes') }
  ];

  const createNewConversation = () => {
    setCurrentConversation(null);
    setInput('');
  };

  const deleteConversation = (convId: string) => {
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (currentConversation?.id === convId) {
      setCurrentConversation(null);
    }
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Sidebar des conversations */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">Cerveau LuvviX</span>
            </div>
            <Button onClick={createNewConversation} size="sm">
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>

          {/* Insights en temps réel */}
          {insights.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Insights IA</h4>
              <div className="space-y-2">
                {insights.slice(0, 2).map((insight, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-gray-700">{insight.data?.suggestion || insight.data?.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Liste des conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setCurrentConversation(conv)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                currentConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{conv.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {conv.messages.length} messages • {conv.lastMessage.toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Assistant IA Omnipotent</h2>
              <p className="text-sm text-gray-500">
                Capable de créer, gérer et optimiser tout votre écosystème LuvviX
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                🧠 Actif
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Gemini 1.5 Flash
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentConversation ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Bonjour ! Je suis votre cerveau IA</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Je peux créer des événements, publier des posts, gérer vos contacts, analyser vos données, créer des cours et bien plus encore. Que souhaitez-vous que je fasse ?
              </p>
              
              {/* Actions rapides */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={action.action}
                    className="flex items-center space-x-2 p-4 h-auto"
                  >
                    <action.icon className="w-5 h-5" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {currentConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    
                    {/* Actions disponibles */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                        <div className="text-xs text-gray-500 font-medium">Actions disponibles :</div>
                        {message.actions.map((action, index) => (
                          <Button
                            key={index}
                            size="sm"
                            onClick={() => executeAction(action)}
                            className="mr-2"
                          >
                            <action.icon className="w-4 h-4 mr-1" />
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                    
                    {/* Insights */}
                    {message.insights && message.insights.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500 font-medium mb-2">Insights générés :</div>
                        {message.insights.slice(0, 2).map((insight, index) => (
                          <div key={index} className="text-xs bg-blue-50 p-2 rounded mb-1">
                            {insight.data?.suggestion || insight.data?.message}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-900">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className="text-sm">Cerveau en action...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Zone de saisie */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Image className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
              className={isRecording ? 'text-red-500' : ''}
            >
              <Mic className="w-5 h-5" />
            </Button>
            
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Demandez-moi de créer, gérer ou analyser n'importe quoi..."
              className="flex-1"
              disabled={isThinking}
            />
            
            <Button 
              onClick={() => sendMessage()} 
              disabled={!input.trim() || isThinking}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Suggestions intelligentes */}
          {suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.slice(0, 3).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(suggestion.data?.suggestion || 'Analyse mes données')}
                  className="text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {suggestion.data?.suggestion?.slice(0, 30) + '...' || 'Suggestion IA'}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernAIChat;
