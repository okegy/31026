import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { demoEvents } from '@/lib/demoData';
import { format, startOfWeek, addDays } from 'date-fns';

export default function CalendarPage() {
  const weekStart = startOfWeek(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <DashboardLayout title="Calendar" subtitle="Your schedule at a glance">
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const dayEvents = demoEvents.filter(e => 
              format(new Date(e.start_time), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
            );
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            
            return (
              <Card key={day.toISOString()} className={`min-h-[200px] ${isToday ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-3">
                  <div className={`text-sm font-medium mb-2 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                    {format(day, 'EEE d')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <div key={event.id} className="p-2 rounded bg-primary/10 text-xs">
                        <p className="font-medium truncate">{event.title}</p>
                        <p className="text-muted-foreground">{format(new Date(event.start_time), 'h:mm a')}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
