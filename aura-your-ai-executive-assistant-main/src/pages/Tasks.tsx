import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, CheckCircle, Circle, AlertCircle, Loader2 } from 'lucide-react';
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
    console.log('Add Task button clicked!', { input, isCreating });
    
    if (!input.trim()) {
      console.log('Input is empty');
      toast({
        title: "Empty task",
        description: "Please enter a task description",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      console.log('Parsing task input:', input);
      const parsedTask = parseTaskFromInput(input);
      console.log('Parsed task:', parsedTask);
      
      const { data, error } = await createTask(parsedTask);
      console.log('Create task result:', { data, error });

      if (error) {
        throw error;
      }

      console.log('Task created successfully!');
      toast({
        title: "Task created!",
        description: parsedTask.deadline 
          ? `Task scheduled for ${format(new Date(parsedTask.deadline), 'MMM d, h:mm a')}`
          : "Task added to your list",
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
        console.log('Task confirmation email not sent (auth or API issue)');
      }

      setInput('');
    } catch (error: any) {
      toast({
        title: "Failed to create task",
        description: error.message || "An error occurred while creating the task",
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
        title: currentStatus === 'completed' ? "Task reopened" : "Task completed!",
        description: currentStatus === 'completed' ? "Task marked as pending" : "Great job!",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout title="Tasks" subtitle="Manage your tasks with AI assistance">
      <div className="space-y-6 animate-fade-in">
        {/* AI Input */}
        <Card className="ai-border ai-glow">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <Input
                  placeholder="Tell AURA what you need to do..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 text-base"
                  disabled={isCreating}
                />
              </div>
              <Button 
                size="lg" 
                className="h-12" 
                onClick={handleAddTask}
                disabled={isCreating || !input.trim()}
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Add Task
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Try: "Remind me to submit my report by Friday" or "Schedule a call with John next week"
            </p>
          </CardContent>
        </Card>

        {/* Tasks List */}
        <div className="space-y-3">
          {isLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading tasks...</span>
              </CardContent>
            </Card>
          ) : sortedTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No tasks yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add your first task above to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            sortedTasks.map(task => (
            <Card key={task.id} className="card-hover">
              <CardContent className="flex items-center gap-4 py-4">
                <button
                  onClick={() => handleToggleTask(task.id, task.status)}
                  className="shrink-0 hover:scale-110 transition-transform"
                  aria-label={task.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                >
                  {task.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-success" />
                  ) : task.status === 'missed' ? (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {task.deadline && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(task.deadline), 'MMM d, h:mm a')}
                      </span>
                    )}
                    {task.priority_reason && (
                      <span className="text-xs text-primary">• {task.priority_reason}</span>
                    )}
                  </div>
                </div>

                <Badge className={`priority-${task.priority}`}>
                  {task.priority}
                </Badge>
              </CardContent>
            </Card>
          ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
