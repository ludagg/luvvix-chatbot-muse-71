import { supabase } from '@/integrations/supabase/client';
import { digitalTwin } from './luvvix-digital-twin';

interface CognitiveContext {
  user_id: string;
  current_app: string;
  time_of_day: string;
  device_info: any;
  recent_actions: Array<{
    action: string;
    timestamp: string;
    success: boolean;
  }>;
  environmental_factors: {
    weather?: string;
    calendar_events: any[];
    notification_count: number;
  };
}

interface CognitivePrediction {
  id: string;
  type: 'action' | 'need' | 'optimization' | 'warning';
  confidence: number;
  predicted_action: string;
  reasoning: string;
  suggested_timing: string;
  potential_blockers: string[];
  success_probability: number;
  impact_score: number;
}

interface ProactiveAssistance {
  type: 'preparation' | 'suggestion' | 'automation' | 'intervention';
  priority: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  actions: Array<{
    label: string;
    action: string;
    data: any;
  }>;
  expires_at: string;
}

class LuvviXCognitiveEngine {
  private static instance: LuvviXCognitiveEngine;
  private predictionCache: Map<string, CognitivePrediction[]> = new Map();
  private contextHistory: Map<string, CognitiveContext[]> = new Map();

  static getInstance(): LuvviXCognitiveEngine {
    if (!LuvviXCognitiveEngine.instance) {
      LuvviXCognitiveEngine.instance = new LuvviXCognitiveEngine();
    }
    return LuvviXCognitiveEngine.instance;
  }

  async processContext(context: CognitiveContext): Promise<CognitivePrediction[]> {
    const userId = context.user_id;
    
    // Store context in history
    const history = this.contextHistory.get(userId) || [];
    history.push(context);
    if (history.length > 100) history.shift(); // Keep last 100 contexts
    this.contextHistory.set(userId, history);

    // Get user's digital twin profile
    const profile = await digitalTwin.getProfile(userId);

    // Generate multi-layered predictions
    const predictions: CognitivePrediction[] = [];

    // 1. Immediate action predictions (next 5-30 minutes)
    const immediatePredictions = await this.predictImmediateActions(context, profile);
    predictions.push(...immediatePredictions);

    // 2. Need anticipation (things user will need)
    const needPredictions = await this.predictFutureNeeds(context, profile);
    predictions.push(...needPredictions);

    // 3. Optimization opportunities
    const optimizationPredictions = await this.detectOptimizationOpportunities(context, profile);
    predictions.push(...optimizationPredictions);

    // 4. Potential issues/warnings
    const warningPredictions = await this.detectPotentialIssues(context, profile);
    predictions.push(...warningPredictions);

    // Cache predictions
    this.predictionCache.set(userId, predictions);

    // Learn from context
    await this.learnFromContext(context);

    return predictions.sort((a, b) => b.confidence * b.impact_score - a.confidence * a.impact_score);
  }

  private async predictImmediateActions(context: CognitiveContext, profile: any): Promise<CognitivePrediction[]> {
    const predictions: CognitivePrediction[] = [];
    const currentHour = new Date().getHours();

    // Pattern-based predictions
    const appPreferences = profile.behavioral_patterns.app_preferences;
    for (const [app, score] of Object.entries(appPreferences)) {
      if (typeof score === 'number' && score > 3 && app !== context.current_app) {
        predictions.push({
          id: `action-${app}-${Date.now()}`,
          type: 'action',
          confidence: Math.min(0.9, score / 10),
          predicted_action: `Basculer vers ${app}`,
          reasoning: `Vous utilisez souvent ${app} à cette heure`,
          suggested_timing: 'dans les 15 prochaines minutes',
          potential_blockers: [],
          success_probability: 0.8,
          impact_score: 7
        });
      }
    }

    // Time-based predictions
    if (profile.behavioral_patterns.peak_hours.includes(`${currentHour}:00`)) {
      predictions.push({
        id: `peak-time-${Date.now()}`,
        type: 'optimization',
        confidence: 0.95,
        predicted_action: 'Travailler sur les tâches importantes',
        reasoning: 'Vous êtes dans votre heure de productivité optimale',
        suggested_timing: 'maintenant',
        potential_blockers: ['notifications', 'interruptions'],
        success_probability: 0.9,
        impact_score: 9
      });
    }

    // Context-based predictions
    if (context.environmental_factors.notification_count > 10) {
      predictions.push({
        id: `notification-cleanup-${Date.now()}`,
        type: 'optimization',
        confidence: 0.8,
        predicted_action: 'Nettoyer les notifications',
        reasoning: 'Vous avez beaucoup de notifications non lues',
        suggested_timing: 'maintenant',
        potential_blockers: [],
        success_probability: 0.9,
        impact_score: 6
      });
    }

    return predictions;
  }

