
import { supabase } from '@/integrations/supabase/client';
import { neuralNetwork } from './luvvix-neural-network';
import { orchestrator } from './luvvix-orchestrator';
import { toast } from 'sonner';

interface UserKnowledge {
  id: string;
  preferences: Record<string, any>;
  behavioral_patterns: Record<string, any>;
  interaction_history: any[];
  learning_profile: Record<string, any>;
  ecosystem_usage: Record<string, any>;
  predictions: any[];
  last_updated: Date;
}

interface BrainAction {
  type: 'calendar' | 'story' | 'form' | 'notification' | 'automation' | 'recommendation';
  action: string;
  data: any;
  confidence: number;
  reasoning: string;
}

interface LearningEvent {
  userId: string;
  event_type: string;
  app_context: string;
  data: any;
  timestamp: Date;
  session_context?: any;
}

class LuvviXBrain {
  private static instance: LuvviXBrain;
  private userKnowledge: Map<string, UserKnowledge> = new Map();
  private activeListeners: Map<string, any> = new Map();
  private learningQueue: LearningEvent[] = [];
  private processingLearning = false;

  static getInstance(): LuvviXBrain {
    if (!LuvviXBrain.instance) {
      LuvviXBrain.instance = new LuvviXBrain();
    }
    return LuvviXBrain.instance;
  }

  constructor() {
    this.initializeBrain();
    this.startLearningProcessor();
  }

  private async initializeBrain() {
    console.log('🧠 LuvviX Brain: Initialisation du cerveau central...');
    
    // Démarrer l'écoute des interactions en temps réel
    this.setupRealtimeListeners();
    
    // Démarrer le processus d'apprentissage continu
    this.startContinuousLearning();
  }

  // === APPRENTISSAGE CONTINU ===
  async learnFromInteraction(event: LearningEvent) {
    console.log('🧠 Brain Learning:', event.event_type, 'dans', event.app_context);
    
    // Ajouter à la queue d'apprentissage
    this.learningQueue.push(event);
    
    // Enregistrer l'interaction immédiatement
    await this.recordInteraction(event);
    
    // Mettre à jour les patterns en temps réel
    await this.updateUserPatterns(event.userId, event);
    
    // Générer des prédictions si nécessaire
    if (this.shouldGeneratePredictions(event)) {
      await this.generateSmartPredictions(event.userId);
    }
  }

  private async recordInteraction(event: LearningEvent) {
    try {
      await supabase.from('ecosystem_interactions').insert({
        user_id: event.userId,
        interaction_type: event.event_type,
        source_app: event.app_context,
        data: event.data,
        metadata: {
          session_context: event.session_context,
          learning_processed: true,
          brain_version: '2.0'
        }
      });
    } catch (error) {
      console.error('❌ Erreur enregistrement interaction:', error);
    }
  }

  private async updateUserPatterns(userId: string, event: LearningEvent) {
    let knowledge = this.userKnowledge.get(userId);
    
    if (!knowledge) {
      knowledge = await this.loadUserKnowledge(userId);
    }

    // Analyser les patterns comportementaux
    const timeOfDay = new Date(event.timestamp).getHours();
    const dayOfWeek = new Date(event.timestamp).getDay();
    
    // Mettre à jour les patterns d'usage
    if (!knowledge.behavioral_patterns.app_usage) {
      knowledge.behavioral_patterns.app_usage = {};
    }
    
    knowledge.behavioral_patterns.app_usage[event.app_context] = 
      (knowledge.behavioral_patterns.app_usage[event.app_context] || 0) + 1;

    // Analyser les préférences temporelles
    if (!knowledge.behavioral_patterns.time_preferences) {
      knowledge.behavioral_patterns.time_preferences = {};
    }
    
    const timeSlot = this.getTimeSlot(timeOfDay);
    knowledge.behavioral_patterns.time_preferences[timeSlot] = 
      (knowledge.behavioral_patterns.time_preferences[timeSlot] || 0) + 1;

    // Sauvegarder les patterns mis à jour
    await this.saveUserKnowledge(knowledge);
    this.userKnowledge.set(userId, knowledge);
  }

  // === ACTIONS INTELLIGENTES ===
  async executeSmartAction(userId: string, action: BrainAction): Promise<boolean> {
    console.log('🧠 Brain Action:', action.type, '->', action.action);
    
    try {
      switch (action.type) {
        case 'calendar':
          return await this.executeCalendarAction(userId, action);
        case 'story':
          return await this.executeStoryAction(userId, action);
        case 'form':
          return await this.executeFormAction(userId, action);
        case 'notification':
          return await this.executeNotificationAction(userId, action);
        case 'automation':
          return await this.executeAutomationAction(userId, action);
        case 'recommendation':
          return await this.executeRecommendationAction(userId, action);
        default:
          console.warn('🧠 Type d\'action non reconnu:', action.type);
          return false;
      }
    } catch (error) {
      console.error('❌ Erreur exécution action:', error);
      return false;
    }
  }

