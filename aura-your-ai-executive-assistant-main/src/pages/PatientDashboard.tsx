import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, Activity, Bell, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function PatientDashboard() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [appointmentConfirmed, setAppointmentConfirmed] = React.useState(false);
  const [slotAvailable, setSlotAvailable] = React.useState(true);
  const [myAppointmentExists, setMyAppointmentExists] = React.useState(true);

  const name = user?.user_metadata?.full_name || (userRole === 'patient' ? 'Patient Portal User' : 'Patient');

  return (
    <DashboardLayout 
      title="Patient Portal" 
      subtitle="Manage your appointments and medical records"
    >
      <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
        
        {/* Patient header */}
        <div className="flex bg-white p-6 rounded-xl border border-blue-100 shadow-sm items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Welcome, {name}!</h2>
            <p className="text-slate-500">View upcoming visits and alerts.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 mb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-blue-500" /> My Appointments
               </CardTitle>
            </CardHeader>
            <CardContent>
              {appointmentConfirmed && (
                <div className="p-4 border border-green-200 rounded-lg bg-green-50 mb-3">
                   <div className="flex justify-between mb-2">
                      <span className="font-semibold text-slate-800">Cardiology Consultation (Urgent)</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Confirmed</span>
                   </div>
                   <div className="text-sm text-slate-500 mb-3">Today, 2:00 PM • Dr. Sarah</div>
                   <div className="flex gap-2">
                     <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => {toast({title: "Cancelled", description: "Urgent consultation cancelled.", variant: "destructive"}); setAppointmentConfirmed(false);}}>Cancel</Button>
                     <Button variant="outline" size="sm" className="w-full" onClick={() => toast({title: "Reschedule", description: "We will contact you to reschedule."})}>Reschedule</Button>
                   </div>
                </div>
              )}

              {myAppointmentExists && (
                <div className="p-4 border border-slate-100 rounded-lg bg-slate-50 mb-3">
                   <div className="flex justify-between mb-2">
                      <span className="font-semibold text-slate-800">Routine Checkup</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Scheduled</span>
                   </div>
                   <div className="text-sm text-slate-500 mb-3">Tuesday, 10:00 AM • Dr. Sarah</div>
                   <div className="flex gap-2">
                     <Button variant="outline" size="sm" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => {toast({title: "Cancelled", description: "Routine checkup cancelled.", variant: "destructive"}); setMyAppointmentExists(false);}}>Cancel</Button>
                     <Button variant="outline" size="sm" className="w-full" onClick={() => toast({title: "Reschedule", description: "We will contact you to reschedule."})}>Reschedule</Button>
                   </div>
                </div>
              )}
              
              {!myAppointmentExists && !appointmentConfirmed && (
                <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg mb-3 border border-slate-100">
                  No upcoming appointments.
                </div>
              )}

              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => navigate('/tasks')}>Book New Appointment</Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 mb-4">
               <CardTitle className="text-lg flex items-center gap-2">
                 <Bell className="w-5 h-5 text-amber-500" /> Waitlist Alerts
               </CardTitle>
               <CardDescription>Notifications for earlier slots</CardDescription>
            </CardHeader>
            <CardContent>
              {slotAvailable ? (
                <div className="p-4 border border-amber-200 rounded-lg bg-amber-50 mb-3 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-amber-200 rounded-full blur-2xl -mr-8 -mt-8 opacity-50"></div>
                   <h4 className="font-semibold text-amber-900 mb-1">Earlier Slot Available!</h4>
                   <p className="text-sm text-amber-800 mb-3">An appointment for Cardiology has opened up today at 2:00 PM.</p>
                   <Button size="sm" className="w-full bg-amber-500 text-white hover:bg-amber-600" onClick={() => {
                     toast({
                       title: "Slot Confirmed! 🎉",
                       description: "Your appointment has been successfully rescheduled to today at 2:00 PM."
                     });
                     setSlotAvailable(false);
                     setAppointmentConfirmed(true);
                   }}>
                     Reply YES to Confirm
                   </Button>
                </div>
              ) : (
                <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
                  No new alerts at this time.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}
