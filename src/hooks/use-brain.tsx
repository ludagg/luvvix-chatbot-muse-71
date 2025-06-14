
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { luvvixBrain } from '@/services/luvvix-brain';

interface BrainState {
  insights: any[];
  predictions: any[];
  loading: boolean;
  lastUpdate: Date | null;
}

export const useBrain = () => {
  const { user } = useAuth();
  const [state, setState] = useState<BrainState>({
    insights: [],
    predictions: [],
    loading: false,
    lastUpdate: null
  });

  // Charger les données du cerveau
  const loadBrainData = async () => {
    if (!user) return;

    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const insights = await luvvixBrain.getUserInsights(user.id);
      setState({
        insights: insights.behavioral_patterns || [],
        predictions: insights.predictions || [],
        loading: false,
        lastUpdate: new Date()
      });
    } catch (error) {
      console.error('Erreur chargement brain:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Traquer une interaction
  const track = async (type: string, app: string, data: any) => {
    if (!user) return;
    
    try {
      await luvvixBrain.trackInteraction(user.id, type, app, data);
      // Recharger les données après interaction importante
      if (['story_created', 'event_created', 'form_submitted'].includes(type)) {
        await loadBrainData();
      }
    } catch (error) {
      console.error('Erreur tracking brain:', error);
    }
  };

  // Conversation avec le cerveau
  const chat = async (message: string, context?: any) => {
    if (!user) return '';

    try {
      const response = await luvvixBrain.processConversation(user.id, message, context);
      await loadBrainData(); // Recharger après conversation
      return response;
    } catch (error) {
      console.error('Erreur chat brain:', error);
      return 'Connexion au cerveau interrompue...';
    }
  };

  useEffect(() => {
    if (user) {
      loadBrainData();
    }
  }, [user]);

  return {
    ...state,
    track,
    chat,
    reload: loadBrainData,
    isActive: !!user && !state.loading
  };
};
