
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
  event_type: string;
  location?: string;
  attendees: any[];
  color: string;
  priority: string;
  completed: boolean;
}

export const useCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('luvvix-calendar-api', {
        method: 'GET',
        body: new URLSearchParams({ action: 'get_events' })
      });

      if (data?.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (eventData: Partial<CalendarEvent>) => {
    if (!user) return false;

    try {
      const { data } = await supabase.functions.invoke('luvvix-calendar-api', {
        method: 'POST',
        body: JSON.stringify({
          action: 'create_event',
          ...eventData
        })
      });

      if (data?.success) {
        await fetchEvents();
        toast({
          title: "Événement créé",
          description: "L'événement a été ajouté à votre calendrier",
        });
        return true;
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'événement",
        variant: "destructive"
      });
    }
    return false;
  };

  const updateEvent = async (id: string, eventData: Partial<CalendarEvent>) => {
    if (!user) return false;

    try {
      const { data } = await supabase.functions.invoke('luvvix-calendar-api', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_event',
          id,
          ...eventData
        })
      });

      if (data?.success) {
        await fetchEvents();
        toast({
          title: "Événement modifié",
          description: "L'événement a été mis à jour",
        });
        return true;
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'événement",
        variant: "destructive"
      });
    }
    return false;
  };

  const deleteEvent = async (id: string) => {
    if (!user) return false;

    try {
      const { data } = await supabase.functions.invoke('luvvix-calendar-api', {
        method: 'DELETE',
        body: new URLSearchParams({ action: 'delete_event', id })
      });

      if (data?.success) {
        await fetchEvents();
        toast({
          title: "Événement supprimé",
          description: "L'événement a été retiré de votre calendrier",
        });
        return true;
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'événement",
        variant: "destructive"
      });
    }
    return false;
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
    refreshEvents: fetchEvents
  };
};
