
import React, { useState, useEffect } from 'react';
import { Brain, Lightbulb, Zap, TrendingUp, Users, Target } from 'lucide-react';
import { useLuvvixCognitiveEngine } from '@/services/luvvix-cognitive-engine';

interface CognitiveInterfaceProps {
  onInsightGenerated?: (insight: any) => void;
}

const CognitiveInterface: React.FC<CognitiveInterfaceProps> = ({ onInsightGenerated }) => {
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
    <div className="cognitive-interface bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full ${isActive ? 'bg-green-500/20 animate-pulse' : 'bg-gray-500/20'}`}>
            <Brain className={`h-5 w-5 ${isActive ? 'text-green-500' : 'text-gray-500'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">LuvviX Brain</h3>
            <p className="text-xs text-gray-600">Intelligence Cognitive</p>
          </div>
        </div>
        
        <button
          onClick={handleActivate}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
            isActive 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {isActive ? 'Actif' : 'Inactif'}
        </button>
      </div>

      {currentInsight && (
        <div className="bg-white/50 rounded-lg p-3 mb-3">
          <div className="flex items-start space-x-2">
            <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
            <p className="text-sm text-gray-700">{currentInsight}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 bg-white/30 rounded-lg">
          <Zap className="h-4 w-4 text-blue-500 mx-auto mb-1" />
          <span className="text-xs text-gray-600">Automatisation</span>
        </div>
        <div className="text-center p-2 bg-white/30 rounded-lg">
          <TrendingUp className="h-4 w-4 text-green-500 mx-auto mb-1" />
          <span className="text-xs text-gray-600">Optimisation</span>
        </div>
        <div className="text-center p-2 bg-white/30 rounded-lg">
          <Target className="h-4 w-4 text-purple-500 mx-auto mb-1" />
          <span className="text-xs text-gray-600">Personnalisation</span>
        </div>
      </div>

      {isProcessing && (
        <div className="mt-3 flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
          <span className="ml-2 text-xs text-gray-600">Analyse en cours...</span>
        </div>
      )}
    </div>
  );
};

export default CognitiveInterface;
