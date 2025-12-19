import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { demoEvents } from '@/lib/demoData';

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  attendees: string[] | null;
  location: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export function useEvents() {
  const { user, isDemoMode } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isDemoMode) {
      setEvents(demoEvents as any);
      setIsLoading(false);
      return;
    }

    if (!user) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    fetchEvents();

    const channel = supabase
      .channel('events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isDemoMode]);

  const fetchEvents = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (eventData: {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    attendees?: string[];
    location?: string;
  }) => {
    if (isDemoMode) {
      throw new Error('Cannot create events in demo mode. Please sign in to save events.');
    }

    if (!user) {
      throw new Error('You must be signed in to create events');
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          title: eventData.title,
          description: eventData.description || null,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          attendees: eventData.attendees || null,
          location: eventData.location || null,
          is_demo: false,
        })
        .select()
        .single();

      if (error) throw error;

      await logEventAction('event_created', data.id, `Created event: ${eventData.title}`);

      return { data, error: null };
    } catch (err) {
      console.error('Error creating event:', err);
      return { data: null, error: err as Error };
    }
  };

  const updateEvent = async (
    eventId: string,
    updates: Partial<Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    if (isDemoMode) {
      throw new Error('Cannot update events in demo mode');
    }

    if (!user) {
      throw new Error('You must be signed in to update events');
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      console.error('Error updating event:', err);
      return { data: null, error: err as Error };
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (isDemoMode) {
      throw new Error('Cannot delete events in demo mode');
    }

    if (!user) {
      throw new Error('You must be signed in to delete events');
    }

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('Error deleting event:', err);
      return { error: err as Error };
    }
  };

  const checkConflicts = (startTime: string, endTime: string, excludeEventId?: string) => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    return events.filter(event => {
      if (excludeEventId && event.id === excludeEventId) return false;
      
      const eventStart = new Date(event.start_time).getTime();
      const eventEnd = new Date(event.end_time).getTime();

      return (start < eventEnd && end > eventStart);
    });
  };

  const logEventAction = async (actionType: string, eventId: string, description: string) => {
    if (!user) return;

    try {
      await supabase.from('agent_logs').insert({
        user_id: user.id,
        action_type: actionType as any,
        description,
        related_event_id: eventId,
        is_demo: false,
      });
    } catch (err) {
      console.error('Error logging event action:', err);
    }
  };

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    checkConflicts,
    refetch: fetchEvents,
  };
}
