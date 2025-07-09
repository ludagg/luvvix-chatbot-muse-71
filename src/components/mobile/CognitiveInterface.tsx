
import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, Zap, TrendingUp, Users, Target, ArrowLeft } from 'lucide-react';
import { useLuvvixCognitiveEngine } from '@/services/luvvix-cognitive-engine';

interface CognitiveInterfaceProps {
  onBack: () => void;
  onInsightGenerated?: (insight: any) => void;
}

const CognitiveInterface: React.FC<CognitiveInterfaceProps> = ({ onBack, onInsightGenerated }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<string>('');
  const { 
    generateInsight, 
    analyzeUserBehavior, 
    predictUserNeeds,
    isProcessing 
  } = useLuvvixCognitiveEngine();

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isActive) {
        const insight = await generateInsight();
        if (insight) {
          setCurrentInsight(insight);
          onInsightGenerated?.(insight);
        }
      }
    }, 30000); // Analyse toutes les 30 secondes

    return () => clearInterval(interval);
  }, [isActive, generateInsight, onInsightGenerated]);

  const handleActivate = async () => {
    setIsActive(!isActive);
    if (!isActive) {
      const initialInsight = await analyzeUserBehavior();
      setCurrentInsight(initialInsight);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Header avec bouton retour */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-full ${isActive ? 'bg-green-500/20 animate-pulse' : 'bg-gray-500/20'}`}>
                <Brain className={`h-6 w-6 ${isActive ? 'text-green-500' : 'text-gray-500'}`} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LuvviX Brain</h1>
                <p className="text-sm text-gray-600">Interface Cognitive Avancée</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleActivate}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isActive ? 'Actif' : 'Activer'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Interface principale */}
        <div className="cognitive-interface bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-6 backdrop-blur-sm">
          {currentInsight && (
            <div className="bg-white/70 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Lightbulb className="h-6 w-6 text-yellow-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Insight Cognitif</h3>
                  <p className="text-gray-700">{currentInsight}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-6 bg-white/40 rounded-lg">
              <Zap className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Automatisation</h3>
              <p className="text-sm text-gray-600">Tâches automatisées basées sur vos habitudes</p>
            </div>
            <div className="text-center p-6 bg-white/40 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Optimisation</h3>
              <p className="text-sm text-gray-600">Amélioration continue de votre productivité</p>
            </div>
            <div className="text-center p-6 bg-white/40 rounded-lg">
              <Target className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Personnalisation</h3>
              <p className="text-sm text-gray-600">Expérience adaptée à vos préférences</p>
            </div>
          </div>

          {isProcessing && (
            <div className="mt-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Analyse cognitive en cours...</span>
            </div>
          )}
        </div>

        {/* Statistiques et insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/70 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-600" />
              Analyse Comportementale
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Patterns détectés</span>
                <span className="font-semibold text-purple-600">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Prédictions précises</span>
                <span className="font-semibold text-green-600">94%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Optimisations suggérées</span>
                <span className="font-semibold text-blue-600">7</span>
              </div>
            </div>
          </div>

          <div className="bg-white/70 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" />
              Intelligence Sociale
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Interactions analysées</span>
                <span className="font-semibold text-blue-600">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recommandations sociales</span>
                <span className="font-semibold text-green-600">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Score d'engagement</span>
                <span className="font-semibold text-purple-600">8.7/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CognitiveInterface;
