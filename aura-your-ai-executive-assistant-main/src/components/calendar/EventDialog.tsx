import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Trash2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Event } from '@/hooks/use-events';

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
  defaultStartTime?: string;
  onSave: (eventData: any) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
  conflicts?: Event[];
}

export function EventDialog({
  open,
  onOpenChange,
  event,
  defaultStartTime,
  onSave,
  onDelete,
  conflicts = [],
}: EventDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [attendeesInput, setAttendeesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setStartTime(format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm"));
      setEndTime(format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm"));
      setLocation(event.location || '');
      setAttendeesInput(event.attendees?.join(', ') || '');
    } else if (defaultStartTime) {
      const start = new Date(defaultStartTime);
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      setStartTime(format(start, "yyyy-MM-dd'T'HH:mm"));
      setEndTime(format(end, "yyyy-MM-dd'T'HH:mm"));
    } else {
      resetForm();
    }
  }, [event, defaultStartTime, open]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setAttendeesInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startTime || !endTime) return;

    setIsSubmitting(true);
    try {
      const attendees = attendeesInput
        .split(',')
        .map(a => a.trim())
        .filter(Boolean);

      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        location: location.trim() || undefined,
        attendees: attendees.length > 0 ? attendees : undefined,
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!event || !onDelete) return;
    
    if (confirm('Are you sure you want to delete this event?')) {
      setIsSubmitting(true);
      try {
        await onDelete(event.id);
        onOpenChange(false);
        resetForm();
      } catch (error) {
        console.error('Error deleting event:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create Event'}</DialogTitle>
          <DialogDescription>
            {event ? 'Update your event details' : 'Add a new event to your calendar'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {conflicts.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">Scheduling Conflict</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This event overlaps with {conflicts.length} existing event{conflicts.length > 1 ? 's' : ''}:
                  </p>
                  <div className="mt-2 space-y-1">
                    {conflicts.map(conflict => (
                      <div key={conflict.id} className="text-xs">
                        • {conflict.title} ({format(new Date(conflict.start_time), 'h:mm a')} - {format(new Date(conflict.end_time), 'h:mm a')})
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="Team meeting, Client call, etc."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </Label>
            <Input
              id="location"
              placeholder="Office, Zoom, Google Meet, etc."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees">
              <Users className="w-4 h-4 inline mr-1" />
              Attendees
            </Label>
            <Input
              id="attendees"
              placeholder="john@example.com, sarah@example.com"
              value={attendeesInput}
              onChange={(e) => setAttendeesInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Separate multiple attendees with commas</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add event details, agenda, notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            {event && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="mr-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim() || !startTime || !endTime}>
              {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
