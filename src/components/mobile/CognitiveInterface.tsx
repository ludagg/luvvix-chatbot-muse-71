
import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, Activity, TrendingUp } from 'lucide-react';
import { cognitiveEngine } from '@/services/luvvix-cognitive-engine';
import { CognitiveContext, CognitiveInsight } from '@/services/luvvix-cognitive-engine';

interface CognitiveInterfaceProps {
  userId: string;
  currentContext: CognitiveContext;
  onBack?: () => void;
}

const CognitiveInterface = ({ userId, currentContext, onBack }: CognitiveInterfaceProps) => {
  const [insights, setInsights] = useState<CognitiveInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeInsight, setActiveInsight] = useState<string | null>(null);

  useEffect(() => {
    loadCognitiveInsights();
  }, [userId, currentContext]);

  const loadCognitiveInsights = async () => {
    try {
      setLoading(true);
      const cognitiveInsights = await cognitiveEngine.processContext({
        user_id: userId,
        current_app: currentContext.current_app || 'mobile',
        time_of_day: new Date().getHours().toString(),
        device_info: {
          platform: 'mobile',
          screen_size: `${window.innerWidth}x${window.innerHeight}`
        },
        location: currentContext.location || 'unknown',
        recent_actions: currentContext.recent_actions || []
      });
      
      setInsights(cognitiveInsights);
    } catch (error) {
      console.error('Error loading cognitive insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <Brain className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Analyse cognitive en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="w-8 h-8 text-blue-500" />
        <div>
          <h2 className="text-lg font-bold text-gray-900">Interface Cognitive</h2>
          <p className="text-sm text-gray-600">Insights personnalisés basés sur votre comportement</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                {insight.type === 'suggestion' && <Lightbulb className="w-5 h-5 text-blue-600" />}
                {insight.type === 'pattern' && <Activity className="w-5 h-5 text-green-600" />}
                {insight.type === 'prediction' && <TrendingUp className="w-5 h-5 text-purple-600" />}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{insight.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                
                {insight.confidence_score && (
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs text-gray-500">Fiabilité:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.round(insight.confidence_score * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(insight.confidence_score * 100)}%
                    </span>
                  </div>
                )}
                
                {insight.actions && insight.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {insight.actions.map((action, index) => (
                      <button
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                        onClick={() => {
                          // Implémentation des actions cognitives
                          console.log('Cognitive action:', action);
                        }}
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {insights.length === 0 && (
        <div className="text-center py-8">
          <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analyse en cours</h3>
          <p className="text-gray-600">L'IA collecte vos données d'usage pour générer des insights personnalisés</p>
        </div>
      )}
    </div>
  );
};

export default CognitiveInterface;
