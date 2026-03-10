import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VoiceInputSimple } from '@/components/VoiceInputSimple';
import { useEvents, Event } from '@/hooks/use-events';
import { parseEventFromInput } from '@/lib/eventParser';
import { useToast } from '@/hooks/use-toast';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { Sparkles, Calendar as CalendarIcon, Clock, MapPin, Users, Loader2, Stethoscope, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function CalendarPage() {
  const [input, setInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  const { events, isLoading, createEvent, checkConflicts } = useEvents();
  const { toast } = useToast();
  
  const today = new Date();
  const weekStart = startOfWeek(viewMode === 'week' ? today : currentMonth);
  const days = viewMode === 'week' 
    ? Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    : eachDayOfInterval({ 
        start: startOfWeek(startOfMonth(currentMonth)), 
        end: addDays(startOfWeek(startOfMonth(currentMonth)), 34)
      });
  
  const handleAddEvent = async () => {
    if (!input.trim()) {
      toast({
        title: "Empty request",
        description: "Please enter consultation details",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      let parsedEvent = parseEventFromInput(input);
      let conflicts = checkConflicts(parsedEvent.start_time, parsedEvent.end_time);
      
      if (conflicts.length > 0) {
         // simplified logic for UI context
      }

      const { data, error } = await createEvent(parsedEvent);
      if (error) throw error;

      toast({
        title: "Consultation Booked!",
        description: `Scheduled for ${format(new Date(parsedEvent.start_time), 'MMM d, h:mm a')}`,
      });
      setInput('');
    } catch (error: any) {
      toast({
        title: "Failed to book",
        description: error.message || "An error occurred",
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

  return (
    <DashboardLayout 
      title="Medical Calendar" 
      subtitle="Clinic Schedule & Doctor Availability"
    >
      <div className="space-y-6 max-w-6xl mx-auto animate-fade-in relative z-10">
        
        {/* Magic Scheduling Input */}
        <Card className="bg-white border-blue-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">Smart Scheduling</h3>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="e.g. Book Dr. Smith for a consultation with John tomorrow at 2pm"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isCreating}
                  className="pr-12 bg-slate-50 border-slate-200 focus-visible:ring-blue-500 text-slate-800"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <VoiceInputSimple onTranscript={setInput} />
                </div>
              </div>
              <Button 
                onClick={handleAddEvent} 
                disabled={isCreating || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CalendarIcon className="w-4 h-4 mr-2" />
                )}
                Book
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">
              {format(viewMode === 'week' ? today : currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8 text-slate-500 border-slate-200" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 text-slate-500 border-slate-200" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'week' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'month' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 bg-white relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}
            
            {days.map((day, idx) => {
              const dayEvents = events.filter(e => isSameDay(new Date(e.start_time), day));
              const isToday = isSameDay(day, today);
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={`min-h-[140px] border-r border-b border-slate-100 p-2 transition-colors hover:bg-slate-50 ${!isSameDay(day, currentMonth) && viewMode === 'month' ? 'bg-slate-50/50 opacity-50' : ''}`}
                >
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full mb-2 ${isToday ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-700 font-medium'}`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[100px] pr-1 scrollbar-hide">
                    {dayEvents.map((event, i) => (
                      <div 
                        key={event.id}
                        className={`text-xs p-1.5 rounded border-l-2 truncate cursor-pointer transition-colors ${i % 2 === 0 ? 'bg-blue-50 border-blue-500 text-blue-800 hover:bg-blue-100' : 'bg-green-50 border-green-500 text-green-800 hover:bg-green-100'}`}
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        <div className="text-[10px] opacity-80 flex items-center justify-between">
                          <span>{format(new Date(event.start_time), 'h:mm a')}</span>
                          <span className="flex items-center"><Stethoscope className="w-2.5 h-2.5 mr-0.5"/> Dr.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
