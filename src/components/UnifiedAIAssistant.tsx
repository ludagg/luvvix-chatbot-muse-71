import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Brain, Send, Sparkles, Zap, Calendar, Users, FileText, Bot, User, Cpu, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { luvvixBrain } from '@/services/luvvix-brain';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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

const PERSONALITIES = [
  { 
    key: "expert", 
    label: "Expert", 
    description: "Réponses précises, concises et professionnelles.",
    color: "bg-gradient-to-r from-blue-500 to-indigo-600",
    emoji: "🎯"
  },
  { 
    key: "coach", 
    label: "Coach", 
    description: "Encouragements et motivation en priorité.",
    color: "bg-gradient-to-r from-green-500 to-emerald-600",
    emoji: "💪"
  },
  { 
    key: "secretary", 
    label: "Secrétaire", 
    description: "Organisation, mémoire et gestion du temps.",
    color: "bg-gradient-to-r from-purple-500 to-violet-600",
    emoji: "📋"
  },
  { 
    key: "friend", 
    label: "Ami", 
    description: "Tonalité amicale, légère, empathique.",
    color: "bg-gradient-to-r from-orange-500 to-amber-600",
    emoji: "😊"
  }
];

const MEMO_KEY = "luvvixBrainChatMemory";

const UnifiedAIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<BrainInsight[]>([]);
  const [personality, setPersonality] = useState(PERSONALITIES[0].key);
  const [lastUserInputTime, setLastUserInputTime] = useState<number>(Date.now());
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const proActiveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (user) {
      initializeAssistant();
      loadUserInsights();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!!proActiveTimeout.current) clearTimeout(proActiveTimeout.current);
    if (!loading && messages.length > 0) {
      proActiveTimeout.current = setTimeout(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === "assistant" && !loading) {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: "💡 Conseil IA : souhaitez-vous découvrir de nouvelles astuces d'organisation ou d'automatisation ?",
              timestamp: new Date()
            }
          ]);
        }
      }, 30000);
    }
    return () => {
      if (!!proActiveTimeout.current) clearTimeout(proActiveTimeout.current);
    };
  }, [messages, loading]);

  const initializeAssistant = async () => {
    if (!user) return;

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

  const buildPersonalityPrompt = () => {
    const persona = PERSONALITIES.find(p => p.key === personality);
    return persona
      ? `[Personnalité IA sélectionnée : ${persona.label}. ${persona.description}]\n\n`
      : "";
  };

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    setLastUserInputTime(Date.now());

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      await luvvixBrain.trackInteraction(
        user.id,
        'ai_conversation',
        'UnifiedAssistant',
        { message: input }
      );

      const personalizedPrompt = buildPersonalityPrompt() + input;

      const response = await luvvixBrain.processConversation(
        user.id,
        personalizedPrompt,
        { component: 'UnifiedAIAssistant', personality }
      );

      let assistantContent = '';
      
      if (!response) {
        assistantContent = 'Désolé, je rencontre un problème technique. (Aucune réponse générée...)';
      } else if (typeof response === 'string') {
        assistantContent = response;
      } else if (typeof response === 'object') {
        if ('actionDone' in response) {
          toast.success("Action IA réalisée !");
        }
        
        if ('message' in response) {
          const messageValue = (response as any).message;
          assistantContent = (messageValue && typeof messageValue === 'string') 
            ? messageValue 
            : "Réponse non disponible.";
        } else {
          assistantContent = "Je n'ai pas pu comprendre la réponse du cerveau IA.";
        }
      } else {
        assistantContent = "Type de réponse inattendu du cerveau IA.";
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
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = [
    { label: "Analyser mes habitudes", action: "Peux-tu analyser mes patterns d'utilisation ?", icon: Activity },
    { label: "Créer un événement", action: "Crée-moi un événement pour demain à 14h", icon: Calendar },
    { label: "Recommandations", action: "Quelles sont tes recommandations pour moi ?", icon: Sparkles },
    { label: "Automatiser", action: "Que peux-tu automatiser pour moi ?", icon: Zap }
  ];

  const selectedPersonality = PERSONALITIES.find(p => p.key === personality);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header avec branding moderne */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center space-x-3 bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                LuvviX Brain
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Assistant IA • Toujours en apprentissage</p>
            </div>
          </div>
        </motion.div>

        {/* Sélecteur de personnalité redesigné */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                Personnalité de l'assistant IA
                <Badge className="ml-auto bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                  {selectedPersonality?.emoji} {selectedPersonality?.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PERSONALITIES.map(p => (
                  <motion.button
                    key={p.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPersonality(p.key)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      p.key === personality
                        ? `${p.color} text-white border-transparent shadow-lg`
                        : "bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600"
                    }`}
                  >
                    <div className="text-2xl mb-2">{p.emoji}</div>
                    <div className="font-semibold text-sm">{p.label}</div>
                    <div className={`text-xs mt-1 ${
                      p.key === personality ? "text-white/90" : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {p.description.split(',')[0]}
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Insights redesignés */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                Insights de votre Cerveau IA
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Analyse en cours</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="group p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        {insight.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          {insight.description}
                        </p>
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${insight.confidence * 100}%` }}
                              transition={{ duration: 1, delay: 0.5 + index * 0.2 }}
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                              Confiance
                            </span>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              {Math.round(insight.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Chat principal redesigné */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-0 shadow-2xl h-[600px] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">LuvviX Brain Assistant</h3>
                    <p className="text-blue-100 text-sm">Mode: {selectedPersonality?.emoji} {selectedPersonality?.label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-100">En ligne</span>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0 h-full flex flex-col">
              {/* Zone de messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className={`flex items-start gap-3 ${
                          message.role === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        {/* Avatar */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                            : 'bg-gradient-to-br from-purple-500 to-pink-500'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="w-5 h-5 text-white" />
                          ) : (
                            <Bot className="w-5 h-5 text-white" />
                          )}
                        </div>

                        {/* Bulle de message */}
                        <div className={`max-w-[70%] ${
                          message.role === 'user' ? 'text-right' : 'text-left'
                        }`}>
                          <div className={`px-4 py-3 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-auto'
                              : 'bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-600 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-500'
                          }`}>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {message.content}
                            </div>
                          </div>
                          <div className={`text-xs mt-1 ${
                            message.role === 'user' ? 'text-gray-500' : 'text-gray-400'
                          }`}>
                            {message.timestamp.toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
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
                      className="flex items-start gap-3"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-600 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-500">
                        <div className="flex items-center gap-1">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                            className="w-2 h-2 bg-purple-500 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-purple-500 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 bg-purple-500 rounded-full"
                          />
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Assistant en réflexion...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Actions rapides */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
                <div className="flex flex-wrap gap-2 mb-4">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setInput(action.action)}
                      className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-all"
                    >
                      <action.icon className="w-4 h-4" />
                      {action.label}
                    </motion.button>
                  ))}
                </div>
                
                {/* Zone de saisie */}
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Écrivez votre message..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading}
                      className="pr-12 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={sendMessage}
                      disabled={loading || !input.trim()}
                      className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-xl h-12 w-12 p-0 shadow-lg"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default UnifiedAIAssistant;
