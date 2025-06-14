
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type: 'meeting' | 'task' | 'reminder' | 'personal';
  priority: 'low' | 'medium' | 'high';
  location?: string;
  attendees?: string[];
  color: string;
  completed: boolean;
  user_id: string;
}

export const useCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('luvvix-calendar-api', {
        body: { action: 'getEvents' }
      });

      if (error) throw error;
      setEvents(data?.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les événements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Omit<CalendarEvent, 'id' | 'user_id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('luvvix-calendar-api', {
        body: { 
          action: 'createEvent',
          eventData
        }
      });

      if (error) throw error;
      
      await fetchEvents();
      toast({
        title: "Événement créé",
        description: "L'événement a été ajouté à votre calendrier",
      });
      
      return data?.event;
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'événement",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.functions.invoke('luvvix-calendar-api', {
        body: { 
          action: 'updateEvent',
          eventId,
          updates
        }
      });

      if (error) throw error;
      
      await fetchEvents();
      toast({
        title: "Événement modifié",
        description: "L'événement a été mis à jour",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'événement",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.functions.invoke('luvvix-calendar-api', {
        body: { 
          action: 'deleteEvent',
          eventId
        }
      });

      if (error) throw error;
      
      await fetchEvents();
      toast({
        title: "Événement supprimé",
        description: "L'événement a été supprimé",
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
};
