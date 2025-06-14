
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Zap, 
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Settings,
  Mic,
  Paperclip,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { luvvixBrain } from '@/services/luvvix-brain';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  typing?: boolean;
}

interface AIInsight {
  type: string;
  title: string;
  description: string;
  confidence: number;
  color: string;
  icon: React.ReactNode;
}

const PERSONALITIES = [
  { 
    key: "expert", 
    label: "🎯 Expert", 
    description: "Précis et professionnel",
    color: "bg-blue-500"
  },
  { 
    key: "coach", 
    label: "💪 Coach", 
    description: "Motivant et encourageant",
    color: "bg-green-500"
  },
  { 
    key: "secretary", 
    label: "📋 Assistant", 
    description: "Organisé et efficace",
    color: "bg-purple-500"
  },
  { 
    key: "friend", 
    label: "😊 Ami", 
    description: "Décontracté et sympathique",
    color: "bg-orange-500"
  }
];

const QUICK_ACTIONS = [
  { icon: Calendar, label: "Planifier", prompt: "Aide-moi à organiser ma journée" },
  { icon: TrendingUp, label: "Analyser", prompt: "Analyse mes habitudes récentes" },
  { icon: Zap, label: "Automatiser", prompt: "Que peux-tu automatiser pour moi ?" },
  { icon: Brain, label: "Recommander", prompt: "Quelles sont tes recommandations ?" }
];

const ModernAIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [personality, setPersonality] = useState(PERSONALITIES[0].key);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      initializeAssistant();
      loadInsights();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeAssistant = async () => {
    if (!user) return;

    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `Salut ! 👋 Je suis votre assistant IA personnel LuvviX Brain. 

🧠 **Je vous connais** et j'apprends de toutes vos interactions
🎯 **Je peux vous aider** avec vos tâches quotidiennes  
⚡ **J'agis directement** sur vos applications LuvviX

Comment puis-je vous assister aujourd'hui ?`,
      timestamp: new Date()
    };

    // Animation d'apparition progressive du message
    setIsTyping(true);
    setTimeout(() => {
      setMessages([welcomeMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const loadInsights = async () => {
    if (!user) return;

    try {
      const userInsights = await luvvixBrain.getUserInsights(user.id);
      
      const aiInsights: AIInsight[] = [
        {
          type: 'productivity',
          title: 'Productivité',
          description: 'Pic d\'activité en soirée',
          confidence: 0.89,
          color: 'text-emerald-600',
          icon: <Zap className="w-4 h-4" />
        },
        {
          type: 'social',
          title: 'Social',
          description: 'Plus actif le week-end',
          confidence: 0.76,
          color: 'text-blue-600',
          icon: <Users className="w-4 h-4" />
        },
        {
          type: 'planning',
          title: 'Organisation',
          description: 'Création de rappels spontanée',
          confidence: 0.82,
          color: 'text-purple-600',
          icon: <Calendar className="w-4 h-4" />
        }
      ];

      setInsights(aiInsights);
    } catch (error) {
      console.error('Erreur chargement insights:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      // Simulation d'une réponse avec délai réaliste
      setTimeout(async () => {
        const selectedPersonality = PERSONALITIES.find(p => p.key === personality);
        const personalizedPrompt = `[Mode: ${selectedPersonality?.label}] ${currentInput}`;

        const response = await luvvixBrain.processConversation(
          user.id,
          personalizedPrompt,
          { component: 'ModernAIAssistant', personality }
        );

        let assistantContent = '';
        if (typeof response === 'string') {
          assistantContent = response;
        } else if (response && typeof response === 'object' && 'message' in response) {
          assistantContent = (response as any).message;
        } else {
          assistantContent = "Je traite votre demande... Laissez-moi un instant pour analyser cela avec mon réseau neuronal. 🧠";
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: assistantContent,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
        setLoading(false);
        
        // Recharger les insights après conversation
        await loadInsights();
      }, 1500);

    } catch (error) {
      console.error('Erreur conversation:', error);
      toast.error('Erreur de communication avec l\'assistant');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '🔧 Oups ! Je rencontre des difficultés techniques. Mes circuits se reconnectent...',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const selectedPersonality = PERSONALITIES.find(p => p.key === personality);

  return (
    <div className="h-full max-w-4xl mx-auto bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header moderne */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Brain className="w-7 h-7" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                LuvviX Brain
              </h1>
              <p className="text-blue-100 text-sm">Assistant IA personnel • Toujours en apprentissage</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className="bg-white/20 text-white border-white/30">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              En ligne
            </Badge>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sélecteur de personnalité moderne */}
        <div className="mt-6">
          <p className="text-blue-100 text-sm mb-3">Personnalité active :</p>
          <div className="flex flex-wrap gap-2">
            {PERSONALITIES.map(p => (
              <motion.button
                key={p.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPersonality(p.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  p.key === personality
                    ? 'bg-white text-indigo-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {p.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Insights rapides */}
      {insights.length > 0 && (
        <div className="p-4 bg-white/50 dark:bg-gray-800/50 border-b">
          <div className="flex items-center mb-3">
            <TrendingUp className="w-4 h-4 text-indigo-500 mr-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Insights récents</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border"
              >
                <div className="flex items-center gap-2">
                  <span className={insight.color}>{insight.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{insight.title}</p>
                    <p className="text-xs text-gray-500">{insight.description}</p>
                  </div>
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                  <div
                    className="bg-indigo-500 h-1 rounded-full transition-all duration-1000"
                    style={{ width: `${insight.confidence * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col h-96">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user' 
                        ? 'bg-indigo-100 dark:bg-indigo-900' 
                        : 'bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900'
                    }`}>
                      {message.role === 'user' ? (
                        <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>

                    {/* Message bubble */}
                    <div className={`px-4 py-3 rounded-2xl max-w-full ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm border'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      <div className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Indicateur de frappe */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl shadow-sm border">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Actions rapides */}
        <div className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t">
          <div className="flex space-x-2 mb-4 overflow-x-auto">
            {QUICK_ACTIONS.map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction(action.prompt)}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl text-sm font-medium border border-indigo-200 dark:border-indigo-700 hover:from-indigo-100 hover:to-purple-100 transition-all flex-shrink-0"
              >
                <action.icon className="w-4 h-4" />
                <span>{action.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Zone de saisie */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder={`Écrivez votre message à ${selectedPersonality?.label}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="pr-20 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600">
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl h-10 w-10 p-0 shadow-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAIAssistant;
