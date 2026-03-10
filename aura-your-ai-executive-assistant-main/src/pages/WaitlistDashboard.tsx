import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Clock, AlertTriangle, Users, Activity, CheckCircle, RefreshCw, Smartphone, Mail, XCircle, UserPlus, Crown, AlertOctagon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { mockWaitlist, mockCalendarEvents } from '@/lib/agent-system/mockWaitlist';
import { WaitlistRankingEngine } from '@/lib/agent-system/WaitlistEngine';
import { SlotRecoveryAgent } from '@/lib/agent-system/RecoveryAgent';
import { appointmentEventLogger } from '@/lib/agent-system/EventLogger';
import { PatientNotificationService } from '@/lib/agent-system/NotificationService';

export default function WaitlistDashboard() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>(appointmentEventLogger.getLogs());
  const [monitorActive, setMonitorActive] = useState(true);
  const [rankedPatients, setRankedPatients] = useState<any[]>([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState('Cardiology');

  // Trigger ranking
  useEffect(() => {
    setRankedPatients(WaitlistRankingEngine.rankPatients(selectedSpeciality));
  }, [selectedSpeciality, logs]); // Re-rank if logs change (proxy for state updates)

  const handleAddEmergency = () => {
    const newId = `w_emerg_${Math.floor(Math.random() * 1000)}`;
    const newPatient = {
      id: newId,
      name: `Emergency Patient ${newId.split('_')[2]}`,
      phone: '+1000000000',
      distance_km: Math.floor(Math.random() * 10),
      urgency: 10,
      wait_since: 0,
      speciality_needed: selectedSpeciality,
      past_cancellations: 0,
      is_vip: true
    };
    mockWaitlist.push(newPatient);
    
    appointmentEventLogger.logEvent('appointment_requested', `Emergency Add to Waitlist: ${newPatient.name}`, { speciality: selectedSpeciality });
    setLogs([...appointmentEventLogger.getLogs()]);
    
    toast({
      title: "Emergency Patient Added",
      description: `Added VIP patient to ${selectedSpeciality} waitlist with priority 10.`,
      variant: "default"
    });
  };

  // Auto-run cancellation monitor and logs
  useEffect(() => {
    if (monitorActive) {
      SlotRecoveryAgent.runCancellationMonitor();
    }
    const interval = setInterval(() => {
      if (monitorActive) {
        SlotRecoveryAgent.runCancellationMonitor();
      }
      setLogs([...appointmentEventLogger.getLogs()]);
    }, 2000);
    return () => clearInterval(interval);
  }, [monitorActive]);

  const cancelledEvents = mockCalendarEvents.filter(e => e.status === 'cancelled');

  const handleManualRecovery = (slotId: string, doctorName: string, dateStr: string) => {
    const spec = doctorName.includes('John') || doctorName.includes('Sarah') ? 'Cardiology' : 'Neurology';
    SlotRecoveryAgent.recoverSlot(slotId, spec, dateStr);
    
    toast({
      title: 'Recovery Agent Triggered',
      description: `Searching top 3 waitlist patients for ${spec} slot...`,
    });
    setLogs([...appointmentEventLogger.getLogs()]);
  };

  const simulatePatientReply = (patientId: string, name: string, slotId: string, reply: string) => {
    const confirmed = SlotRecoveryAgent.handlePatientReply(patientId, name, slotId, reply);
    toast({
      title: confirmed ? 'Slot Filled!' : 'Slot Update',
      description: `${name} replied ${reply}. ${confirmed ? 'Appointment booked.' : 'Slot already taken or invalid.'}`,
      variant: confirmed ? 'default' : 'destructive'
    });
    setLogs([...appointmentEventLogger.getLogs()]);
  };

  return (
    <DashboardLayout 
      title="Intelligent Booking System" 
      subtitle="Autonomous Cancellation & Waitlist Management"
    >
      <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
        
        {/* Status Header */}
        <div className="flex flex-wrap gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${monitorActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <Activity className={`w-6 h-6 ${monitorActive ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">Cancellation Monitor</h3>
              <p className="text-sm text-slate-500">{monitorActive ? 'Active • Scanning every 2 mins' : 'Paused'}</p>
            </div>
          </div>
          <Button 
            variant={monitorActive ? 'outline' : 'default'}
            className={monitorActive ? 'border-red-200 text-red-600 hover:bg-red-50' : 'bg-green-600 hover:bg-green-700 text-white'}
            onClick={() => setMonitorActive(!monitorActive)}
          >
            {monitorActive ? 'Pause Monitor' : 'Resume Monitor'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recovery Panel */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-2 text-slate-800">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Slot Recovery Agent
              </CardTitle>
              <CardDescription>Detected cancellations requiring reassignment</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {cancelledEvents.map((event) => (
                  <div key={event.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                         <XCircle className="w-4 h-4 text-red-500" />
                         <span className="font-medium text-slate-800 line-through decoration-red-300">{event.title}</span>
                       </div>
                       <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">Open Slot</Badge>
                    </div>
                    <div className="text-sm text-slate-500 mb-3 flex items-center gap-3">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(event.start).toLocaleString()}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {event.doctor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <Button size="sm" onClick={() => handleManualRecovery(event.id, event.doctor, event.start)} className="bg-blue-600 hover:bg-blue-700">
                         <RefreshCw className="w-4 h-4 mr-2" />
                         Trigger Auto-Fill
                       </Button>

                       {/* Developer Simulation Tools */}
                       {SlotRecoveryAgent.pendingConfirmations[event.id] && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">Simulate Reply:</span>
                            <Button size="sm" variant="outline" className="h-7 border-green-200 text-green-700" onClick={() => simulatePatientReply('w1', 'John Doe', event.id, 'YES')}>
                               John (YES)
                            </Button>
                          </div>
                       )}
                    </div>
                  </div>
                ))}
                {cancelledEvents.length === 0 && (
                  <div className="p-8 text-center text-slate-500">No cancellations detected.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Waitlist Dashboard */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
               <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-semibold flex items-center gap-2 text-slate-800">
                      <Users className="w-5 h-5 text-blue-500" />
                      Waitlist Prioritization
                    </CardTitle>
                    <CardDescription>AI Ranked patients by urgency, wait time & distance.</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <select 
                      className="text-sm border border-slate-200 rounded-md p-1.5 outline-none text-slate-700 bg-slate-50"
                      value={selectedSpeciality}
                      onChange={(e) => setSelectedSpeciality(e.target.value)}
                    >
                       <option value="Cardiology">Cardiology</option>
                       <option value="Neurology">Neurology</option>
                       <option value="Orthopedics">Orthopedics</option>
                       <option value="Dermatology">Dermatology</option>
                       <option value="Pediatrics">Pediatrics</option>
                       <option value="General">General</option>
                     </select>
                     <Button size="sm" variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200" onClick={handleAddEmergency}>
                       <UserPlus className="w-4 h-4 mr-1.5" />
                       Add Emergency Case
                     </Button>
                   </div>
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="divide-y divide-slate-100 bg-slate-50/50">
                  <div className="grid grid-cols-12 gap-2 p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-100/50">
                    <div className="col-span-1 text-center">Rank</div>
                    <div className="col-span-4">Patient</div>
                    <div className="col-span-2 text-center">Score</div>
                    <div className="col-span-2 text-center">Urgency</div>
                    <div className="col-span-3 text-right">Wait Time</div>
                  </div>
                  {rankedPatients.map((patient, index) => (
                     <div key={patient.id} className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-white transition-colors text-sm">
                        <div className="col-span-1 text-center font-bold text-slate-400">#{index + 1}</div>
                        <div className="col-span-4 flex flex-col justify-center">
                           <span className="font-medium text-slate-800 truncate flex items-center gap-1">
                             {patient.name}
                             {patient.is_vip && <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                           </span>
                           {patient.past_cancellations > 0 && (
                             <span className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5"><AlertOctagon className="w-2.5 h-2.5" />{patient.past_cancellations} past cancellations</span>
                           )}
                        </div>
                        <div className="col-span-2 text-center font-mono font-medium text-blue-600 flex flex-col items-center">
                          {patient.score.toFixed(1)}
                        </div>
                        <div className="col-span-2 flex justify-center">
                           <Badge variant="outline" className={`py-0 text-[10px] ${patient.urgency > 7 ? 'text-red-600 border-red-200 bg-red-50' : 'text-amber-600 border-amber-200 bg-amber-50'}`}>
                              {patient.urgency}/10
                           </Badge>
                        </div>
                        <div className="col-span-3 text-right text-slate-500">{patient.wait_since} days</div>
                     </div>
                  ))}
                  {rankedPatients.length === 0 && (
                    <div className="p-6 text-center text-slate-500 text-sm">No waitlisted patients for this speciality.</div>
                  )}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Agent Logs */}
        <Card className="border-slate-200 shadow-sm bg-slate-900 border-0">
           <CardHeader className="pb-3 border-b border-slate-800">
             <CardTitle className="text-lg font-mono flex items-center gap-2 text-slate-200">
               <Activity className="w-4 h-4 text-green-400" />
               Agent Activity Logs
             </CardTitle>
           </CardHeader>
           <CardContent className="p-0">
             <ScrollArea className="h-48 w-full rounded-b-xl border-t-0 p-4">
                <div className="space-y-2">
                  {logs.map(log => (
                    <div key={log.id} className="font-mono text-xs flex gap-3 pb-2 border-b border-slate-800/50">
                       <span className="text-slate-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                       <span className={`shrink-0 font-bold 
                          ${log.event_type.includes('cancelled') ? 'text-red-400' : 
                            log.event_type.includes('confirmed') ? 'text-green-400' : 
                            log.event_type.includes('notified') ? 'text-blue-400' : 'text-amber-400'}`}>
                         [{log.event_type.toUpperCase()}]
                       </span>
                       <span className="text-slate-300">{log.description}</span>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="text-slate-500 text-xs font-mono">Waiting for agent events...</div>
                  )}
                </div>
             </ScrollArea>
           </CardContent>
         </Card>

      </div>
    </DashboardLayout>
  );
}
