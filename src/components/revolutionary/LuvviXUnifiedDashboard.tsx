import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Globe, 
  Sparkles, 
  Activity, 
  Target, 
  Rocket,
  Clock,
  BarChart3,
  Network,
  Settings,
  Bot,
  Workflow,
  Eye,
  Lightbulb,
  Gauge
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { neuralNetwork, type PredictionResult } from '@/services/luvvix-neural-network';
import { orchestrator } from '@/services/luvvix-orchestrator';
import { predictService } from '@/services/luvvix-predict';

const LuvviXUnifiedDashboard = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [automations, setAutomations] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      initializeDashboard();
    }
  }, [user]);

  const initializeDashboard = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Load user data and initialize AI systems
      await neuralNetwork.loadUserData(user.id);
      
      // Simulate some interactions to demonstrate the system
      await neuralNetwork.recordInteraction({
        user_id: user.id,
        interaction_type: 'dashboard_visit',
        app_context: 'Revolutionary Dashboard',
        data: { timestamp: new Date().toISOString(), action: 'view_dashboard' },
        patterns: { time_of_day: new Date().getHours(), device: 'web' }
      });

      // Get AI predictions
      const aiPredictions = await neuralNetwork.generatePredictions(user.id);
      setPredictions(aiPredictions);

      // Get user insights
      const userInsights = await neuralNetwork.getUserInsights(user.id);
      setInsights(userInsights);

      // Get orchestrator automations
      const activeAutomations = await orchestrator.getActiveAutomations(user.id);
      setAutomations(activeAutomations);

      // Get trend predictions - Fixed method name
      const futureTrends = await predictService.generateFutureTrends(user.id);
      setTrends(futureTrends);

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="w-16 h-16 text-indigo-600 mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            Initialisation du Neural Network...
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            L'IA analyse vos patterns et prépare vos prédictions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header avec bienvenue personnalisé */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Brain className="w-12 h-12 text-indigo-600" />
            <Sparkles className="w-8 h-8 text-yellow-500" />
            <Zap className="w-10 h-10 text-blue-600" />
          </div>
          
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            LuvviX Neural Dashboard
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Bienvenue {user?.email}, votre IA personnelle vous attend
          </p>
          
          {insights && (
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Gauge className="w-4 h-4" />
                <span>Score Productivité: {insights.productivity_score}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>Précision IA: {Math.round(insights.prediction_accuracy * 100)}%</span>
              </div>
              <div className="flex items-center space-x-1">
                <Activity className="w-4 h-4" />
                <span>Personnalisation: {insights.personalization_level}%</span>
              </div>
            </div>
          )}
        </motion.div>

        <Tabs defaultValue="predictions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px] mx-auto">
            <TabsTrigger value="predictions" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Prédictions IA</span>
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center space-x-2">
              <Workflow className="w-4 h-4" />
              <span>Automatisations</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Tendances</span>
            </TabsTrigger>
          </TabsList>

          {/* Prédictions IA */}
          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnimatePresence>
                {predictions.map((prediction, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="border-l-4 border-l-indigo-500 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-2">
                            {prediction.type === 'app_suggestion' && <Bot className="w-5 h-5 text-blue-600" />}
                            {prediction.type === 'workflow_automation' && <Workflow className="w-5 h-5 text-purple-600" />}
                            {prediction.type === 'productivity_tip' && <Lightbulb className="w-5 h-5 text-yellow-600" />}
                            {prediction.type === 'content_recommendation' && <Eye className="w-5 h-5 text-green-600" />}
                            <span className="capitalize">
                              {prediction.type.replace('_', ' ')}
                            </span>
                          </CardTitle>
                          <Badge 
                            variant={getPriorityColor('medium')}
                            className={`${getConfidenceColor(prediction.confidence)}`}
                          >
                            {Math.round(prediction.confidence * 100)}% sûr
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                          {prediction.reasoning}
                        </p>
                        
                        {prediction.data && (
                          <div className="space-y-2">
                            {prediction.data.app && (
                              <p className="font-medium text-indigo-600 dark:text-indigo-400">
                                📱 App suggérée: {prediction.data.app}
                              </p>
                            )}
                            {prediction.data.tip && (
                              <p className="font-medium text-yellow-600 dark:text-yellow-400">
                                💡 {prediction.data.tip}
                              </p>
                            )}
                            {prediction.data.workflow && (
                              <div>
                                <p className="font-medium text-purple-600 dark:text-purple-400">
                                  🔄 {prediction.data.workflow}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {prediction.data.description}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {predictions.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <Brain className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
                    L'IA apprend encore...
                  </h3>
                  <p className="text-gray-400 dark:text-gray-500">
                    Utilisez quelques applications pour que l'IA commence à faire des prédictions personnalisées
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Automatisations */}
          <TabsContent value="automation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {automations.map((automation, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Workflow className="w-5 h-5 text-green-600" />
                      <span>{automation.name}</span>
                    </CardTitle>
                    <CardDescription>{automation.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Status:</span>
                        <Badge variant={automation.active ? 'default' : 'secondary'}>
                          {automation.active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Exécutions:</span>
                        <span className="font-medium">{automation.executions || 0}</span>
                      </div>
                      <Progress value={automation.efficiency || 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {automations.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <Workflow className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Aucune automatisation configurée
                  </h3>
                  <p className="text-gray-400 dark:text-gray-500 mb-4">
                    L'IA créera automatiquement des workflows basés sur vos habitudes
                  </p>
                  <Button onClick={initializeDashboard}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Actualiser les automatisations
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights" className="space-y-6">
            {insights && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span>Apps Favorites</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.most_used_apps?.slice(0, 5).map((app: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm">{app.app}</span>
                          <Badge variant="secondary">{app.interactions}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span>Heures Productives</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {insights.peak_hours?.map((hour: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm">{hour}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <span>Métriques IA</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Précision</span>
                          <span>{Math.round(insights.prediction_accuracy * 100)}%</span>
                        </div>
                        <Progress value={insights.prediction_accuracy * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Personnalisation</span>
                          <span>{insights.personalization_level}%</span>
                        </div>
                        <Progress value={insights.personalization_level} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Tendances Futures */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {trends.map((trend, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      <span>{trend.category}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {trend.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span>Direction:</span>
                      <Badge variant={trend.trend_direction === 'increasing' ? 'default' : 'secondary'}>
                        {trend.trend_direction}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {trends.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Analyse des tendances en cours...
                  </h3>
                  <p className="text-gray-400 dark:text-gray-500">
                    L'IA collecte des données pour prédire les tendances futures
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LuvviXUnifiedDashboard;
