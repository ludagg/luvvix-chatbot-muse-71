
import { supabase } from '@/integrations/supabase/client';

export class BrainLearning {
  static async learnFromInteraction(userId: string, event: any, knowledge: any) {
    // Met à jour les patterns temporels
    const hour = new Date(event.timestamp).getHours();
    const day = new Date(event.timestamp).getDay();

    // Pattern d’app usage
    if (!knowledge.behavioral_patterns.app_usage) {
      knowledge.behavioral_patterns.app_usage = {};
    }
    knowledge.behavioral_patterns.app_usage[event.app_context] = 
      (knowledge.behavioral_patterns.app_usage[event.app_context] || 0) + 1;

    // Pattern temporel
    if (!knowledge.behavioral_patterns.time_preferences) {
      knowledge.behavioral_patterns.time_preferences = {};
    }
    const timeSlot = BrainLearning.getTimeSlot(hour);
    knowledge.behavioral_patterns.time_preferences[timeSlot] = 
      (knowledge.behavioral_patterns.time_preferences[timeSlot] || 0) + 1;

    // Sauvegarde
    await supabase
      .from('user_brain_knowledge')
      .update({ behavioral_patterns: knowledge.behavioral_patterns, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    return knowledge.behavioral_patterns;
  }

  static getTimeSlot(hour: number) {
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }
}
