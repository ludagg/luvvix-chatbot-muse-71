
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Send, Sparkles, Zap, Calendar, Users, FileText } from 'lucide-react';
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

interface BrainInsight {
  type: string;
  description: string;
  confidence: number;
  icon: React.ReactNode;
}

const UnifiedAIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<BrainInsight[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      initializeAssistant();
      loadUserInsights();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeAssistant = async () => {
    if (!user) return;

    // Message d'accueil personnalisé basé sur les connaissances
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `Bonjour ! Je suis votre assistant IA central LuvviX Brain 🧠. Je vous connais et j'apprends de toutes vos interactions dans l'écosystème LuvviX. 

Je peux :
• 📅 Gérer votre calendrier intelligemment
• 📊 Analyser vos habitudes et patterns
• 🤖 Automatiser vos tâches répétitives
• 💡 Vous faire des recommandations ultra-personnalisées
• ⚡ Agir directement sur toutes les apps LuvviX

Que puis-je faire pour vous aujourd'hui ?`,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);
  };

  const loadUserInsights = async () => {
    if (!user) return;

    try {
      const userInsights = await luvvixBrain.getUserInsights(user.id);
      
      const brainInsights: BrainInsight[] = [
        {
          type: 'productivity',
          description: 'Votre moment le plus productif est en soirée',
          confidence: 0.85,
          icon: <Zap className="w-4 h-4" />
        },
        {
          type: 'social',
          description: 'Vous interagissez plus avec les stories le week-end',
          confidence: 0.78,
          icon: <Users className="w-4 h-4" />
        },
        {
          type: 'calendar',
          description: 'Vous créez souvent des rappels de dernière minute',
          confidence: 0.72,
          icon: <Calendar className="w-4 h-4" />
        }
      ];

      setInsights(brainInsights);
    } catch (error) {
      console.error('Erreur chargement insights:', error);
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
      // Traquer l'interaction
      await luvvixBrain.trackInteraction(
        user.id,
        'ai_conversation',
        'UnifiedAssistant',
        { message: input }
      );

      // Obtenir la réponse du cerveau
      const response = await luvvixBrain.processConversation(
        user.id,
        input,
        { component: 'UnifiedAIAssistant' }
      );

      // Si la réponse n'existe pas, afficher un message d'erreur
      if (!response) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Désolé, je rencontre un problème technique. (Aucune réponse générée...)',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      // Ajout toast si action (pour les renvois objets possédant actionDone)
      if (typeof response === 'object' && response !== null && 'actionDone' in response) {
        toast.success("Action IA réalisée !");
      }

      let assistantContent = '';
      if (typeof response === 'string') {
        assistantContent = response;
      } else if (typeof response === 'object' && response !== null && 'message' in response && typeof (response as any).message === 'string') {
        assistantContent = (response as any).message;
      } else {
        // Cas inattendu
        assistantContent = "Je n'ai pas pu comprendre la réponse du cerveau IA.";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      await loadUserInsights();

    } catch (error) {
      console.error('Erreur conversation:', error);
      toast.error('Erreur lors de la communication avec l\'assistant');

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, je rencontre un problème technique. Mes circuits neuronaux se reconnectent...',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { label: "Analyser mes habitudes", action: "Peux-tu analyser mes patterns d'utilisation ?" },
    { label: "Créer un événement", action: "Crée-moi un événement pour demain à 14h" },
    { label: "Recommandations", action: "Quelles sont tes recommandations pour moi ?" },
    { label: "Automatiser", action: "Que peux-tu automatiser pour moi ?" }
  ];

  return (
    <div className="space-y-4">
      {/* Insights du Cerveau */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Insights de votre Cerveau IA
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border"
              >
                <div className="flex items-start gap-2">
                  <div className="text-purple-500 mt-0.5">
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {insight.description}
                    </p>
                    <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${insight.confidence * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Confiance: {Math.round(insight.confidence * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Principal */}
      <Card className="h-96">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            LuvviX Brain Assistant
            <div className="ml-auto flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Apprentissage actif
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-48 pr-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 text-gray-900 dark:text-gray-100 border'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-lg px-3 py-2 text-sm border">
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-500 animate-pulse" />
                      <span>Cerveau en analyse...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {quickActions.slice(0, 2).map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20"
                  onClick={() => setInput(action.action)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Parlez à votre cerveau IA..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="text-sm"
              />
              <Button 
                onClick={sendMessage} 
                disabled={loading || !input.trim()}
                size="sm"
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedAIAssistant;
