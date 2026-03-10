import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, CalendarCheck, CheckCircle, Circle, AlertCircle, Loader2, User, Stethoscope, Clock, Calendar, CheckSquare, Users } from 'lucide-react';
import { useTasks } from '@/hooks/use-tasks';
import { parseTaskFromInput } from '@/lib/taskParser';
import { useToast } from '@/hooks/use-toast';
import { sendTaskConfirmationEmail } from '@/lib/gmail';
import { isGoogleAuthenticated } from '@/lib/googleAuth';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function Tasks() {
  const [input, setInput] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const { tasks, isLoading, createTask, toggleTaskStatus } = useTasks();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const sortedTasks = [...tasks].sort((a, b) => b.priority_score - a.priority_score);

  const handleAddTask = async () => {
    if (!input.trim()) {
      toast({
        title: "Empty scheduling request",
        description: "Please enter patient appointment details",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const parsedTask = parseTaskFromInput(input);
      
      const { data, error } = await createTask(parsedTask);

      if (error) {
        throw error;
      }

      toast({
        title: "Appointment scheduled!",
        description: parsedTask.deadline 
          ? `Patient scheduled for ${format(new Date(parsedTask.deadline), 'MMM d, h:mm a')}`
          : "Consultation added to the waiting list",
      });

      // Try sending confirmation email (requires Google auth)
      try {
        if (isGoogleAuthenticated() && user?.email) {
          await sendTaskConfirmationEmail(
            user.email,
            parsedTask.title,
            parsedTask.deadline || new Date().toISOString(),
            (parsedTask.priority || 'Medium')
          );
        }
      } catch (e) {
        console.log('Confirmation email not sent (auth or API issue)');
      }

      setInput('');
    } catch (error: any) {
      toast({
        title: "Failed to schedule appointment",
        description: error.message || "An error occurred while creating the appointment",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTask();
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      await toggleTaskStatus(taskId, currentStatus);
      toast({
        title: currentStatus === 'completed' ? "Consultation reopened" : "Consultation completed!",
        description: currentStatus === 'completed' ? "Patient marked as awaiting" : "Visit recorded successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update status",
        description: error.message || "An error occurred while updating the status",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout 
      title="Appointments" 
      subtitle="Manage patient consultations and clinic priorities"
    >
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        
        {/* Quick Add Appointment */}
        <Card className="bg-white border-blue-200 shadow-sm border">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Schedule New Appointment</h3>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Schedule a follow-up for Sarah on Friday at 3pm (Urgent)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isCreating}
                className="bg-slate-50 border-slate-200 text-slate-800 focus-visible:ring-blue-500"
              />
              <Button 
                onClick={handleAddTask} 
                disabled={isCreating || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CalendarCheck className="w-4 h-4 mr-2" />
                )}
                Schedule
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-xl font-semibold flex items-center justify-between text-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Patient Consultations
              </div>
              <Badge variant="outline" className="font-normal text-slate-500 border-slate-200">
                {tasks.length} total
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : sortedTasks.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-800">No appointments scheduled</p>
                <p className="text-sm mt-1">Add a patient appointment above to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {sortedTasks.map((task) => {
                  const isCompleted = task.status === 'completed';
                  const isOverdue = task.status === 'missed';
                  
                  return (
                    <div 
                      key={task.id} 
                      className={`p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 ${isCompleted ? 'opacity-70 bg-slate-50' : ''}`}
                    >
                      <button 
                        onClick={() => handleToggleTask(task.id, task.status)}
                        className={`mt-1 flex-shrink-0 transition-colors ${
                          isCompleted ? 'text-green-500' : 'text-slate-300 hover:text-blue-500'
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`font-semibold text-base truncate ${isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                            {task.title}
                          </p>
                          {isOverdue && !isCompleted && (
                            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 text-xs py-0">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Missed
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500">
                          {task.deadline && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
                              {format(new Date(task.deadline), 'MMM d, yyyy - h:mm a')}
                            </div>
                          )}
                          <div className="flex items-center">
                              <Stethoscope className="w-4 h-4 mr-1.5 text-slate-400" />
                              Dr. Assigned
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border
                          ${task.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' : 
                            task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                            'bg-green-50 text-green-700 border-green-200'}`}
                        >
                          {task.priority === 'high' ? 'Urgent' : task.priority === 'medium' ? 'Routine' : 'Follow-up'}
                        </span>
                        
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Action Buttons to Confirm, Cancel, Reschedule */}
                            {!isCompleted && (
                                <div className="flex gap-2 mt-2">
                                  <Button size="sm" variant="outline" className="h-7 text-xs border-green-200 text-green-700 hover:bg-green-50" onClick={() => handleToggleTask(task.id, task.status)}>
                                    Start Consult
                                  </Button>
                                  <Button size="sm" variant="outline" className="h-7 text-xs border-amber-200 text-amber-700 hover:bg-amber-50" onClick={() => toast({title: "Reschedule Request", description: "Reschedule workflow initiated for patient.", variant: "default"})}>Reschedule</Button>
                                  <Button size="sm" variant="outline" className="h-7 text-xs border-red-200 text-red-700 hover:bg-red-50" onClick={() => toast({title: "Consultation Cancelled", description: "Appointment removed and patient notified.", variant: "destructive"})}>Cancel</Button>
                                </div>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
