
import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, X, MessageCircle, Lightbulb, TrendingUp, Clock, CheckCircle, Calendar, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { neuralNetwork } from '@/services/luvvix-neural-network';
import type { PredictionResult } from '@/services/luvvix-neural-network';

const AIFloatingButton = () => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<PredictionResult[]>([]);
  const [hasAlerts, setHasAlerts] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadSuggestions = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    
    try {
      setIsRefreshing(true);
      
      // Charger les données utilisateur si nécessaire
      if (forceRefresh) {
        await neuralNetwork.loadUserData(user.id);
      }
      
      const predictions = await neuralNetwork.generatePredictions(user.id);
      setSuggestions(predictions);
      setHasAlerts(predictions.length > 0);
      setLastUpdate(new Date());
      
      console.log('Suggestions chargées automatiquement:', predictions);
    } catch (error) {
      console.error('Erreur chargement suggestions IA:', error);
      // Suggestions par défaut
      setSuggestions([
        {
          type: 'reminder',
          confidence: 0.9,
          data: { tip: 'Vérifiez votre calendrier pour les événements à venir.' },
          reasoning: 'Rappel basé sur votre activité'
        }
      ]);
      setHasAlerts(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [user]);

  // Chargement automatique dès que l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      console.log('Utilisateur connecté, chargement des rappels...');
      loadSuggestions(true);
    }
  }, [user, loadSuggestions]);

  // Actualiser automatiquement toutes les 30 secondes
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      console.log('Actualisation automatique des rappels...');
      loadSuggestions(false);
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [user, loadSuggestions]);

  // Actualiser quand on revient sur la page (focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('Page redevenue visible, actualisation des rappels...');
        loadSuggestions(true);
      }
    };

    const handleFocus = () => {
      if (user) {
        console.log('Application refocusée, actualisation des rappels...');
        loadSuggestions(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, loadSuggestions]);

  // Actualiser quand l'application se charge complètement
  useEffect(() => {
    const handleLoad = () => {
      if (user) {
        console.log('Application chargée, actualisation des rappels...');
        setTimeout(() => loadSuggestions(true), 1000); // Délai pour s'assurer que tout est chargé
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [user, loadSuggestions]);

  const getSuggestionIcon = (type: string, alertType?: string) => {
    switch (type) {
      case 'event_reminder':
        if (alertType === 'now') return <Clock className="w-5 h-5 text-red-500 animate-pulse" />;
        if (alertType === 'started') return <Calendar className="w-5 h-5 text-orange-500 animate-bounce" />;
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'recommendation':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'reminder':
        return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      default:
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
    }
  };

  const getSuggestionTitle = (type: string, alertType?: string) => {
    switch (type) {
      case 'event_reminder':
        if (alertType === 'now') return 'Événement en cours !';
        if (alertType === 'started') return 'Événement commencé';
        if (alertType === 'upcoming') return 'Événement dans 5 min';
        return 'Rappel d\'événement';
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

  const getPriorityColor = (type: string, alertType?: string) => {
    if (type === 'event_reminder') {
      if (alertType === 'now') return 'border-red-500 bg-red-50 shadow-red-200 shadow-lg';
      if (alertType === 'started') return 'border-orange-500 bg-orange-50 shadow-orange-200 shadow-lg';
      if (alertType === 'upcoming') return 'border-blue-500 bg-blue-50 shadow-blue-200 shadow-lg';
    }
    return 'border-gray-200 bg-gray-50';
  };

  const handleDismissReminder = async (suggestion: PredictionResult) => {
    if (suggestion.id && suggestion.type === 'event_reminder') {
      neuralNetwork.dismissReminder(user!.id, suggestion.id);
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      
      // Actualiser le compteur d'alertes
      const remainingSuggestions = suggestions.filter(s => s.id !== suggestion.id);
      setHasAlerts(remainingSuggestions.length > 0);
      
      // Recharger après 1 seconde pour vérifier s'il y a de nouveaux rappels
      setTimeout(() => loadSuggestions(true), 1000);
    }
  };

  const formatEventTime = (minutesUntil: number) => {
    if (minutesUntil > 0) {
      return `dans ${minutesUntil} min`;
    } else if (minutesUntil === 0) {
      return 'maintenant';
    } else {
      return `commencé il y a ${Math.abs(minutesUntil)} min`;
    }
  };

  const handleButtonClick = () => {
    setIsExpanded(!isExpanded);
    // Force refresh when opening pour s'assurer d'avoir les dernières données
    if (!isExpanded && user) {
      loadSuggestions(true);
    }
  };

  if (!user) return null;

  // Compter seulement les rappels non marqués comme lus
  const unreadAlerts = suggestions.filter(s => !s.dismissed).length;
  const hasUrgentAlerts = suggestions.some(s => 
    s.type === 'event_reminder' && 
    (s.data?.alertType === 'now' || s.data?.alertType === 'started')
  );

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
                <div>
                  <h3 className="font-semibold text-gray-900">Alertes & Rappels</h3>
                  <p className="text-xs text-gray-500">
                    Mis à jour: {lastUpdate.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => loadSuggestions(true)}
                  disabled={isRefreshing}
                  className="p-1 hover:bg-gray-100 rounded-full"
                  title="Actualiser"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {isRefreshing && suggestions.length === 0 ? (
              <div className="text-center py-4">
                <RefreshCw className="w-6 h-6 text-gray-400 mx-auto mb-2 animate-spin" />
                <p className="text-gray-500 text-sm">Chargement des alertes...</p>
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div 
                  key={suggestion.id || index} 
                  className={`p-3 rounded-xl border transition-all ${getPriorityColor(suggestion.type, suggestion.data?.alertType)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getSuggestionIcon(suggestion.type, suggestion.data?.alertType)}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {getSuggestionTitle(suggestion.type, suggestion.data?.alertType)}
                          </h4>
                          <p className="text-gray-600 text-sm mt-1">
                            {suggestion.data.tip || suggestion.data.reason || suggestion.reasoning}
                          </p>
                          
                          {/* Informations spéciales pour les événements */}
                          {suggestion.type === 'event_reminder' && suggestion.data.event && (
                            <div className="mt-2 text-xs text-gray-500">
                              <div className="flex items-center space-x-2">
                                <span>📅 {suggestion.data.event.title}</span>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <span>⏰ {formatEventTime(suggestion.data.minutesUntil)}</span>
                                {suggestion.data.event.location && (
                                  <span>📍 {suggestion.data.event.location}</span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-orange-500 h-1 rounded-full transition-all"
                                style={{ width: `${suggestion.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 ml-2">
                              {Math.round(suggestion.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        
                        {/* Bouton pour marquer comme lu */}
                        {suggestion.type === 'event_reminder' && suggestion.data?.canDismiss && (
                          <button
                            onClick={() => handleDismissReminder(suggestion)}
                            className="p-1 hover:bg-green-100 rounded-full ml-2 flex-shrink-0 transition-colors"
                            title="Marquer comme lu"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </button>
                        )}
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
                <p className="text-gray-400 text-xs mt-1">
                  Les rappels d'événements apparaîtront ici
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

      {/* Bouton flottant avec animation améliorée */}
      <button
        onClick={handleButtonClick}
        className={`fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300 ${
          isExpanded ? 'scale-110 shadow-orange-500/25' : 'hover:scale-105'
        } ${hasUrgentAlerts ? 'animate-pulse' : ''}`}
      >
        <AlertCircle className={`w-7 h-7 text-white ${hasUrgentAlerts ? 'animate-bounce' : ''}`} />
        {hasAlerts && unreadAlerts > 0 && !isExpanded && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-xs font-bold">{unreadAlerts}</span>
          </div>
        )}
      </button>
    </>
  );
};

export default AIFloatingButton;
