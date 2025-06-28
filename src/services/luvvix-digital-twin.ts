import { supabase } from '@/integrations/supabase/client';

interface DigitalTwinProfile {
  user_id: string;
  psychological_profile: {
    personality_type: string;
    work_style: string;
    communication_preference: string;
    stress_patterns: string[];
    motivation_drivers: string[];
  };
  behavioral_patterns: {
    peak_hours: string[];
    app_preferences: Record<string, number>;
    task_completion_style: string;
    break_patterns: string[];
  };
  skills_map: {
    technical_skills: Record<string, number>;
    soft_skills: Record<string, number>;
    learning_speed: number;
    preferred_learning_style: string;
  };
  goals_evolution: {
    short_term: Array<{ goal: string; progress: number; created_at: string }>;
    long_term: Array<{ goal: string; milestones: string[]; created_at: string }>;
  };
  emotional_intelligence: {
    current_mood: string;
    mood_history: Array<{ mood: string; timestamp: string; context: string }>;
    stress_level: number;
    energy_level: number;
  };
}

class LuvviXDigitalTwin {
  private static instance: LuvviXDigitalTwin;
  private profileCache: Map<string, DigitalTwinProfile> = new Map();

  static getInstance(): LuvviXDigitalTwin {
    if (!LuvviXDigitalTwin.instance) {
      LuvviXDigitalTwin.instance = new LuvviXDigitalTwin();
    }
    return LuvviXDigitalTwin.instance;
  }

  async initializeProfile(userId: string): Promise<DigitalTwinProfile> {
    const defaultProfile: DigitalTwinProfile = {
      user_id: userId,
      psychological_profile: {
        personality_type: 'discovering',
        work_style: 'adaptive',
        communication_preference: 'balanced',
        stress_patterns: [],
        motivation_drivers: ['achievement', 'growth']
      },
      behavioral_patterns: {
        peak_hours: ['09:00', '14:00'],
        app_preferences: {},
        task_completion_style: 'progressive',
        break_patterns: ['every_hour']
      },
      skills_map: {
        technical_skills: {},
        soft_skills: {},
        learning_speed: 0.5,
        preferred_learning_style: 'visual'
      },
      goals_evolution: {
        short_term: [],
        long_term: []
      },
      emotional_intelligence: {
        current_mood: 'neutral',
        mood_history: [],
        stress_level: 0.3,
        energy_level: 0.7
      }
    };

    await this.saveProfile(userId, defaultProfile);
    return defaultProfile;
  }

