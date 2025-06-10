
import { supabase } from '@/integrations/supabase/client';

interface NeuralNetworkData {
  user_id: string;
  interaction_type: string;
  app_context: string;
  data: any;
  timestamp: string;
  patterns: any;
}

interface UserBehaviorPattern {
  user_id: string;
  app_usage_patterns: Record<string, any>;
  preferences: Record<string, any>;
  productivity_peaks: string[];
  prediction_accuracy: number;
}

interface PredictionResult {
  type: 'app_suggestion' | 'workflow_automation' | 'content_recommendation' | 'productivity_tip';
  confidence: number;
  data: any;
  reasoning: string;
}

class LuvviXNeuralNetwork {
  private static instance: LuvviXNeuralNetwork;
  private learningData: NeuralNetworkData[] = [];
  private userPatterns: Map<string, UserBehaviorPattern> = new Map();

  static getInstance(): LuvviXNeuralNetwork {
    if (!LuvviXNeuralNetwork.instance) {
      LuvviXNeuralNetwork.instance = new LuvviXNeuralNetwork();
    }
    return LuvviXNeuralNetwork.instance;
  }

  async recordInteraction(interaction: Omit<NeuralNetworkData, 'timestamp'>) {
    const fullInteraction: NeuralNetworkData = {
      ...interaction,
      timestamp: new Date().toISOString()
    };

    this.learningData.push(fullInteraction);
    
    // Store in database for persistence
    try {
      await supabase
        .from('ecosystem_interactions')
        .insert({
          user_id: interaction.user_id,
          interaction_type: interaction.interaction_type,
          source_app: interaction.app_context,
          data: interaction.data,
          metadata: { patterns: interaction.patterns }
        });
    } catch (error) {
      console.error('Failed to store neural network data:', error);
    }

    // Update user patterns in real-time
    this.updateUserPatterns(interaction.user_id);
  }

  private updateUserPatterns(userId: string) {
    const userInteractions = this.learningData.filter(d => d.user_id === userId);
    
    if (userInteractions.length === 0) return;

    const pattern: UserBehaviorPattern = {
      user_id: userId,
      app_usage_patterns: this.analyzeAppUsage(userInteractions),
      preferences: this.extractPreferences(userInteractions),
      productivity_peaks: this.identifyProductivityPeaks(userInteractions),
      prediction_accuracy: this.calculateAccuracy(userId)
    };

    this.userPatterns.set(userId, pattern);
  }

  private analyzeAppUsage(interactions: NeuralNetworkData[]) {
    const appUsage: Record<string, any> = {};
    
    interactions.forEach(interaction => {
      const app = interaction.app_context;
      const hour = new Date(interaction.timestamp).getHours();
      
      if (!appUsage[app]) {
        appUsage[app] = {
          total_interactions: 0,
          peak_hours: {},
          common_actions: {},
          success_rate: 0
        };
      }
      
      appUsage[app].total_interactions++;
      appUsage[app].peak_hours[hour] = (appUsage[app].peak_hours[hour] || 0) + 1;
      
      if (interaction.data.action) {
        appUsage[app].common_actions[interaction.data.action] = 
          (appUsage[app].common_actions[interaction.data.action] || 0) + 1;
      }
    });

    return appUsage;
  }

  private extractPreferences(interactions: NeuralNetworkData[]) {
    const preferences: Record<string, any> = {
      preferred_time_blocks: {},
      content_types: {},
      workflow_styles: {},
      communication_patterns: {}
    };

    interactions.forEach(interaction => {
      const hour = new Date(interaction.timestamp).getHours();
      const timeBlock = this.getTimeBlock(hour);
      
      preferences.preferred_time_blocks[timeBlock] = 
        (preferences.preferred_time_blocks[timeBlock] || 0) + 1;

      if (interaction.data.content_type) {
        preferences.content_types[interaction.data.content_type] = 
          (preferences.content_types[interaction.data.content_type] || 0) + 1;
      }
    });

    return preferences;
  }

  private identifyProductivityPeaks(interactions: NeuralNetworkData[]): string[] {
    const hourlyActivity: Record<number, number> = {};
    
    interactions.forEach(interaction => {
      const hour = new Date(interaction.timestamp).getHours();
      hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1;
    });

    // Find top 3 most active hours
    const sortedHours = Object.entries(hourlyActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => `${hour}:00`);

    return sortedHours;
  }

  private calculateAccuracy(userId: string): number {
    // Simplified accuracy calculation
    const pattern = this.userPatterns.get(userId);
    if (!pattern) return 0.5;
    
    const interactions = this.learningData.filter(d => d.user_id === userId);
    return Math.min(0.95, 0.3 + (interactions.length * 0.01));
  }

