import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Calendar, CheckCircle } from 'lucide-react';
import { demoEmails } from '@/lib/demoData';
import { format } from 'date-fns';

const statusConfig = {
  pending: { icon: Calendar, color: 'bg-amber-100 text-amber-700', label: 'Scheduled' },
  sent: { icon: Send, color: 'bg-green-100 text-green-700', label: 'Sent' },
  followed_up: { icon: CheckCircle, color: 'bg-blue-100 text-blue-700', label: 'Confirmed' },
  failed: { icon: Mail, color: 'bg-slate-100 text-slate-700', label: 'Pending' },
};

export default function Emails() {
  return (
    <DashboardLayout title="Patient Communications" subtitle="Automated appointment confirmations and health reminders">
      <div className="space-y-4 animate-fade-in max-w-5xl mx-auto relative z-10">
        <div className="flex gap-2 mb-6">
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer shadow-none">All Communications</Badge>
          <Badge variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">Confirmations</Badge>
          <Badge variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">Follow-ups</Badge>
        </div>

        {demoEmails.map((email, idx) => {
          let emailStatus = email.status;
          if (idx === 0) emailStatus = 'sent';
          if (idx === 1) emailStatus = 'followed_up';
          if (idx === 2) emailStatus = 'pending';

          const config = statusConfig[emailStatus as keyof typeof statusConfig] || statusConfig.pending;
          const Icon = config.icon;
          
          return (
            <Card key={email.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all group">
              <CardContent className="flex items-center gap-4 py-5">
                <div className={`p-3 rounded-full ${config.color} border border-white shadow-sm`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 mb-0.5">{email.subject.replace('AURA', 'MEDICU')}</p>
                  <p className="text-sm text-slate-500">To: {email.recipient}</p>
                </div>

                <div className="text-right flex flex-col items-end gap-1.5">
                  <Badge variant="outline" className={`${config.color} border-current border-opacity-20`}>
                    {config.label}
                  </Badge>
                  {email.sent_at && (
                    <p className="text-xs text-slate-400 font-medium tracking-wide">
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
