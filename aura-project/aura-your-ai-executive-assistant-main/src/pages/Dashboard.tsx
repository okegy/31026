import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare, AlertTriangle, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { demoTasks, demoEvents, demoAgentLogs, getDemoStats } from '@/lib/demoData';
import { format } from 'date-fns';

export default function Dashboard() {
  const { isDemoMode } = useAuth();
  const stats = getDemoStats();
  
  const todayTasks = demoTasks.filter(t => t.status !== 'completed').slice(0, 3);
  const overdueTasks = demoTasks.filter(t => t.status === 'missed');
  const upcomingEvents = demoEvents.slice(0, 3);
  const recentLogs = demoAgentLogs.filter(l => l.action_type === 'suggestion').slice(0, 2);

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back! Here's what AURA has for you today.">
      <div className="space-y-6 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Tasks</CardTitle>
              <CheckSquare className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">{stats.todayCount}</div>
              <p className="text-xs text-muted-foreground mt-1">tasks due today</p>
            </CardContent>
          </Card>

          <Card className="card-hover border-destructive/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-destructive">{stats.overdueCount}</div>
              <p className="text-xs text-muted-foreground mt-1">need attention</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Events</CardTitle>
              <Calendar className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">{stats.upcomingEventsCount}</div>
              <p className="text-xs text-muted-foreground mt-1">this week</p>
            </CardContent>
          </Card>

          <Card className="card-hover ai-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">AI Suggestions</CardTitle>
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold gradient-text">{recentLogs.length}</div>
              <p className="text-xs text-muted-foreground mt-1">active suggestions</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                Priority Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.deadline && format(new Date(task.deadline), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <Badge className={`priority-${task.priority} ml-2`}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <Card className="ai-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentLogs.map(log => (
                <div key={log.id} className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm">{log.description}</p>
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    "{log.ai_reasoning}"
                  </p>
                </div>
              ))}
              {recentLogs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No suggestions right now. You're doing great! ✨
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