  private async predictFutureNeeds(context: CognitiveContext, profile: any): Promise<CognitivePrediction[]> {
    const predictions: CognitivePrediction[] = [];

    // Calendar-based needs
    for (const event of context.environmental_factors.calendar_events) {
      const eventTime = new Date(event.start_date);
      const timeDiff = eventTime.getTime() - Date.now();
      const minutesUntil = timeDiff / (1000 * 60);

      if (minutesUntil > 0 && minutesUntil <= 60) {
        predictions.push({
          id: `prep-event-${event.id}`,
          type: 'need',
          confidence: 0.9,
          predicted_action: `Préparer pour: ${event.title}`,
          reasoning: `Événement dans ${Math.round(minutesUntil)} minutes`,
          suggested_timing: minutesUntil > 30 ? 'dans 15 minutes' : 'maintenant',
          potential_blockers: ['autres_taches', 'distractions'],
          success_probability: 0.8,
          impact_score: 8
        });
      }
    }

    // Goal-based needs
    if (profile.goals_evolution.short_term.length > 0) {
      const activeGoal = profile.goals_evolution.short_term[0];
      if (activeGoal.progress < 1.0) {
        predictions.push({
          id: `goal-progress-${Date.now()}`,
          type: 'need',
          confidence: 0.7,
          predicted_action: `Avancer sur: ${activeGoal.goal}`,
          reasoning: 'Progression nécessaire sur votre objectif actuel',
          suggested_timing: 'quand vous aurez du temps libre',
          potential_blockers: ['manque_de_temps', 'autres_priorites'],
          success_probability: 0.7,
          impact_score: 8
        });
      }
    }

    return predictions;
  }

  private async detectOptimizationOpportunities(context: CognitiveContext, profile: any): Promise<CognitivePrediction[]> {
    const predictions: CognitivePrediction[] = [];

    // Workflow optimization
    const history = this.contextHistory.get(context.user_id) || [];
    if (history.length > 10) {
      const recentApps = history.slice(-10).map(h => h.current_app);
      const appSwitches = new Set(recentApps).size;
      
      if (appSwitches > 6) {
        predictions.push({
          id: `workflow-opt-${Date.now()}`,
          type: 'optimization',
          confidence: 0.8,
          predicted_action: 'Optimiser votre workflow',
          reasoning: 'Vous basculez beaucoup entre applications',
          suggested_timing: 'à la fin de cette session',
          potential_blockers: [],
          success_probability: 0.8,
          impact_score: 7
        });
      }
    }

    // Stress level optimization
    if (profile.emotional_intelligence.stress_level > 0.7) {
      predictions.push({
        id: `stress-management-${Date.now()}`,
        type: 'optimization',
        confidence: 0.9,
        predicted_action: 'Prendre une pause relaxante',
        reasoning: 'Votre niveau de stress est élevé',
        suggested_timing: 'maintenant',
        potential_blockers: ['deadlines', 'urgences'],
        success_probability: 0.9,
        impact_score: 9
      });
    }

    return predictions;
  }

  private async detectPotentialIssues(context: CognitiveContext, profile: any): Promise<CognitivePrediction[]> {
    const predictions: CognitivePrediction[] = [];

    // Fatigue detection
    if (profile.emotional_intelligence.energy_level < 0.3) {
      predictions.push({
        id: `fatigue-warning-${Date.now()}`,
        type: 'warning',
        confidence: 0.85,
        predicted_action: 'Risque de baisse de performance',
        reasoning: 'Votre niveau d\'énergie est très bas',
        suggested_timing: 'surveillez dans les prochaines heures',
        potential_blockers: [],
        success_probability: 0.9,
        impact_score: 8
      });
    }

    // Overwork detection
    const recentActions = context.recent_actions.length;
    if (recentActions > 50) {
      predictions.push({
        id: `overwork-warning-${Date.now()}`,
        type: 'warning',
        confidence: 0.8,
        predicted_action: 'Risque de surmenage',
        reasoning: 'Activité intense détectée',
        suggested_timing: 'planifiez une pause',
        potential_blockers: ['charge_de_travail'],
        success_probability: 0.7,
        impact_score: 9
      });
    }

    return predictions;
  }

  private async learnFromContext(context: CognitiveContext): Promise<void> {
    // Update digital twin based on context
    await digitalTwin.learnFromInteraction(context.user_id, {
      app: context.current_app,
      action: 'context_usage',
      duration: 60, // Assuming 1 minute context
      success: true,
      context: context,
      timestamp: new Date().toISOString()
    });
  }

