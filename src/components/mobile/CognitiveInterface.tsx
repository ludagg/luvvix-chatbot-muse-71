import React, { useState, useEffect } from 'react';
import { cognitiveEngine } from '@/services/luvvix-cognitive-engine';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface CognitiveInterfaceProps {
  userId: string;
  currentContext: any;
}

const CognitiveInterface = ({ userId, currentContext }: CognitiveInterfaceProps) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPredictions();
  }, [userId, currentContext]);

  const loadPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const cognitivePredictions = await cognitiveEngine.processContext(currentContext);
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
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">
        <Brain className="inline-block w-5 h-5 mr-2 text-blue-500" />
        Cognitive Insights
      </h2>

      {loading && <p className="text-gray-500">Loading predictions...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && predictions.length === 0 && (
        <p className="text-gray-500">No predictions available at this time.</p>
      )}

      {!loading && !error && predictions.length > 0 && (
        <ul className="space-y-3">
          {predictions.map((prediction: any) => (
            <li key={prediction.id} className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                {getPredictionIcon(prediction.type)}
                <span className="font-medium">{prediction.predicted_action}</span>
              </div>
              <p className="text-sm text-gray-600">{prediction.reasoning}</p>
              <div className="mt-2 flex justify-end">
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors">
                  Details
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CognitiveInterface;