  async getProfile(userId: string): Promise<DigitalTwinProfile> {
    if (this.profileCache.has(userId)) {
      return this.profileCache.get(userId)!;
    }

    try {
      const { data, error } = await supabase
        .from('user_digital_twins')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return await this.initializeProfile(userId);
      }

      const profile = data.profile_data as DigitalTwinProfile;
      this.profileCache.set(userId, profile);
      return profile;
    } catch (error) {
      console.error('Error getting digital twin profile:', error);
      return await this.initializeProfile(userId);
    }
  }

  async updateProfile(userId: string, updates: Partial<DigitalTwinProfile>): Promise<void> {
    const currentProfile = await this.getProfile(userId);
    const updatedProfile = { ...currentProfile, ...updates };
    
    await this.saveProfile(userId, updatedProfile);
    this.profileCache.set(userId, updatedProfile);
  }

  async learnFromInteraction(userId: string, interaction: {
    app: string;
    action: string;
    duration: number;
    success: boolean;
    context: any;
    timestamp: string;
  }): Promise<void> {
    const profile = await this.getProfile(userId);

    // Update app preferences
    const appScore = profile.behavioral_patterns.app_preferences[interaction.app] || 0;
    profile.behavioral_patterns.app_preferences[interaction.app] = appScore + (interaction.success ? 1 : -0.5);

    // Detect patterns based on time
    const hour = new Date(interaction.timestamp).getHours();
    const timeSlot = `${hour}:00`;
    
    if (interaction.success && interaction.duration < 300) { // Quick successful actions
      if (!profile.behavioral_patterns.peak_hours.includes(timeSlot)) {
        profile.behavioral_patterns.peak_hours.push(timeSlot);
      }
    }

    // Update mood based on success patterns
    const recentSuccesses = interaction.success ? 1 : 0;
    if (recentSuccesses > 0.7) {
      profile.emotional_intelligence.current_mood = 'positive';
      profile.emotional_intelligence.energy_level = Math.min(1, profile.emotional_intelligence.energy_level + 0.1);
    } else if (recentSuccesses < 0.3) {
      profile.emotional_intelligence.current_mood = 'frustrated';
      profile.emotional_intelligence.stress_level = Math.min(1, profile.emotional_intelligence.stress_level + 0.1);
    }

    await this.updateProfile(userId, profile);
  }

  async detectMoodShift(userId: string, currentContext: any): Promise<{
    mood_detected: string;
    confidence: number;
    suggestions: string[];
  }> {
    const profile = await this.getProfile(userId);
    
    // Analyze current interaction patterns
    const timeOfDay = new Date().getHours();
    const isPeakHour = profile.behavioral_patterns.peak_hours.some(hour => 
      Math.abs(parseInt(hour.split(':')[0]) - timeOfDay) <= 1
    );

    let detectedMood = 'neutral';
    let confidence = 0.5;
    const suggestions: string[] = [];

    if (!isPeakHour && profile.emotional_intelligence.energy_level < 0.4) {
      detectedMood = 'tired';
      confidence = 0.8;
      suggestions.push('Prenez une pause de 5 minutes');
      suggestions.push('Hydratez-vous');
      suggestions.push('Faites quelques étirements');
    } else if (profile.emotional_intelligence.stress_level > 0.7) {
      detectedMood = 'stressed';
      confidence = 0.9;
      suggestions.push('Essayez une technique de respiration');
      suggestions.push('Organisez vos tâches par priorité');
      suggestions.push('Reportez les tâches non-urgentes');
    } else if (isPeakHour && profile.emotional_intelligence.energy_level > 0.7) {
      detectedMood = 'productive';
      confidence = 0.9;
      suggestions.push('C\'est le moment parfait pour les tâches importantes');
      suggestions.push('Concentrez-vous sur vos objectifs prioritaires');
    }

    // Update mood history
    profile.emotional_intelligence.mood_history.push({
      mood: detectedMood,
      timestamp: new Date().toISOString(),
      context: JSON.stringify(currentContext)
    });

    // Keep only last 50 mood entries
    if (profile.emotional_intelligence.mood_history.length > 50) {
      profile.emotional_intelligence.mood_history = profile.emotional_intelligence.mood_history.slice(-50);
    }

    profile.emotional_intelligence.current_mood = detectedMood;
    await this.updateProfile(userId, profile);

    return { mood_detected: detectedMood, confidence, suggestions };
  }

  async predictNextActions(userId: string, currentContext: any): Promise<Array<{
    action: string;
    app: string;
    confidence: number;
    timing: string;
    reasoning: string;
  }>> {
    const profile = await this.getProfile(userId);
    const predictions: Array<{
      action: string;
      app: string;
      confidence: number;
      timing: string;
      reasoning: string;
    }> = [];

    // Analyze app usage patterns
    const sortedApps = Object.entries(profile.behavioral_patterns.app_preferences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    const currentHour = new Date().getHours();
    const isPeakTime = profile.behavioral_patterns.peak_hours.some(hour => 
      Math.abs(parseInt(hour.split(':')[0]) - currentHour) <= 1
    );

    for (const [app, score] of sortedApps) {
      if (score > 0) {
        let confidence = Math.min(0.9, score / 10);
        let timing = 'dans les 30 prochaines minutes';
        let reasoning = `Basé sur vos habitudes d'utilisation de ${app}`;

        if (isPeakTime) {
          confidence += 0.2;
          timing = 'dans les 10 prochaines minutes';
          reasoning += ' pendant votre heure de productivité optimale';
        }

        predictions.push({
          action: this.predictAppAction(app, profile),
          app,
          confidence: Math.min(0.95, confidence),
          timing,
          reasoning
        });
      }
    }

    // Predict based on goals
    if (profile.goals_evolution.short_term.length > 0) {
      const activeGoal = profile.goals_evolution.short_term[0];
      predictions.push({
        action: `Continuer le travail sur: ${activeGoal.goal}`,
        app: 'LuvviX Planning',
        confidence: 0.8,
        timing: 'maintenant',
        reasoning: 'Basé sur vos objectifs actuels'
      });
    }

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  private predictAppAction(app: string, profile: DigitalTwinProfile): string {
    const actionMap: Record<string, string[]> = {
      'Mail': ['Vérifier les nouveaux emails', 'Répondre aux messages prioritaires', 'Organiser la boîte de réception'],
      'Calendar': ['Consulter les événements du jour', 'Planifier la semaine', 'Ajouter un nouveau rendez-vous'],
      'LuvviX Learn': ['Continuer le cours en cours', 'Découvrir de nouveaux sujets', 'Réviser les concepts appris'],
      'Forms': ['Analyser les réponses récentes', 'Créer un nouveau formulaire', 'Optimiser un formulaire existant'],
      'AI Studio': ['Améliorer un agent existant', 'Créer un nouvel agent', 'Analyser les performances des agents']
    };

    const actions = actionMap[app] || ['Utiliser cette application'];
    return actions[Math.floor(Math.random() * actions.length)];
  }

  private async saveProfile(userId: string, profile: DigitalTwinProfile): Promise<void> {
    try {
      await supabase
        .from('user_digital_twins')
        .upsert({
          user_id: userId,
          profile_data: profile,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving digital twin profile:', error);
    }
  }

  async generatePersonalizedInsights(userId: string): Promise<{
    productivity_score: number;
    improvement_areas: string[];
    strengths: string[];
    recommendations: string[];
    next_level_actions: string[];
  }> {
    const profile = await this.getProfile(userId);
    
    // Calculate productivity score
    const appUsageScore = Object.values(profile.behavioral_patterns.app_preferences).reduce((sum, score) => sum + Math.max(0, score), 0) / 10;
    const moodStabilityScore = profile.emotional_intelligence.stress_level < 0.5 ? 0.8 : 0.4;
    const goalProgressScore = profile.goals_evolution.short_term.reduce((sum, goal) => sum + goal.progress, 0) / Math.max(1, profile.goals_evolution.short_term.length);
    
    const productivity_score = Math.round((appUsageScore + moodStabilityScore + goalProgressScore) / 3 * 100);

    // Identify improvement areas
    const improvement_areas: string[] = [];
    if (profile.emotional_intelligence.stress_level > 0.6) improvement_areas.push('Gestion du stress');
    if (profile.behavioral_patterns.peak_hours.length < 2) improvement_areas.push('Identification des heures optimales');
    if (Object.keys(profile.skills_map.technical_skills).length < 3) improvement_areas.push('Développement des compétences techniques');

    // Identify strengths
    const strengths: string[] = [];
    if (profile.emotional_intelligence.stress_level < 0.4) strengths.push('Excellente gestion du stress');
    if (Object.keys(profile.behavioral_patterns.app_preferences).length > 5) strengths.push('Maîtrise d\'un écosystème varié');
    if (profile.goals_evolution.short_term.some(g => g.progress > 0.7)) strengths.push('Excellent suivi des objectifs');

    return {
      productivity_score,
      improvement_areas,
      strengths,
      recommendations: [
        'Exploitez vos heures de productivité optimale',
        'Continuez à diversifier vos compétences',
        'Maintenez un équilibre stress/performance'
      ],
      next_level_actions: [
        'Automatiser les tâches répétitives',
        'Développer une expertise dans un domaine spécifique',
        'Mentorer d\'autres utilisateurs LuvviX'
      ]
    };
  }
}

export const digitalTwin = LuvviXDigitalTwin.getInstance();
