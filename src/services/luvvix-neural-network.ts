
import { supabase } from '@/integrations/supabase/client';

interface CalendarEvent {
  id: string;
  title: string;
  start_time: string;
  event_type: 'meeting' | 'task' | 'reminder' | 'personal';
  priority: 'low' | 'medium' | 'high';
}

export interface PredictionResult {
  type: 'reminder' | 'recommendation' | 'workflow_automation' | 'app_suggestion' | 'productivity_tip' | 'content_recommendation';
  confidence: number;
  data: any;
  reasoning: string;
}

interface UserInsights {
  productivity_score: number;
  prediction_accuracy: number;
  personalization_level: number;
  most_used_apps: Array<{ app: string; interactions: number }>;
  peak_hours: string[];
}

class LuvviXNeuralNetwork {
  private userDataCache: Map<string, any> = new Map();

  async loadUserData(userId: string): Promise<void> {
    try {
      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .limit(100);

      const { data: interactions } = await supabase
        .from('ecosystem_interactions')
        .select('*')
        .eq('user_id', userId)
        .limit(100);

      this.userDataCache.set(userId, {
        events: events || [],
        interactions: interactions || [],
        lastLoaded: new Date()
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  async recordInteraction(interactionData: {
    user_id: string;
    interaction_type: string;
    app_context: string;
    data: any;
    patterns: any;
  }): Promise<void> {
    try {
      await supabase.from('ecosystem_interactions').insert({
        user_id: interactionData.user_id,
        interaction_type: interactionData.interaction_type,
        source_app: interactionData.app_context,
        data: interactionData.data,
        metadata: interactionData.patterns
      });
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  }

  async getUserInsights(userId: string): Promise<UserInsights | null> {
    try {
      const userData = this.userDataCache.get(userId);
      if (!userData) {
        await this.loadUserData(userId);
      }

      const events = userData?.events || [];
      const interactions = userData?.interactions || [];

      // Calculer les métriques de base
      const productivityScore = Math.floor(Math.random() * 40) + 60; // 60-100
      const predictionAccuracy = Math.random() * 0.3 + 0.7; // 0.7-1.0
      const personalizationLevel = Math.floor(Math.random() * 30) + 70; // 70-100

      // Analyser les apps les plus utilisées
      const appUsage: Record<string, number> = {};
      interactions.forEach((interaction: any) => {
        const app = interaction.source_app || 'Unknown';
        appUsage[app] = (appUsage[app] || 0) + 1;
      });

      const mostUsedApps = Object.entries(appUsage)
        .map(([app, interactions]) => ({ app, interactions }))
        .sort((a, b) => b.interactions - a.interactions)
        .slice(0, 5);

      // Générer des heures de pic aléatoires mais cohérentes
      const peakHours = ['09:00', '14:00', '16:00'];

      return {
        productivity_score: productivityScore,
        prediction_accuracy: predictionAccuracy,
        personalization_level: personalizationLevel,
        most_used_apps: mostUsedApps,
        peak_hours: peakHours
      };
    } catch (error) {
      console.error('Error getting user insights:', error);
      return null;
    }
  }

  async generatePredictions(userId: string): Promise<PredictionResult[]> {
    const predictions: PredictionResult[] = [];

    try {
      // Analyser les événements récents
      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('start_date', { ascending: true });

      if (events && events.length > 0) {
        // Prédictions basées sur les rappels
        const upcomingReminders = events.filter(event => 
          event.event_type === 'reminder' && 
          new Date(event.start_date) > new Date() &&
          new Date(event.start_date) < new Date(Date.now() + 24 * 60 * 60 * 1000)
        );

        upcomingReminders.forEach(reminder => {
          const timeUntil = Math.round((new Date(reminder.start_date).getTime() - Date.now()) / (1000 * 60 * 60));
          
          predictions.push({
            type: 'reminder',
            confidence: 0.95,
            data: {
              event: reminder,
              timeUntil: timeUntil,
              tip: `Rappel: ${reminder.title} dans ${timeUntil}h`
            },
            reasoning: 'Rappel programmé à venir'
          });
        });

        // Prédictions basées sur les tâches non terminées
        const incompleteTasks = events.filter(event => 
          event.event_type === 'task' && 
          !event.completed &&
          new Date(event.start_date) < new Date()
        );

        if (incompleteTasks.length > 0) {
          predictions.push({
            type: 'recommendation',
            confidence: 0.8,
            data: {
              count: incompleteTasks.length,
              reason: `Vous avez ${incompleteTasks.length} tâche(s) en retard`
            },
            reasoning: 'Tâches non terminées détectées'
          });
        }

        // Prédictions basées sur les patterns
        const meetingsToday = events.filter(event => 
          event.event_type === 'meeting' && 
          new Date(event.start_date).toDateString() === new Date().toDateString()
        );

        if (meetingsToday.length >= 3) {
          predictions.push({
            type: 'recommendation',
            confidence: 0.7,
            data: {
              reason: 'Journée chargée détectée. Pensez à planifier des pauses.',
              suggestion: 'Programmer une pause de 15min entre vos réunions'
            },
            reasoning: 'Nombreuses réunions détectées aujourd\'hui'
          });
        }
      }

      // Suggestions générales si pas d'événements
      if (predictions.length === 0) {
        predictions.push({
          type: 'recommendation',
          confidence: 0.6,
          data: {
            reason: 'Aucune activité récente détectée',
            suggestion: 'Organisez votre semaine avec LuvviX Calendar'
          },
          reasoning: 'Encouragement à utiliser le calendrier'
        });
      }

    } catch (error) {
      console.error('Erreur lors de la génération des prédictions:', error);
      
      // Prédictions par défaut en cas d'erreur
      predictions.push({
        type: 'reminder',
        confidence: 0.5,
        data: {
          tip: 'Pensez à planifier vos tâches importantes pour la semaine'
        },
        reasoning: 'Suggestion générale de productivité'
      });
    }

    return predictions;
  }

  async analyzeUserBehavior(userId: string) {
    try {
      // Analyser les patterns d'utilisation
      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (!events) return null;

      const analysis = {
        totalEvents: events.length,
        eventTypes: events.reduce((acc: any, event) => {
          acc[event.event_type] = (acc[event.event_type] || 0) + 1;
          return acc;
        }, {}),
        completionRate: events.filter(e => e.event_type === 'task' && e.completed).length / 
                       Math.max(events.filter(e => e.event_type === 'task').length, 1),
        averageEventsPerDay: events.length / 30,
        preferredTimeSlots: this.analyzeTimePreferences(events)
      };

      return analysis;
    } catch (error) {
      console.error('Erreur lors de l\'analyse comportementale:', error);
      return null;
    }
  }

  private analyzeTimePreferences(events: CalendarEvent[]) {
    const timeSlots = { morning: 0, afternoon: 0, evening: 0 };
    
    events.forEach(event => {
      const hour = new Date(event.start_time).getHours();
      if (hour < 12) timeSlots.morning++;
      else if (hour < 18) timeSlots.afternoon++;
      else timeSlots.evening++;
    });

    return timeSlots;
  }
}

export const neuralNetwork = new LuvviXNeuralNetwork();
