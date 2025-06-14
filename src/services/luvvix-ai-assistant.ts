
import { supabase } from '@/integrations/supabase/client';
import { neuralNetwork } from './luvvix-neural-network';
import { useCalendar } from '@/hooks/use-calendar';
import { useForms } from '@/hooks/use-forms';

interface AIFunction {
  name: string;
  description: string;
  parameters: any;
  execute: (params: any) => Promise<any>;
}

interface ConversationContext {
  userId: string;
  userHabits: any;
  recentInteractions: any[];
  preferences: any;
}

class LuvviXAIAssistant {
  private static instance: LuvviXAIAssistant;
  private functions: Map<string, AIFunction> = new Map();
  private conversationHistory: Map<string, any[]> = new Map();

  static getInstance(): LuvviXAIAssistant {
    if (!LuvviXAIAssistant.instance) {
      LuvviXAIAssistant.instance = new LuvviXAIAssistant();
    }
    return LuvviXAIAssistant.instance;
  }

  constructor() {
    this.initializeFunctions();
  }

  private initializeFunctions() {
    // Fonction pour créer des événements
    this.registerFunction({
      name: 'create_event',
      description: 'Créer un événement dans le calendrier de l\'utilisateur',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Titre de l\'événement' },
          description: { type: 'string', description: 'Description de l\'événement' },
          start_time: { type: 'string', description: 'Date et heure de début (ISO format)' },
          end_time: { type: 'string', description: 'Date et heure de fin (ISO format)' },
          event_type: { type: 'string', enum: ['meeting', 'task', 'reminder', 'personal'] },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          location: { type: 'string', description: 'Lieu de l\'événement' }
        },
        required: ['title', 'start_time', 'event_type']
      },
      execute: this.createEvent.bind(this)
    });

    // Fonction pour créer des rappels
    this.registerFunction({
      name: 'create_reminder',
      description: 'Créer un rappel pour l\'utilisateur',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Titre du rappel' },
          message: { type: 'string', description: 'Message du rappel' },
          remind_at: { type: 'string', description: 'Date et heure du rappel (ISO format)' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] }
        },
        required: ['title', 'remind_at']
      },
      execute: this.createReminder.bind(this)
    });

    // Fonction pour créer des formulaires
    this.registerFunction({
      name: 'create_form',
      description: 'Créer un formulaire personnalisé',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Titre du formulaire' },
          description: { type: 'string', description: 'Description du formulaire' },
          questions: { 
            type: 'array',
            description: 'Liste des questions du formulaire',
            items: {
              type: 'object',
              properties: {
                question_text: { type: 'string' },
                question_type: { type: 'string', enum: ['text', 'email', 'number', 'select', 'checkbox', 'radio', 'textarea'] },
                required: { type: 'boolean' },
                options: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        },
        required: ['title', 'questions']
      },
      execute: this.createForm.bind(this)
    });

    // Fonction pour analyser les habitudes
    this.registerFunction({
      name: 'analyze_user_habits',
      description: 'Analyser les habitudes et patterns de l\'utilisateur',
      parameters: {
        type: 'object',
        properties: {
          period: { type: 'string', enum: ['week', 'month', 'quarter'], description: 'Période d\'analyse' }
        }
      },
      execute: this.analyzeUserHabits.bind(this)
    });

    // Fonction pour suggérer des optimisations
    this.registerFunction({
      name: 'suggest_optimizations',
      description: 'Suggérer des optimisations basées sur les habitudes utilisateur',
      parameters: {
        type: 'object',
        properties: {
          focus_area: { type: 'string', enum: ['productivity', 'calendar', 'workflows', 'learning'] }
        }
      },
      execute: this.suggestOptimizations.bind(this)
    });
  }

  registerFunction(func: AIFunction) {
    this.functions.set(func.name, func);
  }

  async processMessage(userId: string, message: string): Promise<string> {
    try {
      // Charger le contexte utilisateur
      const context = await this.buildUserContext(userId);
      
      // Enregistrer l'interaction
      await neuralNetwork.recordInteraction({
        user_id: userId,
        interaction_type: 'ai_chat',
        app_context: 'LuvviX Assistant',
        data: { message },
        patterns: context.userHabits
      });

      // Préparer le prompt avec contexte
      const enrichedPrompt = this.buildEnrichedPrompt(message, context);

      // Appeler Gemini avec les fonctions disponibles
      const response = await this.callGeminiWithFunctions(enrichedPrompt, userId);

      // Mettre à jour l'historique de conversation
      this.updateConversationHistory(userId, message, response);

      return response;
    } catch (error) {
      console.error('Erreur lors du traitement du message:', error);
      return "Désolé, j'ai rencontré une erreur lors du traitement de votre demande. Pouvez-vous réessayer ?";
    }
  }

  private async buildUserContext(userId: string): Promise<ConversationContext> {
    // Charger les données utilisateur
    await neuralNetwork.loadUserData(userId);
    const userInsights = await neuralNetwork.getUserInsights(userId);

    // Récupérer les interactions récentes
    const { data: recentInteractions } = await supabase
      .from('ecosystem_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Récupérer les préférences utilisateur
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    return {
      userId,
      userHabits: userInsights,
      recentInteractions: recentInteractions || [],
      preferences: preferences || {}
    };
  }

  private buildEnrichedPrompt(message: string, context: ConversationContext): string {
    const systemPrompt = `Tu es LuvviX Assistant, un assistant IA personnel intelligent basé sur Gemini 1.5 Flash.

CONTEXTE UTILISATEUR:
- Score de productivité: ${context.userHabits?.productivity_score || 'N/A'}
- Apps les plus utilisées: ${context.userHabits?.most_used_apps?.map((app: any) => app.app).join(', ') || 'Aucune donnée'}
- Heures de pic: ${context.userHabits?.peak_hours?.join(', ') || 'Non définies'}
- Interactions récentes: ${context.recentInteractions.length} interactions dans l'écosystème LuvviX

FONCTIONS DISPONIBLES:
${Array.from(this.functions.values()).map(func => 
  `- ${func.name}: ${func.description}`
).join('\n')}

INSTRUCTIONS:
1. Réponds de manière personnalisée en tenant compte du contexte utilisateur
2. Si l'utilisateur demande une action (créer événement, rappel, formulaire), utilise les fonctions appropriées
3. Propose des suggestions basées sur les habitudes et patterns de l'utilisateur
4. Reste naturel et conversationnel
5. Si tu utilises une fonction, explique ce que tu fais

Message de l'utilisateur: ${message}`;

    return systemPrompt;
  }

  private async callGeminiWithFunctions(prompt: string, userId: string): Promise<string> {
    try {
      // Détecter si le message nécessite une fonction
      const functionCall = await this.detectFunctionCall(prompt);
      
      if (functionCall) {
        // Exécuter la fonction détectée
        const result = await this.executeFunction(functionCall.name, functionCall.parameters, userId);
        
        // Générer une réponse contextuelle
        const contextualPrompt = `L'utilisateur a demandé: ${prompt}
        
J'ai exécuté la fonction ${functionCall.name} avec les paramètres: ${JSON.stringify(functionCall.parameters)}
Résultat: ${JSON.stringify(result)}

Génère une réponse naturelle et utile qui confirme l'action et donne des conseils pertinents.`;

        const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
          body: { 
            message: contextualPrompt,
            context: 'assistant_with_functions'
          }
        });

        if (error) throw error;
        return data.response;
      } else {
        // Réponse normale avec Gemini
        const { data, error } = await supabase.functions.invoke('gemini-chat-response', {
          body: { 
            message: prompt,
            context: 'personalized_assistant'
          }
        });

        if (error) throw error;
        return data.response;
      }
    } catch (error) {
      console.error('Erreur Gemini:', error);
      return "Je rencontre des difficultés techniques. Pouvez-vous réessayer ?";
    }
  }

  private async detectFunctionCall(prompt: string): Promise<{ name: string; parameters: any } | null> {
    // Logique simple de détection basée sur des mots-clés
    const lowerPrompt = prompt.toLowerCase();

    // Détection création d'événement
    if (lowerPrompt.includes('créer') || lowerPrompt.includes('créer un événement') || 
        lowerPrompt.includes('ajouter') && (lowerPrompt.includes('réunion') || lowerPrompt.includes('rendez-vous'))) {
      return this.extractEventParameters(prompt);
    }

    // Détection création de rappel
    if (lowerPrompt.includes('rappel') || lowerPrompt.includes('me rappeler')) {
      return this.extractReminderParameters(prompt);
    }

    // Détection création de formulaire
    if (lowerPrompt.includes('formulaire') || lowerPrompt.includes('questionnaire')) {
      return this.extractFormParameters(prompt);
    }

    // Détection analyse d'habitudes
    if (lowerPrompt.includes('analyser') || lowerPrompt.includes('habitudes') || lowerPrompt.includes('statistiques')) {
      return { name: 'analyze_user_habits', parameters: { period: 'month' } };
    }

    return null;
  }

  private extractEventParameters(prompt: string): { name: string; parameters: any } {
    // Extraction basique - à améliorer avec NLP plus avancé
    return {
      name: 'create_event',
      parameters: {
        title: 'Événement créé par IA',
        start_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Dans 1 heure par défaut
        event_type: 'task',
        priority: 'medium'
      }
    };
  }

  private extractReminderParameters(prompt: string): { name: string; parameters: any } {
    return {
      name: 'create_reminder',
      parameters: {
        title: 'Rappel créé par IA',
        message: prompt,
        remind_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Demain par défaut
        priority: 'medium'
      }
    };
  }

  private extractFormParameters(prompt: string): { name: string; parameters: any } {
    return {
      name: 'create_form',
      parameters: {
        title: 'Formulaire créé par IA',
        description: 'Formulaire généré automatiquement',
        questions: [
          {
            question_text: 'Votre nom',
            question_type: 'text',
            required: true
          },
          {
            question_text: 'Votre email',
            question_type: 'email',
            required: true
          }
        ]
      }
    };
  }

  private async executeFunction(functionName: string, parameters: any, userId: string): Promise<any> {
    const func = this.functions.get(functionName);
    if (!func) {
      throw new Error(`Fonction ${functionName} non trouvée`);
    }

    return await func.execute({ ...parameters, userId });
  }

  // Implémentations des fonctions
  private async createEvent(params: any): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('luvvix-calendar-api', {
        body: {
          action: 'createEvent',
          eventData: {
            title: params.title,
            description: params.description || '',
            start_time: params.start_time,
            end_time: params.end_time || new Date(new Date(params.start_time).getTime() + 60 * 60 * 1000).toISOString(),
            event_type: params.event_type,
            priority: params.priority || 'medium',
            location: params.location || '',
            color: '#3b82f6',
            completed: false
          }
        }
      });

      if (error) throw error;
      return { success: true, event: data.event };
    } catch (error) {
      console.error('Erreur création événement:', error);
      return { success: false, error: error.message };
    }
  }

  private async createReminder(params: any): Promise<any> {
    return await this.createEvent({
      title: params.title,
      description: params.message,
      start_time: params.remind_at,
      event_type: 'reminder',
      priority: params.priority
    });
  }

  private async createForm(params: any): Promise<any> {
    try {
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          user_id: params.userId,
          title: params.title,
          description: params.description,
          published: false
        })
        .select()
        .single();

      if (formError) throw formError;

      // Ajouter les questions
      for (let i = 0; i < params.questions.length; i++) {
        const question = params.questions[i];
        await supabase
          .from('form_questions')
          .insert({
            form_id: form.id,
            question_text: question.question_text,
            question_type: question.question_type,
            required: question.required || false,
            position: i + 1,
            options: question.options || null
          });
      }

      return { success: true, form };
    } catch (error) {
      console.error('Erreur création formulaire:', error);
      return { success: false, error: error.message };
    }
  }

  private async analyzeUserHabits(params: any): Promise<any> {
    const insights = await neuralNetwork.getUserInsights(params.userId);
    const analysis = await neuralNetwork.analyzeUserBehavior(params.userId);
    
    return {
      insights,
      analysis,
      recommendations: [
        'Optimisez vos heures de pic de productivité',
        'Automatisez vos tâches répétitives',
        'Améliorez votre organisation avec des rappels intelligents'
      ]
    };
  }

  private async suggestOptimizations(params: any): Promise<any> {
    const predictions = await neuralNetwork.generatePredictions(params.userId);
    
    return {
      optimizations: predictions.map(p => ({
        type: p.type,
        suggestion: p.data,
        confidence: p.confidence
      }))
    };
  }

  private updateConversationHistory(userId: string, userMessage: string, aiResponse: string) {
    const history = this.conversationHistory.get(userId) || [];
    history.push(
      { role: 'user', content: userMessage, timestamp: new Date() },
      { role: 'assistant', content: aiResponse, timestamp: new Date() }
    );
    
    // Garder seulement les 50 derniers messages
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    this.conversationHistory.set(userId, history);
  }

  getConversationHistory(userId: string) {
    return this.conversationHistory.get(userId) || [];
  }

  clearConversationHistory(userId: string) {
    this.conversationHistory.delete(userId);
  }
}

export const luvvixAIAssistant = LuvviXAIAssistant.getInstance();