  private async executeCalendarAction(userId: string, action: BrainAction): Promise<boolean> {
    if (action.action === 'create_event') {
      const { data, error } = await supabase.functions.invoke('luvvix-calendar-api', {
        body: {
          action: 'createEvent',
          eventData: action.data
        }
      });
      
      if (!error) {
        toast.success(`Événement créé automatiquement: ${action.data.title}`);
        await this.learnFromInteraction({
          userId,
          event_type: 'brain_action_success',
          app_context: 'Calendar',
          data: { action: 'create_event', confidence: action.confidence },
          timestamp: new Date()
        });
        return true;
      }
    }
    return false;
  }

  // === PRÉDICTIONS INTELLIGENTES ===
  async generateSmartPredictions(userId: string): Promise<any[]> {
    const knowledge = await this.loadUserKnowledge(userId);
    const predictions = [];

    // Prédictions basées sur les patterns temporels
    const timeBasedPredictions = await this.generateTimeBasedPredictions(knowledge);
    predictions.push(...timeBasedPredictions);

    // Prédictions basées sur l'usage des apps
    const appBasedPredictions = await this.generateAppBasedPredictions(knowledge);
    predictions.push(...appBasedPredictions);

    // Prédictions basées sur le contexte social (stories, posts)
    const socialPredictions = await this.generateSocialPredictions(userId, knowledge);
    predictions.push(...socialPredictions);

    // Sauvegarder les prédictions
    knowledge.predictions = predictions;
    await this.saveUserKnowledge(knowledge);

    return predictions;
  }

  private async generateTimeBasedPredictions(knowledge: UserKnowledge): Promise<any[]> {
    const predictions = [];
    const currentHour = new Date().getHours();
    const timeSlot = this.getTimeSlot(currentHour);
    
    const preferences = knowledge.behavioral_patterns.time_preferences || {};
    const mostActiveTime = Object.keys(preferences).reduce((a, b) => 
      preferences[a] > preferences[b] ? a : b, 'morning'
    );

    if (timeSlot === mostActiveTime) {
      predictions.push({
        type: 'time_optimization',
        confidence: 0.8,
        suggestion: `C'est votre moment le plus productif (${mostActiveTime}). Parfait pour les tâches importantes !`,
        action: {
          type: 'recommendation',
          action: 'suggest_focus_time',
          data: { timeSlot, productivity: 'high' }
        }
      });
    }

    return predictions;
  }

  // === GESTION DES CONNAISSANCES ===
  private async loadUserKnowledge(userId: string): Promise<UserKnowledge> {
    try {
      const { data } = await supabase
        .from('user_brain_knowledge')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (data) {
        return {
          id: data.id,
          preferences: data.preferences || {},
          behavioral_patterns: data.behavioral_patterns || {},
          interaction_history: data.interaction_history || [],
          learning_profile: data.learning_profile || {},
          ecosystem_usage: data.ecosystem_usage || {},
          predictions: data.predictions || [],
          last_updated: new Date(data.updated_at)
        };
      }
    } catch (error) {
      console.log('🧠 Création nouvelle base de connaissances pour:', userId);
    }

    // Créer une nouvelle base de connaissances
    const newKnowledge: UserKnowledge = {
      id: userId,
      preferences: {},
      behavioral_patterns: {},
      interaction_history: [],
      learning_profile: {},
      ecosystem_usage: {},
      predictions: [],
      last_updated: new Date()
    };

    await this.saveUserKnowledge(newKnowledge);
    return newKnowledge;
  }

