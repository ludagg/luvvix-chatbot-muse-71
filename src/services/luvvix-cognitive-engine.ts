
import { supabase } from '@/integrations/supabase/client';

interface UserBehaviorPattern {
  action: string;
  frequency: number;
  timestamp: Date;
  context: Record<string, any>;
}

interface CognitiveInsight {
  type: 'recommendation' | 'automation' | 'optimization' | 'prediction';
  content: string;
  confidence: number;
  actionable: boolean;
  metadata: Record<string, any>;
}

interface PredictionResult {
  predictionId: string;
  timing: string;
  confidence: number;
  recommendation: string;
}

class LuvvixCognitiveEngine {
  private patterns: UserBehaviorPattern[] = [];
  private insights: CognitiveInsight[] = [];
  private isProcessing: boolean = false;

  constructor() {
    this.loadUserPatterns();
  }

  async loadUserPatterns(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('brain_interactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      this.patterns = data?.map(item => ({
        action: item.interaction_type,
        frequency: 1,
        timestamp: new Date(item.created_at),
        context: item.data || {}
      })) || [];
    } catch (error) {
      console.error('Error loading user patterns:', error);
    }
  }

  async recordUserInteraction(action: string, context: Record<string, any> = {}): Promise<void> {
    const pattern: UserBehaviorPattern = {
      action,
      frequency: 1,
      timestamp: new Date(),
      context
    };

    this.patterns.push(pattern);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      await supabase
        .from('brain_interactions')
        .insert({
          user_id: userData.user.id,
          source_app: 'luvvix_os',
          interaction_type: action,
          data: context,
          brain_analysis: await this.analyzePattern(pattern),
          confidence_score: 0.8
        });
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  }

  private async analyzePattern(pattern: UserBehaviorPattern): Promise<Record<string, any>> {
    const similarPatterns = this.patterns.filter(p => 
      p.action === pattern.action && 
      Math.abs(p.timestamp.getTime() - pattern.timestamp.getTime()) < 3600000 // 1 heure
    );

    return {
      frequency: similarPatterns.length,
      timeOfDay: pattern.timestamp.getHours(),
      dayOfWeek: pattern.timestamp.getDay(),
      context: pattern.context,
      trend: similarPatterns.length > 5 ? 'increasing' : 'stable'
    };
  }

  async generateInsight(): Promise<string> {
    if (this.patterns.length === 0) {
      return "Continuez à utiliser LuvviX pour que je puisse apprendre vos habitudes et vous proposer des suggestions personnalisées.";
    }

    const recentPatterns = this.patterns.slice(-10);
    const mostFrequentAction = this.getMostFrequentAction(recentPatterns);
    
    const insights = [
      `Vous utilisez souvent ${mostFrequentAction}. Voulez-vous que je crée un raccourci ?`,
      `J'ai remarqué que vous êtes plus actif le ${this.getMostActiveDay()}. Voulez-vous des rappels ?`,
      `Votre productivité semble optimale vers ${this.getMostActiveHour()}h. Planifions vos tâches importantes !`,
      `Vous pourriez économiser du temps en automatisant certaines actions répétitives.`,
    ];

    return insights[Math.floor(Math.random() * insights.length)];
  }

  private getMostFrequentAction(patterns: UserBehaviorPattern[]): string {
    const actionCounts = patterns.reduce((acc, pattern) => {
      acc[pattern.action] = (acc[pattern.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(actionCounts).reduce((a, b) => 
      actionCounts[a] > actionCounts[b] ? a : b
    ) || 'navigation';
  }

  private getMostActiveDay(): string {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const dayCounts = this.patterns.reduce((acc, pattern) => {
      const day = pattern.timestamp.getDay();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const mostActiveDay = Object.keys(dayCounts).reduce((a, b) => 
      dayCounts[Number(a)] > dayCounts[Number(b)] ? a : b
    );

    return days[Number(mostActiveDay)] || 'Lundi';
  }

  private getMostActiveHour(): number {
    const hourCounts = this.patterns.reduce((acc, pattern) => {
      const hour = pattern.timestamp.getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const mostActiveHour = Object.keys(hourCounts).reduce((a, b) => 
      hourCounts[Number(a)] > hourCounts[Number(b)] ? a : b
    );

    return Number(mostActiveHour) || 14;
  }

  async analyzeUserBehavior(): Promise<string> {
    await this.loadUserPatterns();
    return this.generateInsight();
  }

  async predictUserNeeds(): Promise<PredictionResult> {
    const currentHour = new Date().getHours();
    const predictions = [
      {
        predictionId: 'morning_routine',
        timing: 'morning',
        confidence: 0.8,
        recommendation: 'Il est temps de consulter vos actualités personnalisées'
      },
      {
        predictionId: 'work_break',
        timing: 'afternoon',
        confidence: 0.7,
        recommendation: 'Prenez une pause et consultez votre centre social'
      }
    ];

    return predictions[currentHour < 12 ? 0 : 1];
  }

  getProcessingStatus(): boolean {
    return this.isProcessing;
  }
}

export const cognitiveEngine = new LuvvixCognitiveEngine();

export const useLuvvixCognitiveEngine = () => {
  return {
    generateInsight: () => cognitiveEngine.generateInsight(),
    analyzeUserBehavior: () => cognitiveEngine.analyzeUserBehavior(),
    predictUserNeeds: () => cognitiveEngine.predictUserNeeds(),
    recordInteraction: (action: string, context?: Record<string, any>) => 
      cognitiveEngine.recordUserInteraction(action, context),
    isProcessing: cognitiveEngine.getProcessingStatus()
  };
};
