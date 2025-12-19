import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VoiceInputSimple } from '@/components/VoiceInputSimple';
import { useEvents, Event } from '@/hooks/use-events';
import { parseEventFromInput } from '@/lib/eventParser';
import { EventDialog } from '@/components/calendar/EventDialog';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { Sparkles, Send, Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users, Loader2 } from 'lucide-react';
import { sendEventConfirmationEmail } from '@/lib/gmail';
import { isGoogleAuthenticated, initiateGoogleLogin } from '@/lib/googleAuth';
import { useAuth } from '@/contexts/AuthContext';

export default function CalendarPage() {
  const [input, setInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  const { events, isLoading, createEvent, updateEvent, deleteEvent, checkConflicts } = useEvents();
  const { toast } = useToast();
  const { user } = useAuth();

  const today = new Date();
  const weekStart = startOfWeek(viewMode === 'week' ? today : currentMonth);
  const days = viewMode === 'week' 
    ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    : eachDayOfInterval({ 
        start: startOfWeek(startOfMonth(currentMonth)), 
        end: addDays(startOfWeek(startOfMonth(currentMonth)), 34)
      }); // 5 weeks (35 days)
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleAddEvent = async () => {
    if (!input.trim()) {
      toast({
        title: "Empty event",
        description: "Please enter event details",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      let parsedEvent = parseEventFromInput(input);
      
      // Check for conflicts
      let conflicts = checkConflicts(parsedEvent.start_time, parsedEvent.end_time);
      
      // If there are conflicts, try to find the next available slot
      if (conflicts.length > 0) {
        const startTime = new Date(parsedEvent.start_time);
        const endTime = new Date(parsedEvent.end_time);
        const duration = endTime.getTime() - startTime.getTime();
        
        // Try to find next available slot within the same day
        let newStartTime = new Date(endTime);
        let attempts = 0;
        const maxAttempts = 24; // Try for 24 hours
        
        while (attempts < maxAttempts) {
          const newEndTime = new Date(newStartTime.getTime() + duration);
          const newConflicts = checkConflicts(newStartTime.toISOString(), newEndTime.toISOString());
          
          if (newConflicts.length === 0) {
            // Found a free slot
            parsedEvent = {
              ...parsedEvent,
              start_time: newStartTime.toISOString(),
              end_time: newEndTime.toISOString(),
            };
            
            toast({
              title: "Conflict detected!",
              description: `Automatically rescheduled to ${format(newStartTime, 'MMM d, h:mm a')} to avoid conflicts`,
              variant: "default",
            });
            
            break;
          }
          
          // Move to next hour
          newStartTime = new Date(newStartTime.getTime() + 60 * 60 * 1000);
          attempts++;
        }
        
        // If still conflicts after trying, warn user but create anyway
        if (attempts >= maxAttempts) {
          toast({
            title: "Warning: Scheduling conflict",
            description: `Could not find a free slot. Event created with ${conflicts.length} conflict(s).`,
            variant: "destructive",
          });
        }
      }
      
      const { data, error } = await createEvent(parsedEvent);

      if (error) {
        throw error;
      }

      toast({
        title: "✓ Event created!",
        description: `${parsedEvent.title} scheduled for ${format(new Date(parsedEvent.start_time), 'MMM d, h:mm a')}`,
      });

      // Try to send confirmation email if Google is connected
      try {
        if (isGoogleAuthenticated() && user?.email) {
          await sendEventConfirmationEmail(
            user.email,
            parsedEvent.title,
            parsedEvent.start_time,
            parsedEvent.end_time,
            parsedEvent.location,
            parsedEvent.attendees
          );
        }
      } catch (e) {
        console.log('Email not sent (not authenticated or API error)');
      }

      setInput('');
    } catch (error: any) {
      toast({
        title: "Failed to create event",
        description: error.message || "An error occurred while creating the event",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddEvent();
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setDialogOpen(true);
  };

  const handleSaveEvent = async (eventData: any) => {
    if (selectedEvent) {
      const { error } = await updateEvent(selectedEvent.id, eventData);
      if (error) {
        toast({
          title: "Failed to update event",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Event updated!",
          description: "Your event has been updated successfully",
        });

        // Optional: send an updated confirmation email
        try {
          if (isGoogleAuthenticated() && user?.email) {
            await sendEventConfirmationEmail(
              user.email,
              eventData.title ?? selectedEvent.title,
              eventData.start_time ?? selectedEvent.start_time,
              eventData.end_time ?? selectedEvent.end_time,
              eventData.location ?? selectedEvent.location,
              eventData.attendees ?? selectedEvent.attendees
            );
          }
        } catch (e) {
          console.log('Update email not sent');
        }
      }
    } else {
      const conflicts = checkConflicts(eventData.start_time, eventData.end_time);
      const { error } = await createEvent(eventData);
      if (error) {
        toast({
          title: "Failed to create event",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Event created!",
          description: conflicts.length > 0 
            ? `Event created with ${conflicts.length} conflict(s)`
            : "Event added to your calendar",
          variant: conflicts.length > 0 ? "destructive" : "default",
        });

        // Send confirmation for manual creation
        try {
          if (isGoogleAuthenticated() && user?.email) {
            await sendEventConfirmationEmail(
              user.email,
              eventData.title,
              eventData.start_time,
              eventData.end_time,
              eventData.location,
              eventData.attendees
            );
          }
        } catch (e) {
          console.log('Email not sent');
        }
      }
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const { error } = await deleteEvent(eventId);
    if (error) {
      toast({
        title: "Failed to delete event",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Event deleted",
        description: "Event has been removed from your calendar",
      });
    }
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(e => 
      isSameDay(new Date(e.start_time), day)
    );
  };

  const getConflictsForEvent = (event: Event) => {
    return checkConflicts(event.start_time, event.end_time, event.id);
  };

  return (
    <DashboardLayout title="Calendar" subtitle="Your schedule at a glance">
      <div className="space-y-6 animate-fade-in">
        {!isGoogleAuthenticated() && (
          <Card className="border-yellow-300/40 bg-yellow-50 dark:bg-yellow-950">
            <CardContent className="py-3 flex items-center justify-between gap-3">
              <div className="text-sm text-yellow-900 dark:text-yellow-100">
                Connect Google to receive email confirmations and add events to Google Calendar.
              </div>
              <Button size="sm" variant="outline" onClick={initiateGoogleLogin}>
                Connect Google
              </Button>
            </CardContent>
          </Card>
        )}
        {/* AI Input */}
        <Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="relative flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                  <Input
                    placeholder="Schedule a meeting with John tomorrow at 2pm..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 text-base bg-white dark:bg-gray-800 border-primary/30"
                    disabled={isCreating}
                  />
                </div>
                <VoiceInputSimple
                  onTranscript={(text) => setInput(text)}
                  className="h-12 w-12"
                />
              </div>
              <Button 
                size="lg" 
                className="h-12" 
                onClick={handleAddEvent}
                disabled={isCreating || !input.trim()}
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Add Event
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-12"
                onClick={() => {
                  setSelectedEvent(null);
                  setSelectedDate(new Date());
                  setDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Manual
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Try: "Meeting with Sarah tomorrow at 3pm" or "Team standup every Monday at 9am"
            </p>
          </CardContent>
        </Card>

        {/* View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('week')}
              className={viewMode === 'week' ? 'bg-primary/10 border-primary' : ''}
            >
              Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('month')}
              className={viewMode === 'month' ? 'bg-primary/10 border-primary' : ''}
            >
              Month
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (viewMode === 'week') {
                  setCurrentMonth(addDays(currentMonth, -7));
                } else {
                  setCurrentMonth(subMonths(currentMonth, 1));
                }
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[150px] text-center">
              {viewMode === 'week' 
                ? `${format(weekStart, 'MMM d')} - ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`
                : format(currentMonth, 'MMMM yyyy')
              }
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (viewMode === 'week') {
                  setCurrentMonth(addDays(currentMonth, 7));
                } else {
                  setCurrentMonth(addMonths(currentMonth, 1));
                }
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading calendar...</span>
            </CardContent>
          </Card>
        ) : (
          <div>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              
              return (
                <Card 
                  key={day.toISOString()} 
                  className={`min-h-[${viewMode === 'month' ? '120px' : '200px'}] transition-all hover:shadow-md cursor-pointer ${
                    isToday ? 'ring-2 ring-primary' : ''
                  } ${
                    !isCurrentMonth && viewMode === 'month' ? 'opacity-40' : ''
                  }`}
                  onClick={() => handleDateClick(day)}
                >
                  <CardContent className="p-3">
                    <div className={`text-sm font-medium mb-2 flex items-center justify-between ${
                      isToday ? 'text-primary' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      <span>{format(day, viewMode === 'month' ? 'd' : 'EEE d')}</span>
                      {isToday && <Badge variant="default" className="text-xs">Today</Badge>}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.length === 0 ? (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          No events
                        </div>
                      ) : (
                        dayEvents.map(event => {
                          const conflicts = getConflictsForEvent(event);
                          return (
                            <div 
                              key={event.id} 
                              className={`p-2 rounded text-xs cursor-pointer transition-all hover:scale-105 ${
                                conflicts.length > 0 
                                  ? 'bg-destructive/20 border border-destructive/30' 
                                  : 'bg-primary/10 hover:bg-primary/20'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <p className="font-medium truncate flex-1">{event.title}</p>
                                {conflicts.length > 0 && (
                                  <Badge variant="destructive" className="text-[10px] px-1 py-0">
                                    !
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                                <Clock className="w-3 h-3" />
                                <span>{format(new Date(event.start_time), 'h:mm a')}</span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                                  <MapPin className="w-3 h-3" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              )}
                              {event.attendees && event.attendees.length > 0 && (
                                <div className="flex items-center gap-1 text-muted-foreground mt-1">
                                  <Users className="w-3 h-3" />
                                  <span>{event.attendees.length}</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            </div>
          </div>
        )}

        {/* Event Dialog */}
        <EventDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          event={selectedEvent}
          defaultStartTime={selectedDate?.toISOString()}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          conflicts={selectedEvent ? getConflictsForEvent(selectedEvent) : []}
        />
      </div>
    </DashboardLayout>
  );
}