  private async saveUserKnowledge(knowledge: UserKnowledge) {
    try {
      await supabase
        .from('user_brain_knowledge')
        .upsert({
          user_id: knowledge.id,
          preferences: knowledge.preferences,
          behavioral_patterns: knowledge.behavioral_patterns,
          interaction_history: knowledge.interaction_history.slice(-100), // Garder les 100 dernières
          learning_profile: knowledge.learning_profile,
          ecosystem_usage: knowledge.ecosystem_usage,
          predictions: knowledge.predictions,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('❌ Erreur sauvegarde connaissances:', error);
    }
  }

  // === CONVERSATION INTELLIGENTE ===
  async processConversation(userId: string, message: string, context?: any): Promise<string> {
    console.log('🧠 Brain Conversation:', message);
    
    // Charger les connaissances utilisateur
    const knowledge = await this.loadUserKnowledge(userId);
    
    // Apprendre de la conversation
    await this.learnFromInteraction({
      userId,
      event_type: 'ai_conversation',
      app_context: 'Brain_Assistant',
      data: { message, context },
      timestamp: new Date()
    });

    // Construire le prompt enrichi avec les connaissances
    const enrichedPrompt = this.buildEnrichedPrompt(message, knowledge, context);
    
    // Détecter les actions possibles
    const potentialActions = await this.detectPotentialActions(message, knowledge);
    
    // Appeler Gemini avec le contexte complet
    const response = await this.callGeminiWithBrainContext(enrichedPrompt, potentialActions);
    
    // Exécuter les actions détectées si approprié
    if (potentialActions.length > 0) {
      for (const action of potentialActions) {
        if (action.confidence > 0.7) {
          await this.executeSmartAction(userId, action);
        }
      }
    }

    return response;
  }

  private buildEnrichedPrompt(message: string, knowledge: UserKnowledge, context?: any): string {
    const userPatterns = knowledge.behavioral_patterns;
    const preferences = knowledge.preferences;
    const recentActivity = knowledge.interaction_history.slice(-10);

    return `Tu es LuvviX Brain, le cerveau central IA qui connaît parfaitement cet utilisateur.

PROFIL UTILISATEUR COMPLET:
- Apps les plus utilisées: ${JSON.stringify(userPatterns.app_usage || {})}
- Préférences temporelles: ${JSON.stringify(userPatterns.time_preferences || {})}
- Préférences générales: ${JSON.stringify(preferences)}
- Activité récente: ${recentActivity.length} interactions récentes
- Contexte actuel: ${JSON.stringify(context || {})}

Tu CONNAIS cet utilisateur et peux:
1. Créer des événements dans son calendrier
2. Analyser ses habitudes et patterns
3. Automatiser ses tâches répétitives
4. Faire des recommandations ultra-personnalisées
5. Agir sur tout l'écosystème LuvviX

Réponds de manière naturelle et personnalisée. Si l'utilisateur demande une action, agis directement.

Message: ${message}`;
  }

  // === UTILITAIRES ===
  private getTimeSlot(hour: number): string {
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  private shouldGeneratePredictions(event: LearningEvent): boolean {
    return ['calendar_event_created', 'story_viewed', 'form_submitted'].includes(event.event_type);
  }

  private async generateAppBasedPredictions(knowledge: UserKnowledge): Promise<any[]> {
    return [];
  }

  private async generateSocialPredictions(userId: string, knowledge: UserKnowledge): Promise<any[]> {
    return [];
  }

  private async detectPotentialActions(message: string, knowledge: UserKnowledge): Promise<BrainAction[]> {
    return [];
  }

  private async callGeminiWithBrainContext(prompt: string, actions: BrainAction[]): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
        body: { 
          message: prompt,
          context: 'brain_central',
          temperature: 0.7
        }
      });

      if (error) throw error;
      return data.response;
    } catch (error) {
      console.error('❌ Erreur Gemini Brain:', error);
      return "Je rencontre des difficultés techniques. Laissez-moi me reconnecter...";
    }
  }

  private setupRealtimeListeners() {
    // TODO: Implémenter l'écoute en temps réel des changements
  }

  private startContinuousLearning() {
    // TODO: Démarrer l'apprentissage continu en arrière-plan
  }

  private startLearningProcessor() {
    setInterval(() => {
      if (this.learningQueue.length > 0 && !this.processingLearning) {
        this.processLearningQueue();
      }
    }, 5000); // Traiter la queue toutes les 5 secondes
  }

  private async processLearningQueue() {
    // TODO: Traiter la queue d'apprentissage
  }

  // === API PUBLIQUE ===
  async getUserInsights(userId: string) {
    const knowledge = await this.loadUserKnowledge(userId);
    return {
      behavioral_patterns: knowledge.behavioral_patterns,
      predictions: knowledge.predictions,
      ecosystem_usage: knowledge.ecosystem_usage,
      last_updated: knowledge.last_updated
    };
  }

  async trackInteraction(userId: string, type: string, app: string, data: any) {
    await this.learnFromInteraction({
      userId,
      event_type: type,
      app_context: app,
      data,
      timestamp: new Date()
    });
  }
}

export const luvvixBrain = LuvviXBrain.getInstance();
