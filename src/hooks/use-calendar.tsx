
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  event_type: 'meeting' | 'task' | 'reminder' | 'personal';
  priority: 'low' | 'medium' | 'high';
  location?: string;
  attendees?: string[];
  color: string;
  completed: boolean;
  user_id: string;
  isHoliday?: boolean;
  recurrence?: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
  reminders?: {
    minutes: number;
    type: 'popup' | 'email';
  }[];
}

export const useCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchEvents = async (startDate?: Date, endDate?: Date) => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_date', { ascending: true });

      if (startDate && endDate) {
        query = query
          .gte('start_date', startDate.toISOString())
          .lte('start_date', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Transformer les données pour correspondre à l'interface
      const transformedEvents = (data || []).map(event => ({
        ...event,
        color: event.color || getEventColor(event.event_type),
        attendees: event.attendees || [],
        completed: event.completed || false
      }));

      setEvents(transformedEvents);
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
      const newEvent = {
        ...eventData,
        user_id: user.id,
        color: eventData.color || getEventColor(eventData.event_type),
        start_date: eventData.start_time.split('T')[0],
        end_date: eventData.end_time ? eventData.end_time.split('T')[0] : eventData.start_time.split('T')[0]
      };

      const { data, error } = await supabase
        .from('calendar_events')
        .insert([newEvent])
        .select()
        .single();

      if (error) throw error;
      
      await fetchEvents();
      toast({
        title: "Événement créé",
        description: "L'événement a été ajouté à votre calendrier",
      });
      
      return data;
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
      const updateData = { ...updates };
      
      // Mettre à jour start_date et end_date si les heures sont modifiées
      if (updates.start_time) {
        updateData.start_date = updates.start_time.split('T')[0];
      }
      if (updates.end_time) {
        updateData.end_date = updates.end_time.split('T')[0];
      }

      const { error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', eventId)
        .eq('user_id', user.id);

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
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

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

  const markTaskComplete = async (eventId: string, completed: boolean) => {
    return await updateEvent(eventId, { completed });
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => 
      event.start_date === dateStr || 
      (event.end_date && event.start_date <= dateStr && event.end_date >= dateStr)
    );
  };

  const getUpcomingEvents = (days: number = 7) => {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate >= now && eventDate <= future;
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  const searchEvents = (query: string) => {
    const searchTerm = query.toLowerCase();
    return events.filter(event => 
      event.title.toLowerCase().includes(searchTerm) ||
      event.description?.toLowerCase().includes(searchTerm) ||
      event.location?.toLowerCase().includes(searchTerm)
    );
  };

  const getEventsByType = (type: CalendarEvent['event_type']) => {
    return events.filter(event => event.event_type === type);
  };

  const getOverdueTasks = () => {
    const now = new Date();
    return events.filter(event => 
      event.event_type === 'task' && 
      !event.completed &&
      new Date(event.end_time) < now
    );
  };

  const getEventColor = (type: CalendarEvent['event_type']) => {
    const colors = {
      meeting: '#3b82f6',
      task: '#10b981',
      reminder: '#f59e0b',
      personal: '#8b5cf6'
    };
    return colors[type];
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
    markTaskComplete,
    getEventsForDate,
    getUpcomingEvents,
    searchEvents,
    getEventsByType,
    getOverdueTasks,
    refetch: fetchEvents,
    fetchEventsInRange: fetchEvents
  };
};
