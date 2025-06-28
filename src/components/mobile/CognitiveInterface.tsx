import React, { useState, useEffect } from 'react';
import { Brain, Zap, Users, TrendingUp, Activity, Eye, MessageCircle, Lightbulb } from 'lucide-react';
import { cognitiveEngine, type CognitivePrediction, type ProactiveAssistance } from '@/services/luvvix-cognitive-engine';
import { digitalTwin } from '@/services/luvvix-digital-twin';
import { socialIntelligence, type SocialInsight } from '@/services/luvvix-social-intelligence';
import { ecosystemOrchestrator, type SmartSuggestion } from '@/services/luvvix-ecosystem-orchestrator';
import { useAuth } from '@/hooks/useAuth';

interface CognitiveInterfaceProps {
  onBack: () => void;
}

const CognitiveInterface: React.FC<CognitiveInterfaceProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('predictions');
  const [predictions, setPredictions] = useState<CognitivePrediction[]>([]);
  const [proactiveAssistance, setProactiveAssistance] = useState<ProactiveAssistance[]>([]);
  const [socialInsights, setSocialInsights] = useState<SocialInsight[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [digitalTwinInsights, setDigitalTwinInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCognitiveData();
    }
  }, [user]);

  const loadCognitiveData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);

      // Create cognitive context
      const context = {
        user_id: user.id,
        current_app: 'LuvviX Cognitive',
        time_of_day: new Date().toLocaleTimeString(),
        device_info: { type: 'mobile', os: 'web' },
        recent_actions: [],
        environmental_factors: {
          calendar_events: [],
          notification_count: 5
        }
      };

      // Load predictions and assistance
      const cogPredictions = await cognitiveEngine.processContext(context);
      const assistance = await cognitiveEngine.generateProactiveAssistance(user.id, cogPredictions);
      
      setPredictions(cogPredictions);
      setProactiveAssistance(assistance);

      // Load digital twin insights
      const twinInsights = await digitalTwin.generatePersonalizedInsights(user.id);
      setDigitalTwinInsights(twinInsights);

      // Load social intelligence
      const profile = await digitalTwin.getProfile(user.id);
      const socInsights = await socialIntelligence.generateSocialInsights(user.id, profile);
      setSocialInsights(socInsights);

      // Load smart suggestions
      const suggestions = await ecosystemOrchestrator.generateSmartSuggestions(user.id, context);
      setSmartSuggestions(suggestions);

    } catch (error) {
      console.error('Error loading cognitive data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-300 animate-pulse mx-auto mb-4" />
          <p className="text-white text-lg">Activation de votre IA cognitive...</p>
        </div>
      </div>
    );
  }

  const TabButton = ({ id, label, icon: Icon, isActive }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        isActive
          ? 'bg-white/20 text-white'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="text-white/70 hover:text-white">
            ←
          </button>
          <h1 className="text-xl font-bold text-white">IA Cognitive</h1>
          <div className="w-6" />
        </div>

        {/* Cognitive Score */}
        {digitalTwinInsights && (
          <div className="bg-white/10 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Score Cognitif</p>
                <p className="text-white text-2xl font-bold">{digitalTwinInsights.productivity_score}/100</p>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="w-8 h-8 text-purple-300" />
                <div className="text-right">
                  <p className="text-white/70 text-xs">Précision IA</p>
                  <p className="text-white text-sm font-semibold">94%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <TabButton id="predictions" label="Prédictions" icon={Eye} isActive={activeTab === 'predictions'} />
          <TabButton id="assistance" label="Assistant" icon={MessageCircle} isActive={activeTab === 'assistance'} />
          <TabButton id="social" label="Social" icon={Users} isActive={activeTab === 'social'} />
          <TabButton id="suggestions" label="Suggestions" icon={Lightbulb} isActive={activeTab === 'suggestions'} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold flex items-center">
              <Eye className="w-5 h-5 mr-2 text-purple-300" />
              Prédictions Comportementales
            </h2>
            {predictions.map((prediction, index) => (
              <div key={prediction.id} className="bg-white/10 rounded-2xl p-4 border border-white/20">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${
                        prediction.confidence > 0.8 ? 'bg-green-400' :
                        prediction.confidence > 0.6 ? 'bg-yellow-400' : 'bg-orange-400'
                      }`} />
                      <span className="text-white/70 text-xs font-medium">
                        {Math.round(prediction.confidence * 100)}% de confiance
                      </span>
                    </div>
                    <p className="text-white font-medium">{prediction.predicted_action}</p>
                    <p className="text-white/60 text-sm mt-1">{prediction.reasoning}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-xs">Impact</p>
                    <p className="text-white text-sm font-semibold">{prediction.impact_score}/10</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-purple-300 text-sm">{prediction.suggested_timing}</span>
                  <div className="flex space-x-2">
                    <button className="bg-purple-500 hover:bg-purple-600 text-white text-xs px-3 py-1 rounded-full transition-colors">
                      Appliquer
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 rounded-full transition-colors">
                      Plus tard
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Proactive Assistance Tab */}
        {activeTab === 'assistance' && (
          <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-300" />
              Assistant Proactif
            </h2>
            {proactiveAssistance.map((assistance, index) => (
              <div key={index} className="bg-white/10 rounded-2xl p-4 border border-white/20">
                <div className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    assistance.priority === 'critical' ? 'bg-red-500' :
                    assistance.priority === 'high' ? 'bg-orange-500' :
                    assistance.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{assistance.message}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {assistance.actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-full transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Social Intelligence Tab */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-300" />
              Intelligence Sociale
            </h2>
            {socialInsights.map((insight, index) => (
              <div key={index} className="bg-white/10 rounded-2xl p-4 border border-white/20">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-white font-medium">{insight.title}</h3>
                    <p className="text-white/60 text-sm mt-1">{insight.description}</p>
                  </div>
                  <span className="text-green-300 text-sm font-semibold">
                    {Math.round(insight.impact_prediction * 100)}% impact
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-white/70 text-sm mb-2">Connexions potentielles:</p>
                  <div className="flex flex-wrap gap-2">
                    {insight.potential_connections.slice(0, 3).map((connection, connIndex) => (
                      <div key={connIndex} className="bg-white/20 rounded-full px-3 py-1">
                        <span className="text-white text-sm">
                          Utilisateur similaire ({Math.round(connection.similarity_score * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {insight.recommended_actions.slice(0, 2).map((action, actionIndex) => (
                    <button
                      key={actionIndex}
                      className="bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded-full transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Smart Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-yellow-300" />
              Suggestions Intelligentes
            </h2>
            {smartSuggestions.map((suggestion, index) => (
              <div key={suggestion.id} className="bg-white/10 rounded-2xl p-4 border border-white/20">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        suggestion.priority === 'critical' ? 'bg-red-500 text-white' :
                        suggestion.priority === 'high' ? 'bg-orange-500 text-white' :
                        suggestion.priority === 'medium' ? 'bg-blue-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {suggestion.type}
                      </span>
                      <span className="text-white/70 text-xs">
                        ROI: {suggestion.roi_prediction}%
                      </span>
                    </div>
                    <h3 className="text-white font-medium">{suggestion.title}</h3>
                    <p className="text-white/60 text-sm mt-1">{suggestion.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-xs">Impact</p>
                    <p className="text-white text-sm font-semibold">{suggestion.estimated_impact}%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-white/70 text-sm">
                      Effort: {suggestion.implementation_effort}h
                    </span>
                    <span className="text-green-300 text-sm">
                      Succès: {Math.round(suggestion.success_probability * 100)}%
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-4 py-1 rounded-full transition-colors">
                      Implémenter
                    </button>
                    <button className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-1 rounded-full transition-colors">
                      Détails
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-white text-lg font-bold">{predictions.length}</p>
            <p className="text-white/60 text-xs">Prédictions actives</p>
          </div>
          <div>
            <p className="text-white text-lg font-bold">{Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length * 100)}%</p>
            <p className="text-white/60 text-xs">Précision moyenne</p>
          </div>
          <div>
            <p className="text-white text-lg font-bold">{socialInsights.length}</p>
            <p className="text-white/60 text-xs">Opportunités sociales</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CognitiveInterface;
