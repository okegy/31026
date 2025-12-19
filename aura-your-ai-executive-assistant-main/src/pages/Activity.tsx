import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Mail, CheckCircle, Lightbulb, Zap } from 'lucide-react';
import { demoAgentLogs } from '@/lib/demoData';
import { format } from 'date-fns';

const actionConfig = {
  prioritized: { icon: Zap, color: 'text-warning' },
  rescheduled: { icon: RefreshCw, color: 'text-primary' },
  email_sent: { icon: Mail, color: 'text-success' },
  email_followed_up: { icon: Mail, color: 'text-accent' },
  task_created: { icon: CheckCircle, color: 'text-success' },
  task_completed: { icon: CheckCircle, color: 'text-success' },
  suggestion: { icon: Lightbulb, color: 'text-warning' },
  conflict_resolved: { icon: Sparkles, color: 'text-primary' },
};

export default function Activity() {
  return (
    <DashboardLayout title="Agent Activity" subtitle="See what AURA has been doing for you">
      <div className="space-y-4 animate-fade-in">
        {demoAgentLogs.map(log => {
          const config = actionConfig[log.action_type];
          const Icon = config.icon;
          
          return (
            <Card key={log.id} className="card-hover">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg bg-muted ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {log.action_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="font-medium">{log.description}</p>
                    {log.ai_reasoning && (
                      <p className="text-sm text-muted-foreground mt-2 italic border-l-2 border-primary/30 pl-3">
                        {log.ai_reasoning}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