  private getTimeBlock(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  async generatePredictions(userId: string): Promise<PredictionResult[]> {
    const pattern = this.userPatterns.get(userId);
    if (!pattern) return [];

    const predictions: PredictionResult[] = [];
    const currentHour = new Date().getHours();
    const currentTimeBlock = this.getTimeBlock(currentHour);

    // App suggestion based on time and usage patterns
    const recommendedApp = this.predictNextApp(pattern, currentHour);
    if (recommendedApp) {
      predictions.push({
        type: 'app_suggestion',
        confidence: pattern.prediction_accuracy,
        data: { app: recommendedApp, reason: 'Based on your usage patterns at this time' },
        reasoning: `You typically use ${recommendedApp} around ${currentTimeBlock}`
      });
    }

    // Workflow automation suggestions
    const workflowSuggestion = this.suggestWorkflowAutomation(pattern);
    if (workflowSuggestion) {
      predictions.push(workflowSuggestion);
    }

    // Productivity tips
    if (pattern.productivity_peaks.includes(`${currentHour}:00`)) {
      predictions.push({
        type: 'productivity_tip',
        confidence: 0.8,
        data: { 
          tip: 'This is one of your peak productivity hours! Consider tackling important tasks now.',
          suggested_apps: ['LuvviX Learn', 'LuvviX Forms', 'Code Studio']
        },
        reasoning: 'Based on your historical activity patterns'
      });
    }

    return predictions;
  }

  private predictNextApp(pattern: UserBehaviorPattern, currentHour: number): string | null {
    const apps = Object.keys(pattern.app_usage_patterns);
    let bestApp = '';
    let bestScore = 0;

    apps.forEach(app => {
      const appData = pattern.app_usage_patterns[app];
      const hourlyUsage = appData.peak_hours[currentHour] || 0;
      const totalUsage = appData.total_interactions;
      
      const score = (hourlyUsage / totalUsage) * 100;
      if (score > bestScore) {
        bestScore = score;
        bestApp = app;
      }
    });

    return bestScore > 10 ? bestApp : null;
  }

  private suggestWorkflowAutomation(pattern: UserBehaviorPattern): PredictionResult | null {
    const apps = Object.keys(pattern.app_usage_patterns);
    
    // Look for repetitive patterns that could be automated
    if (apps.includes('Mail') && apps.includes('Cloud') && apps.includes('Forms')) {
      return {
        type: 'workflow_automation',
        confidence: 0.75,
        data: {
          workflow: 'Email-to-Cloud-to-Form Pipeline',
          description: 'Automatically save email attachments to cloud and create forms from email templates',
          apps_involved: ['Mail', 'Cloud', 'Forms']
        },
        reasoning: 'You frequently use Mail, Cloud, and Forms together'
      };
    }

    return null;
  }

  async getUserInsights(userId: string) {
    const pattern = this.userPatterns.get(userId);
    if (!pattern) return null;

    return {
      most_used_apps: Object.entries(pattern.app_usage_patterns)
        .sort(([,a], [,b]) => (b as any).total_interactions - (a as any).total_interactions)
        .slice(0, 5)
        .map(([app, data]) => ({ app, interactions: (data as any).total_interactions })),
      productivity_score: this.calculateProductivityScore(pattern),
      peak_hours: pattern.productivity_peaks,
      prediction_accuracy: pattern.prediction_accuracy,
      personalization_level: this.calculatePersonalizationLevel(pattern)
    };
  }

  private calculateProductivityScore(pattern: UserBehaviorPattern): number {
    const totalInteractions = Object.values(pattern.app_usage_patterns)
      .reduce((sum, app: any) => sum + app.total_interactions, 0);
    
    const productiveApps = ['LuvviX Learn', 'Code Studio', 'Forms', 'Docs'];
    const productiveInteractions = Object.entries(pattern.app_usage_patterns)
      .filter(([app]) => productiveApps.includes(app))
      .reduce((sum, [, data]: [string, any]) => sum + data.total_interactions, 0);

    return Math.round((productiveInteractions / totalInteractions) * 100);
  }

  private calculatePersonalizationLevel(pattern: UserBehaviorPattern): number {
    const totalInteractions = Object.values(pattern.app_usage_patterns)
      .reduce((sum, app: any) => sum + app.total_interactions, 0);
    
    // Higher personalization with more interactions and diverse usage
    const uniqueApps = Object.keys(pattern.app_usage_patterns).length;
    const baseLevel = Math.min(90, totalInteractions * 2);
    const diversityBonus = uniqueApps * 5;
    
    return Math.min(100, baseLevel + diversityBonus);
  }

  async loadUserData(userId: string) {
    try {
      const { data: interactions } = await supabase
        .from('ecosystem_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (interactions) {
        this.learningData = interactions.map(interaction => ({
          user_id: interaction.user_id!,
          interaction_type: interaction.interaction_type,
          app_context: interaction.source_app,
          data: interaction.data,
          timestamp: interaction.created_at,
          patterns: interaction.metadata?.patterns || {}
        }));

        this.updateUserPatterns(userId);
      }
    } catch (error) {
      console.error('Failed to load user neural network data:', error);
    }
  }
}

export const neuralNetwork = LuvviXNeuralNetwork.getInstance();
export type { PredictionResult, UserBehaviorPattern };