  async generateProactiveAssistance(userId: string, predictions: CognitivePrediction[]): Promise<ProactiveAssistance[]> {
    const assistance: ProactiveAssistance[] = [];

    for (const prediction of predictions.slice(0, 5)) { // Top 5 predictions
      if (prediction.confidence > 0.7) {
        let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
        
        if (prediction.type === 'warning' && prediction.confidence > 0.8) {
          priority = 'critical';
        } else if (prediction.impact_score > 8) {
          priority = 'high';
        } else if (prediction.confidence < 0.75) {
          priority = 'low';
        }

        const assistanceItem: ProactiveAssistance = {
          type: this.mapPredictionToAssistanceType(prediction.type),
          priority,
          message: this.generateAssistanceMessage(prediction),
          actions: this.generateSuggestedActions(prediction),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
        };

        assistance.push(assistanceItem);
      }
    }

    return assistance.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private mapPredictionToAssistanceType(predictionType: string): 'preparation' | 'suggestion' | 'automation' | 'intervention' {
    switch (predictionType) {
      case 'need': return 'preparation';
      case 'optimization': return 'suggestion';
      case 'action': return 'automation';
      case 'warning': return 'intervention';
      default: return 'suggestion';
    }
  }

  private generateAssistanceMessage(prediction: CognitivePrediction): string {
    const messages = {
      action: `💡 Je pense que vous allez bientôt vouloir ${prediction.predicted_action.toLowerCase()}`,
      need: `🎯 Vous pourriez avoir besoin de ${prediction.predicted_action.toLowerCase()}`,
      optimization: `⚡ Opportunité d'optimisation: ${prediction.predicted_action}`,
      warning: `⚠️ Attention: ${prediction.predicted_action}`
    };

    return messages[prediction.type] || `🤖 ${prediction.predicted_action}`;
  }

  private generateSuggestedActions(prediction: CognitivePrediction): Array<{ label: string; action: string; data: any }> {
    const baseActions = [
      {
        label: 'Appliquer maintenant',
        action: 'apply_suggestion',
        data: { predictionId: prediction.id, timing: 'now' }
      },
      {
        label: 'Plus tard',
        action: 'schedule_suggestion',
        data: { predictionId: prediction.id, timing: 'later' }
      }
    ];

    if (prediction.type === 'optimization') {
      baseActions.unshift({
        label: 'Voir les détails',
        action: 'show_optimization_details',
        data: { predictionId: prediction.id, timing: 'details' }
      });
    }

    if (prediction.type === 'warning') {
      baseActions.unshift({
        label: 'Analyser le problème',
        action: 'analyze_issue',
        data: { predictionId: prediction.id, timing: 'analyze' }
      });
    }

    return baseActions;
  }

  async validatePrediction(predictionId: string, actualOutcome: boolean): Promise<void> {
    // Store prediction accuracy for learning
    try {
      await supabase
        .from('cognitive_prediction_validation')
        .insert({
          prediction_id: predictionId,
          actual_outcome: actualOutcome,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error validating prediction:', error);
    }
  }

  async getCognitiveInsights(userId: string): Promise<{
    prediction_accuracy: number;
    learning_progress: number;
    cognitive_score: number;
    recommendations: string[];
  }> {
    try {
      const { data: validations } = await supabase
        .from('cognitive_prediction_validation')
        .select('*')
        .limit(100);

      const accuracy = validations ? 
        validations.filter(v => v.actual_outcome).length / validations.length : 
        0.75; // Default accuracy

      const profile = await digitalTwin.getProfile(userId);
      const insights = await digitalTwin.generatePersonalizedInsights(userId);

      return {
        prediction_accuracy: Math.round(accuracy * 100),
        learning_progress: insights.productivity_score,
        cognitive_score: Math.round((accuracy + insights.productivity_score / 100) * 50),
        recommendations: [
          'Continuez à utiliser l\'IA pour optimiser votre productivité',
          'Explorez de nouveaux patterns de travail',
          'Partagez vos insights avec la communauté LuvviX'
        ]
      };
    } catch (error) {
      console.error('Error getting cognitive insights:', error);
      return {
        prediction_accuracy: 75,
        learning_progress: 65,
        cognitive_score: 70,
        recommendations: ['Utilisez davantage LuvviX pour améliorer les prédictions']
      };
    }
  }
}

export const cognitiveEngine = LuvviXCognitiveEngine.getInstance();
export type { CognitiveContext, CognitivePrediction, ProactiveAssistance };
