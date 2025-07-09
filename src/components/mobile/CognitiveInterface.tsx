import React, { useState, useEffect } from 'react';
import { Brain, Zap, Lightbulb, TrendingUp, Activity, Cpu, Eye, MessageSquare } from 'lucide-react';

interface CognitiveState {
  attention: number;
  memory: number;
  processingSpeed: number;
  focus: number;
}

interface CognitiveInsight {
  type: 'productivity' | 'focus' | 'learning';
  confidence: number;
  message: string;
  suggestions?: string[];
  timestamp: string;
}

interface PredictiveInsight {
  predictionId: string;
  timing: 'immediate' | 'short_term' | 'long_term';
}

const CognitiveInterface = () => {
  const [cognitiveState, setCognitiveState] = useState<CognitiveState>({
    attention: 75,
    memory: 60,
    processingSpeed: 80,
    focus: 90
  });

  const [insights, setInsights] = useState<CognitiveInsight[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);

  useEffect(() => {
    // Simuler des mises à jour de l'état cognitif
    const intervalId = setInterval(() => {
      setCognitiveState(prevState => ({
        attention: Math.max(0, Math.min(100, prevState.attention + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prevState.memory + (Math.random() - 0.5) * 5)),
        processingSpeed: Math.max(0, Math.min(100, prevState.processingSpeed + (Math.random() - 0.5) * 8)),
        focus: Math.max(0, Math.min(100, prevState.focus + (Math.random() - 0.5) * 12))
      }));
    }, 5000);

    // Simuler la génération d'insights
    const insightTimeoutId = setTimeout(() => {
      setInsights([
        {
          type: 'productivity',
          confidence: 0.7,
          message: 'Votre productivité est élevée ce matin',
          suggestions: ['Continuez sur cette lancée', 'Prenez une pause bien méritée'],
          timestamp: new Date().toISOString()
        }
      ]);
    }, 8000);

    // Simuler la génération d'insights prédictifs
    const predictiveTimeoutId = setTimeout(() => {
      setPredictiveInsights([
        {
          predictionId: `pred_${Date.now()}`,
          timing: 'short_term'
        }
      ]);
    }, 12000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(insightTimeoutId);
      clearTimeout(predictiveTimeoutId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-md p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Interface Cognitive
            </h1>
          </div>
          <div className="space-x-4">
            <button className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              <MessageSquare className="w-5 h-5" />
            </button>
            <button className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300">
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Cognitive Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">État Cognitif</h3>
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Attention</span>
                <span className="font-medium">{cognitiveState.attention}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${cognitiveState.attention}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Insights IA</h3>
              <Lightbulb className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {insights.length > 0 ? insights[0].message : "Analyse en cours..."}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Prédictions</h3>
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {predictiveInsights.length > 0 ? "Nouvelles prédictions disponibles" : "Aucune prédiction pour le moment"}
            </p>
          </div>
        </div>

        {/* Cognitive Boosters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Boostez votre mémoire</h3>
              <Cpu className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Améliorez votre capacité de mémorisation avec des exercices ciblés.
            </p>
            <button className="mt-4 bg-red-100 text-red-700 rounded-full px-4 py-2 text-sm hover:bg-red-200 transition-colors">
              Commencer
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Optimisez votre focus</h3>
              <Eye className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Réduisez les distractions et améliorez votre concentration.
            </p>
            <button className="mt-4 bg-green-100 text-green-700 rounded-full px-4 py-2 text-sm hover:bg-green-200 transition-colors">
              Explorer
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Suivez les tendances</h3>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Découvrez les sujets les plus populaires du moment.
            </p>
            <button className="mt-4 bg-blue-100 text-blue-700 rounded-full px-4 py-2 text-sm hover:bg-blue-200 transition-colors">
              Voir les tendances
            </button>
          </div>
        </div>

        {/* User Feedback */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Vos impressions</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Aidez-nous à améliorer votre expérience en partageant vos commentaires.
          </p>
          <textarea
            className="w-full mt-4 p-3 border rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-300"
            placeholder="Vos commentaires..."
            rows={4}
          ></textarea>
          <button className="mt-4 bg-purple-500 text-white rounded-full px-6 py-3 text-sm hover:bg-purple-600 transition-colors">
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
};

export default CognitiveInterface;
