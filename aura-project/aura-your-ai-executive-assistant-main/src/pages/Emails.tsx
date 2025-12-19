import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, RefreshCw, AlertCircle } from 'lucide-react';
import { demoEmails } from '@/lib/demoData';
import { format } from 'date-fns';

const statusConfig = {
  pending: { icon: Mail, color: 'bg-warning/10 text-warning', label: 'Pending' },
  sent: { icon: Send, color: 'bg-success/10 text-success', label: 'Sent' },
  followed_up: { icon: RefreshCw, color: 'bg-primary/10 text-primary', label: 'Followed Up' },
  failed: { icon: AlertCircle, color: 'bg-destructive/10 text-destructive', label: 'Failed' },
};

export default function Emails() {
  return (
    <DashboardLayout title="Email Automation" subtitle="Track automated emails and follow-ups">
      <div className="space-y-4 animate-fade-in">
        {demoEmails.map(email => {
          const config = statusConfig[email.status];
          const Icon = config.icon;
          
          return (
            <Card key={email.id} className="card-hover">
              <CardContent className="flex items-center gap-4 py-4">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{email.subject}</p>
                  <p className="text-sm text-muted-foreground">To: {email.recipient}</p>
                </div>

                <div className="text-right">
                  <Badge variant="outline" className={config.color}>
                    {config.label}
                  </Badge>
                  {email.sent_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(email.sent_at), 'MMM d, h:mm a')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
