import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { demoTasks } from '@/lib/demoData';
import { format } from 'date-fns';

export default function Tasks() {
  const [input, setInput] = React.useState('');
  
  const sortedTasks = [...demoTasks].sort((a, b) => b.priority_score - a.priority_score);

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
                  className="pl-10 h-12 text-base"
                />
              </div>
              <Button size="lg" className="h-12">
                <Send className="w-4 h-4 mr-2" />
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
          {sortedTasks.map(task => (
            <Card key={task.id} className="card-hover">
              <CardContent className="flex items-center gap-4 py-4">
                {task.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                ) : task.status === 'missed' ? (
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
                
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
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
