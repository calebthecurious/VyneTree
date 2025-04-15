import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarEvent, InsertCalendarEvent, Rsvp, InsertRsvp } from '@shared/schema';
import { calendarApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

interface UseCalendarProps {
  userId: number;
}

interface UseCalendarReturn {
  events: CalendarEvent[] | undefined;
  currentWeekEvents: CalendarEvent[] | undefined;
  isLoading: boolean;
  error: unknown;
  createEvent: (event: InsertCalendarEvent) => void;
  deleteEvent: (eventId: number) => void;
  createRsvp: (rsvp: InsertRsvp) => void;
  isCreating: boolean;
  isDeleting: boolean;
  selectedEvent: CalendarEvent | null;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  currentWeekStart: Date;
  setCurrentWeekStart: (date: Date) => void;
  availableSlots: { day: string; time: string }[];
}

export default function useCalendar({ userId }: UseCalendarProps): UseCalendarReturn {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  
  // Pre-defined available slots for the demo
  const availableSlots = [
    { day: 'Tue', time: '2:00 PM' },
    { day: 'Tue', time: '4:00 PM' },
    { day: 'Thu', time: '10:00 AM' },
    { day: 'Thu', time: '3:00 PM' },
    { day: 'Fri', time: '11:00 AM' },
  ];
  
  // Fetch all calendar events
  const { data: events, isLoading, error } = useQuery<CalendarEvent[]>({
    queryKey: [`/api/users/${userId}/events`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Filter events for the current week
  const currentWeekEvents = events?.filter(event => {
    const eventDate = new Date(event.startTime);
    const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
    
    return isWithinInterval(eventDate, {
      start: currentWeekStart,
      end: weekEnd
    });
  });
  
  // Create a new calendar event
  const createEventMutation = useMutation({
    mutationFn: (event: InsertCalendarEvent) => calendarApi.createEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/events`] });
      toast({
        title: "Event created",
        description: "The calendar event has been successfully created."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Create an RSVP for an event
  const createRsvpMutation = useMutation({
    mutationFn: (rsvp: InsertRsvp) => calendarApi.createRsvp(rsvp),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${variables.eventId}/rsvps`] });
      toast({
        title: "RSVP confirmed",
        description: "Your RSVP has been successfully recorded."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create RSVP. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Mock delete event (not implemented in the API)
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      // This is a mock since deleteEvent isn't implemented in the API
      // You would call a real API endpoint here
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/events`] });
      toast({
        title: "Event deleted",
        description: "The calendar event has been successfully deleted."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  return {
    events,
    currentWeekEvents,
    isLoading,
    error,
    createEvent: (event: InsertCalendarEvent) => createEventMutation.mutate(event),
    deleteEvent: (eventId: number) => deleteEventMutation.mutate(eventId),
    createRsvp: (rsvp: InsertRsvp) => createRsvpMutation.mutate(rsvp),
    isCreating: createEventMutation.isPending || createRsvpMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
    selectedEvent,
    setSelectedEvent,
    currentWeekStart,
    setCurrentWeekStart,
    availableSlots
  };
}
