
import React, { useState, useEffect } from 'react';
import { AlertCircle, X, MessageCircle, Lightbulb, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { neuralNetwork } from '@/services/luvvix-neural-network';

const AIFloatingButton = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [hasAlerts, setHasAlerts] = useState(true);

  useEffect(() => {
    if (user && isExpanded) {
      loadSuggestions();
    }
  }, [user, isExpanded]);

  const loadSuggestions = async () => {
    if (!user) return;
    
    try {
      const predictions = await neuralNetwork.generatePredictions(user.id);
      setSuggestions(predictions);
      setHasAlerts(predictions.length > 0);
    } catch (error) {
      console.error('Erreur chargement suggestions IA:', error);
      // Suggestions par défaut
      setSuggestions([
        {
          type: 'reminder',
          confidence: 0.9,
          data: { tip: 'N\'oubliez pas de publier dans le groupe "LuvviX Developers" aujourd\'hui.' },
          reasoning: 'Rappel basé sur votre activité'
        },
        {
          type: 'recommendation',
          confidence: 0.8,
          data: { app: 'LuvviX Weather', reason: 'Consultez la météo avant votre réunion de 14h' },
          reasoning: 'Suggestion basée sur votre agenda'
        }
      ]);
      setHasAlerts(true);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recommendation':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'reminder':
        return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
    }
  };

  const getSuggestionTitle = (type: string) => {
    switch (type) {
      case 'recommendation':
        return 'Recommandation';
      case 'reminder':
        return 'Rappel important';
      case 'workflow_automation':
        return 'Automatisation';
      default:
        return 'Suggestion';
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Overlay pour fermer */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Panneau de suggestions */}
      {isExpanded && (
        <div className="fixed bottom-32 right-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Alertes & Rappels</h3>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-start space-x-3">
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {getSuggestionTitle(suggestion.type)}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        {suggestion.data.tip || suggestion.data.reason || suggestion.reasoning}
                      </p>
                      <div className="flex items-center mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-orange-500 h-1 rounded-full"
                            style={{ width: `${suggestion.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          {Math.round(suggestion.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">
                  Aucune alerte pour le moment
                </p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => {
                setIsExpanded(false);
                const event = new CustomEvent('navigate-to-assistant');
                window.dispatchEvent(event);
              }}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium py-2 rounded-xl text-sm hover:shadow-lg transition-all"
            >
              Ouvrir l'Assistant IA
            </button>
          </div>
        </div>
      )}

      {/* Bouton flottant - positionné au-dessus de la navigation */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300 ${
          isExpanded ? 'scale-110 shadow-orange-500/25' : 'hover:scale-105'
        }`}
      >
        <AlertCircle className="w-7 h-7 text-white" />
        {hasAlerts && suggestions.length > 0 && !isExpanded && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-xs font-bold">{suggestions.length}</span>
          </div>
        )}
      </button>
    </>
  );
};

export default AIFloatingButton;
