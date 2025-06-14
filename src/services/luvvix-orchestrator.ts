
import { supabase } from '@/integrations/supabase/client';

interface AutomationInsight {
  efficiency_score: number;
  automation_opportunities: string[];
  current_automations: number;
  potential_automations: number;
  time_saved_per_week: number;
}

interface WorkflowSuggestion {
  type: 'email_to_calendar' | 'form_to_notification' | 'calendar_to_reminder' | 'ai_content_generation';
  description: string;
  estimated_time_saved: number;
  complexity: 'easy' | 'medium' | 'advanced';
  steps: string[];
}

class LuvviXOrchestrator {
  private static instance: LuvviXOrchestrator;

  static getInstance(): LuvviXOrchestrator {
    if (!LuvviXOrchestrator.instance) {
      LuvviXOrchestrator.instance = new LuvviXOrchestrator();
    }
    return LuvviXOrchestrator.instance;
  }

  async getAutomationInsights(userId: string): Promise<AutomationInsight> {
    try {
      // Analyser les interactions de l'utilisateur pour détecter les patterns d'automatisation
      const { data: interactions } = await supabase
        .from('ecosystem_interactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!interactions) {
        return this.getDefaultInsights();
      }

      // Calculer les métriques d'efficacité
      const appUsage = this.analyzeAppUsage(interactions);
      const repetitivePatterns = this.detectRepetitivePatterns(interactions);
      const efficiencyScore = this.calculateEfficiencyScore(appUsage, repetitivePatterns);

      return {
        efficiency_score: efficiencyScore,
        automation_opportunities: this.generateAutomationOpportunities(repetitivePatterns),
        current_automations: this.countCurrentAutomations(interactions),
        potential_automations: repetitivePatterns.length,
        time_saved_per_week: this.estimateTimeSavings(repetitivePatterns)
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse des automatisations:', error);
      return this.getDefaultInsights();
    }
  }

  async suggestWorkflows(userId: string): Promise<WorkflowSuggestion[]> {
    const insights = await this.getAutomationInsights(userId);
    const suggestions: WorkflowSuggestion[] = [];

    // Suggérer des workflows basés sur les patterns détectés
    if (insights.efficiency_score < 70) {
      suggestions.push({
        type: 'email_to_calendar',
        description: 'Automatiser la création d\'événements à partir des emails',
        estimated_time_saved: 30,
        complexity: 'medium',
        steps: [
          'Analyser les emails entrants',
          'Détecter les dates et heures',
          'Créer automatiquement les événements',
          'Envoyer une confirmation'
        ]
      });

      suggestions.push({
        type: 'form_to_notification',
        description: 'Notifications automatiques lors de soumissions de formulaires',
        estimated_time_saved: 15,
        complexity: 'easy',
        steps: [
          'Configurer les triggers de formulaire',
          'Définir les destinataires',
          'Personnaliser les messages',
          'Activer les notifications'
        ]
      });
    }

    if (insights.potential_automations > 3) {
      suggestions.push({
        type: 'calendar_to_reminder',
        description: 'Rappels intelligents basés sur votre calendrier',
        estimated_time_saved: 20,
        complexity: 'easy',
        steps: [
          'Analyser les événements du calendrier',
          'Créer des rappels automatiques',
          'Optimiser les délais de rappel',
          'Personnaliser selon les préférences'
        ]
      });
    }

    suggestions.push({
      type: 'ai_content_generation',
      description: 'Génération automatique de contenu avec l\'IA',
      estimated_time_saved: 60,
      complexity: 'advanced',
      steps: [
        'Définir les modèles de contenu',
        'Configurer l\'IA générative',
        'Automatiser la publication',
        'Révision et validation automatiques'
      ]
    });

    return suggestions;
  }

  private analyzeAppUsage(interactions: any[]): Record<string, number> {
    const usage: Record<string, number> = {};
    
    interactions.forEach(interaction => {
      const app = interaction.source_app || 'Unknown';
      usage[app] = (usage[app] || 0) + 1;
    });

    return usage;
  }

  private detectRepetitivePatterns(interactions: any[]): any[] {
    const patterns: any[] = [];
    const actionSequences: Record<string, number> = {};

    // Détecter les séquences d'actions répétitives
    for (let i = 0; i < interactions.length - 1; i++) {
      const current = interactions[i];
      const next = interactions[i + 1];
      
      const sequence = `${current.source_app}->${next.source_app}`;
      actionSequences[sequence] = (actionSequences[sequence] || 0) + 1;
    }

    // Identifier les patterns qui se répètent souvent
    Object.entries(actionSequences).forEach(([sequence, count]) => {
      if (count >= 3) { // Au moins 3 occurrences
        patterns.push({
          sequence,
          frequency: count,
          automation_potential: count > 5 ? 'high' : 'medium'
        });
      }
    });

    return patterns;
  }

  private calculateEfficiencyScore(appUsage: Record<string, number>, patterns: any[]): number {
    const totalInteractions = Object.values(appUsage).reduce((sum, count) => sum + count, 0);
    const repetitiveActions = patterns.reduce((sum, pattern) => sum + pattern.frequency, 0);
    
    // Score basé sur le ratio d'actions répétitives vs actions uniques
    const repetitiveRatio = repetitiveActions / Math.max(totalInteractions, 1);
    const baseScore = Math.max(30, 100 - (repetitiveRatio * 100));
    
    // Bonus pour la diversité d'utilisation des apps
    const appDiversity = Object.keys(appUsage).length;
    const diversityBonus = Math.min(20, appDiversity * 2);
    
    return Math.min(100, Math.floor(baseScore + diversityBonus));
  }

  private generateAutomationOpportunities(patterns: any[]): string[] {
    const opportunities: string[] = [];

    patterns.forEach(pattern => {
      const [sourceApp, targetApp] = pattern.sequence.split('->');
      
      if (sourceApp === 'Mail' && targetApp === 'Calendar') {
        opportunities.push('Automatiser la création d\'événements depuis les emails');
      } else if (sourceApp === 'Forms' && targetApp === 'Mail') {
        opportunities.push('Automatiser l\'envoi d\'emails de confirmation pour les formulaires');
      } else if (sourceApp === 'Calendar' && targetApp === 'LuvviX Assistant') {
        opportunities.push('Créer des rappels intelligents avant les événements');
      } else if (pattern.frequency > 5) {
        opportunities.push(`Automatiser le workflow ${sourceApp} → ${targetApp}`);
      }
    });

    // Ajouter des opportunités génériques si pas assez de patterns spécifiques
    if (opportunities.length < 3) {
      opportunities.push(
        'Synchronisation automatique entre applications',
        'Notifications intelligentes basées sur l\'activité',
        'Génération automatique de rapports',
        'Archivage automatique des anciens contenus'
      );
    }

    return opportunities.slice(0, 5); // Maximum 5 opportunités
  }

  private countCurrentAutomations(interactions: any[]): number {
    // Compter les interactions qui semblent automatisées
    let automatedCount = 0;
    
    interactions.forEach(interaction => {
      if (interaction.metadata?.automated === true || 
          interaction.interaction_type.includes('auto') ||
          interaction.source_app === 'LuvviX Orchestrator') {
        automatedCount++;
      }
    });

    return automatedCount;
  }

  private estimateTimeSavings(patterns: any[]): number {
    let totalSavings = 0;

    patterns.forEach(pattern => {
      // Estimer le temps économisé par pattern (en minutes par semaine)
      const timeSavedPerAction = 2; // 2 minutes par action automatisée
      const actionsPerWeek = pattern.frequency * 0.5; // Estimation conservative
      totalSavings += timeSavedPerAction * actionsPerWeek;
    });

    return Math.floor(totalSavings);
  }

  private getDefaultInsights(): AutomationInsight {
    return {
      efficiency_score: 65,
      automation_opportunities: [
        'Synchronisation automatique entre applications',
        'Notifications intelligentes',
        'Génération automatique de contenu'
      ],
      current_automations: 0,
      potential_automations: 3,
      time_saved_per_week: 45
    };
  }

  async createWorkflow(userId: string, workflowType: string, config: any): Promise<boolean> {
    try {
      // Enregistrer la configuration du workflow
      await supabase.from('ecosystem_interactions').insert({
        user_id: userId,
        interaction_type: 'workflow_creation',
        source_app: 'LuvviX Orchestrator',
        data: { workflowType, config },
        metadata: { automated: true }
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de la création du workflow:', error);
      return false;
    }
  }

  async executeWorkflow(workflowId: string, triggerData: any): Promise<any> {
    // Logique d'exécution des workflows
    // À implémenter selon les besoins spécifiques
    console.log('Exécution du workflow:', workflowId, triggerData);
    return { success: true };
  }
}

export const orchestrator = LuvviXOrchestrator.getInstance();
