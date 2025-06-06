
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Send, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Clock,
  MessageCircle,
  Sparkles,
  BookOpen,
  User,
  Bot
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import enhancedAIService from "@/services/enhanced-ai-service";
import luvvixLearnService from "@/services/luvvix-learn-service";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: string;
}

interface Recommendation {
  id: string;
  recommendation_type: string;
  recommendation_data: any;
  priority: number;
  created_at: string;
}

const EnhancedAIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadUserData();
      initializeConversation();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUserData = async () => {
    try {
      const [recommendationsData, analyticsData] = await Promise.all([
        enhancedAIService.getUserRecommendations(user.id),
        enhancedAIService.getUserLearningAnalytics(user.id)
      ]);

      setRecommendations(recommendationsData);
      setAnalytics(analyticsData);

      // Générer des recommandations si aucune n'existe
      if (recommendationsData.length === 0) {
        await enhancedAIService.generatePersonalizedRecommendations(user.id);
        const newRecommendations = await enhancedAIService.getUserRecommendations(user.id);
        setRecommendations(newRecommendations);
      }
    } catch (error) {
      console.error('Erreur chargement données utilisateur:', error);
    }
  };

  const initializeConversation = async () => {
    try {
      const conversations = await enhancedAIService.getUserConversations(user.id);
      
      if (conversations.length > 0) {
        const latestConversation = conversations[0];
        setActiveConversationId(latestConversation.id);
        setMessages(latestConversation.conversation_data.map((msg: any, index: number) => ({
          ...msg,
          id: `msg_${index}`
        })));
      } else {
        // Créer une nouvelle conversation
        const newConversation = await enhancedAIService.createAIConversation(user.id);
        setActiveConversationId(newConversation.id);
        
        // Message de bienvenue
        const welcomeMessage: Message = {
          id: 'welcome',
          role: 'assistant',
          content: `Bonjour ! Je suis votre assistant IA personnalisé de LuvviX Learn. 🤖✨

Je peux vous aider à :
📚 Choisir les meilleurs cours pour votre profil
🎯 Optimiser votre progression d'apprentissage  
💡 Répondre à vos questions sur les sujets étudiés
📊 Analyser vos performances et suggérer des améliorations

Comment puis-je vous aider aujourd'hui ?`,
          timestamp: new Date().toISOString(),
          type: 'welcome'
        };

        setMessages([welcomeMessage]);
        await enhancedAIService.addMessageToConversation(newConversation.id, welcomeMessage);
      }
    } catch (error) {
      console.error('Erreur initialisation conversation:', error);
      toast.error('Erreur lors de l\'initialisation de l\'assistant');
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !activeConversationId || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: currentMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Ajouter le message à la conversation
      await enhancedAIService.addMessageToConversation(activeConversationId, userMessage);

      // Appeler l'IA
      const response = await luvvixLearnService.chatWithAI(user.id, currentMessage, 'learning_assistant');
      
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response.response || 'Désolé, je n\'ai pas pu traiter votre demande.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
      await enhancedAIService.addMessageToConversation(activeConversationId, assistantMessage);

    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast.error('Erreur lors de l\'envoi du message');
      
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Désolé, je rencontre des difficultés techniques. Veuillez réessayer dans quelques instants.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendationClick = async (recommendation: Recommendation) => {
    await enhancedAIService.markRecommendationAsRead(recommendation.id);
    setRecommendations(prev => prev.filter(r => r.id !== recommendation.id));
    
    const action = recommendation.recommendation_data.action;
    if (action === 'focus_course') {
      toast.success('Conseil noté ! Concentrez-vous sur un cours à la fois.');
    } else if (action === 'explore_advanced') {
      toast.success('Explorez nos cours avancés dans le catalogue !');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'motivation':
        return <Target className="h-4 w-4" />;
      case 'course_suggestion':
        return <BookOpen className="h-4 w-4" />;
      case 'learning_support':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      {analytics && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Sessions totales</p>
                  <p className="text-2xl font-bold text-blue-700">{analytics.totalSessions}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Temps d'étude</p>
                  <p className="text-2xl font-bold text-green-700">{Math.floor(analytics.totalTimeSpent / 60)}min</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Taux de réussite</p>
                  <p className="text-2xl font-bold text-purple-700">{analytics.completionRate.toFixed(0)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Session moyenne</p>
                  <p className="text-2xl font-bold text-orange-700">{Math.floor(analytics.averageSessionTime / 60)}min</p>
                </div>
                <Target className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Lightbulb className="h-5 w-5" />
                Recommandations personnalisées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence>
                  {recommendations.map((recommendation, index) => (
                    <motion.div
                      key={recommendation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-200 transition-colors cursor-pointer"
                      onClick={() => handleRecommendationClick(recommendation)}
                    >
                      <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                        {getRecommendationIcon(recommendation.recommendation_type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {recommendation.recommendation_data.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Priorité {recommendation.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(recommendation.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Assistant IA LuvviX Learn
              <Badge className="bg-white/20 text-white">En ligne</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96 p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex items-start gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`p-2 rounded-full ${message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        {message.role === 'user' ? (
                          <User className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Bot className="h-4 w-4 text-gray-600" />
                        )}
                      </div>
                      <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                        <div className={`p-3 rounded-lg ${
                          message.role === 'user' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="p-2 rounded-full bg-gray-100">
                      <Bot className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question à l'assistant IA..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage}
                  disabled={isLoading || !currentMessage.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default EnhancedAIAssistant;
