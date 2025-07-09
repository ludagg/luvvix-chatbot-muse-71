
import React, { useState, useEffect } from 'react';
import { cognitiveEngine } from '@/services/luvvix-cognitive-engine';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';

interface CognitiveInterfaceProps {
  onBack: () => void;
}

const CognitiveInterface = ({ onBack }: CognitiveInterfaceProps) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mock context for now - in a real app this would come from user data
      const mockContext = {
        userId: 'current-user',
        currentActivity: 'browsing-news',
        timestamp: new Date().toISOString()
      };
      
      const cognitivePredictions = await cognitiveEngine.processContext(mockContext);
      setPredictions(cognitivePredictions);
    } catch (err) {
      setError('Failed to load cognitive predictions.');
      console.error('Error loading cognitive predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'action': return <TrendingUp className="w-4 h-4" />;
      case 'need': return <Lightbulb className="w-4 h-4" />;
      case 'optimization': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Interface Cognitive</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">
            <Brain className="inline-block w-5 h-5 mr-2 text-blue-500" />
            Insights Cognitifs
          </h2>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Chargement des prédictions...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && predictions.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune prédiction disponible pour le moment.</p>
          </div>
        )}

        {!loading && !error && predictions.length > 0 && (
          <div className="space-y-4">
            {predictions.map((prediction: any) => (
              <div key={prediction.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  {getPredictionIcon(prediction.type)}
                  <span className="font-medium text-gray-900">{prediction.predicted_action}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{prediction.reasoning}</p>
                <div className="flex justify-end">
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors">
                    Détails
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CognitiveInterface;
