import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Mail, CheckCircle, Lightbulb, Zap, Users, Stethoscope, Clock, Calendar, Activity as ActivityIcon } from 'lucide-react';
import { demoAgentLogs } from '@/lib/demoData';
import { format } from 'date-fns';

const actionConfig: Record<string, { icon: any; color: string; label: string }> = {
  prioritized: { icon: Zap, color: 'text-amber-500 bg-amber-50', label: 'Urgent Processing' },
  rescheduled: { icon: RefreshCw, color: 'text-blue-500 bg-blue-50', label: 'Rescheduled' },
  email_sent: { icon: Mail, color: 'text-green-500 bg-green-50', label: 'Patient Notified' },
  email_followed_up: { icon: ActivityIcon, color: 'text-purple-500 bg-purple-50', label: 'Follow-up Sent' },
  task_created: { icon: Calendar, color: 'text-blue-500 bg-blue-50', label: 'Appointment Created' },
  task_completed: { icon: CheckCircle, color: 'text-green-500 bg-green-50', label: 'Consultation Completed' },
  suggestion: { icon: Lightbulb, color: 'text-amber-500 bg-amber-50', label: 'MEDICU Suggestion' },
  conflict_resolved: { icon: Sparkles, color: 'text-purple-500 bg-purple-50', label: 'Schedule Optimized' },
};

export default function Activity() {
  return (
    <DashboardLayout title="Clinic Activity Feed" subtitle="Live feed of clinic operations and MEDICU actions">
      <div className="space-y-4 animate-fade-in max-w-5xl mx-auto relative z-10">
        {demoAgentLogs.map((log, index) => {
          let actionType = log.action_type;
          
          // Map default task concepts to medical concepts
          if (index === 0) actionType = 'task_created';
          if (index === 1) actionType = 'conflict_resolved';
          if (index === 2) actionType = 'suggestion';

          const config = actionConfig[actionType] || actionConfig.suggestion;
          const Icon = config.icon;
          
          return (
            <div key={log.id} className="relative pl-6 sm:pl-8 py-2 group">
              {/* Timeline Line */}
              <div className="absolute left-[11px] sm:left-[15px] top-6 bottom-[-16px] w-[2px] bg-slate-100 group-last:hidden"></div>
              
              {/* Timeline Node */}
              <div className={`absolute left-0 sm:left-1 top-4 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 ${config.color.split(' ')[1]}`}>
                <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${config.color.split(' ')[0]}`} />
              </div>

              <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow ml-2 sm:ml-4">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`text-xs font-semibold ${config.color.split(' ')[0]} border-${config.color.split(' ')[0].replace('text-', '')}-200 bg-white`}>
                          {config.label}
                        </Badge>
                        <span className="text-xs text-slate-400 font-medium">
                          {format(new Date(log.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      
                      <p className="font-semibold text-slate-800 text-sm sm:text-base leading-snug">
                        {log.description.replace('Task', 'Appointment').replace('AURA', 'MEDICU')}
                      </p>
                      
                      {log.ai_reasoning && (
                        <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-100 flex gap-3">
                          <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-slate-600 italic">
                            {log.ai_reasoning.replace('tasks', 'appointments').replace('productivity', 'clinic efficiency')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
