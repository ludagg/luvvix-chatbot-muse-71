
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class BrainActions {
  static async execute(userId: string, action: any) {
    switch(action.type) {
      case 'calendar':
        return await BrainActions.createEvent(userId, action.data);
      case 'notification':
        toast.info(action.data.message || "Notification IA"); // Simple toast
        return true;
      case 'recommendation':
        toast.success(action.data.suggestion || "Recommandation IA");
        return true;
      default:
        toast("Action IA détectée : " + action.type);
        return false;
    }
  }

  static async createEvent(userId: string, eventData: any) {
    try {
      // Créer événement dans calendar_events
      await supabase.from('calendar_events').insert({
        user_id: userId,
        title: eventData.title,
        description: eventData.description || null,
        start_date: eventData.start_time,
        end_date: eventData.end_time,
        event_type: eventData.event_type || 'event',
        priority: eventData.priority || 'medium'
      });
      toast.success("Événement créé : " + eventData.title);
      return true;
    } catch (error: any) {
      toast.error("Erreur création événement");
      return false;
    }
  }
}
