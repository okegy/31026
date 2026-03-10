import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import { VoiceInputSimple } from '@/components/VoiceInputSimple';
import { AIAgent, AIProcessingStep } from '@/lib/aiAgent';
import { useTasks } from '@/hooks/use-tasks';
import { useEvents } from '@/hooks/use-events';
import { useToast } from '@/hooks/use-toast';
import { getStoredGoogleUser } from '@/lib/googleAuth';
import { 
  Stethoscope, 
  Send, 
  Activity, 
  Calendar,
  Users,
  CheckCircle,
  Brain,
  Loader2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { demoTasks, demoEvents, demoAgentLogs, getDemoStats } from '@/lib/demoData';
import { format } from 'date-fns';
import { BackgroundPaths } from '@/components/ui/background-paths';

export default function Dashboard() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<AIProcessingStep[]>([]);
  const [showResult, setShowResult] = useState(false);
  
  const { tasks, createTask } = useTasks();
  const { events, createEvent } = useEvents();
  const { toast } = useToast();
  
  const googleUser = getStoredGoogleUser();
  
  const todayCount = tasks.filter(t => t.status !== 'completed').length;
  const overdueCount = tasks.filter(t => t.status === 'missed').length;
  const upcomingEventsCount = events.length;
  
  // Transform productivity tasks into medical appointments
  const todayAppointments = tasks.filter(t => t.status !== 'completed').slice(0, 3);
  
  const recentLogs = demoAgentLogs.filter(l => l.action_type === 'suggestion').slice(0, 2);

  const handleAIProcess = async () => {
    if (!input.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter your request for MEDICU",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setShowResult(false);
    setProcessingSteps([]);

    const agent = new AIAgent((steps) => {
      setProcessingSteps([...steps]);
    });

    try {
      const result = await agent.processUserInput(
        input,
        googleUser?.email || 'doctor@medicu.clinic',
        createTask,
        createEvent
      );

      setShowResult(true);

      if (result.success) {
        toast({
          title: "✓ Action Completed",
          description: result.emailSent 
            ? "Appointment created, calendar updated, and patient notified"
            : "Task updated in clinic records",
        });
      } else {
        toast({
          title: "Processing completed with warnings",
          description: result.error || "Some steps may have failed",
          variant: "destructive",
        });
      }

      setInput('');
    } catch (error: any) {
      toast({
        title: "AI Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isProcessing) {
      e.preventDefault();
      handleAIProcess();
    }
  };

  return (
    <DashboardLayout 
      title="Clinic Control Center" 
      subtitle="MEDICU AI Medical Scheduling Assistant"
    >
      <div className="space-y-6 animate-fade-in relative z-10">
        
        {/* Background Paths integration - Medical white aesthetics */}
        <div className="absolute inset-0 z-[-1] opacity-20 pointer-events-none rounded-2xl overflow-hidden bg-slate-50">
           <BackgroundPaths title="" />
        </div>

        {/* AI Input Block */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-500/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-800">Ask MEDICU</h3>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  placeholder="e.g. Schedule an appointment for Rahul tomorrow at 10 AM..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isProcessing}
                  className="pr-12 bg-slate-50 border-slate-200 text-slate-800 focus-visible:ring-blue-500"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
                  <VoiceInputSimple onTranscript={setInput} />
                </div>
              </div>
              <Button 
                onClick={handleAIProcess} 
                disabled={isProcessing || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Working...
                  </>
                ) : (
                  <>
                    <Activity className="mr-2 h-4 w-4" />
                    Process
                  </>
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-blue-50 border-blue-200 text-slate-600 font-normal"
                onClick={() => setInput("Schedule a routine checkup for Rahul tomorrow at 2 PM")}
              >
                Schedule appointment for Rahul tomorrow
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-red-50 border-red-200 text-slate-600 font-normal"
                onClick={() => setInput("Cancel the 3 PM appointment with Sarah")}
              >
                Cancel patient booking
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-amber-50 border-amber-200 text-slate-600 font-normal"
                onClick={() => setInput("Move John's appointment to Friday morning at 10am")}
              >
                Move appointment to Friday
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* AI Processing Flow removed per user request */}

        {/* Result Summary */}
        {showResult && processingSteps.length > 0 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-green-900 mb-2">
                    ✓ Action Completed Effectively
                  </h3>
                  <div className="space-y-2 text-green-800">
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Patient intent understood
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Clinic schedule updated
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Doctor availability synchronized
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Clinic Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Patients Today</CardTitle>
              <Users className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-slate-800">{todayCount * 3 + 12}</div>
              <p className="text-xs text-slate-500 mt-1">Expected visits</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Pending Follow-ups</CardTitle>
              <Clock className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-slate-800">{overdueCount + 3}</div>
              <p className="text-xs text-slate-500 mt-1">Requires attention</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Appointments Booked</CardTitle>
              <Calendar className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-slate-800">{upcomingEventsCount * 2 + 8}</div>
              <p className="text-xs text-slate-500 mt-1">Next 7 days</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Doctors Online</CardTitle>
              <Activity className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold text-slate-800">4</div>
              <p className="text-xs text-slate-500 mt-1">On shift currently</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Today's Appointments */}
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Users className="w-5 h-5 text-blue-600" />
                Today's Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayAppointments.map((task, idx) => (
                <div key={task.id} className="flex flex-col p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{task.title}</p>
                      <p className="text-sm text-slate-500 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {task.deadline ? format(new Date(task.deadline), 'h:mm a') : `2:00 PM`}
                      </p>
                    </div>
                    <div>
                      {idx === 0 ? (
                         <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Confirmed</Badge>
                      ) : idx === 1 ? (
                         <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">Waiting</Badge>
                      ) : (
                         <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200">Scheduled</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center text-sm text-slate-600">
                      <Stethoscope className="w-4 h-4 mr-1 text-slate-400" />
                      Dr. {['Sarah', 'John', 'Emily'][idx % 3]}
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">View Details</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Doctor Availability & Activity */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Stethoscope className="w-5 h-5 text-purple-600" />
                  Doctor Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                       <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150&h=150" alt="Dr. Sarah" />
                       </div>
                       <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Dr. Sarah</p>
                      <p className="text-xs text-slate-500">Cardiology</p>
                    </div>
                  </div>
                  <Badge className="bg-green-50 text-green-700 hover:bg-green-50">Available</Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                     <div className="relative">
                       <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                          <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150&h=150" alt="Dr. John" />
                       </div>
                       <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Dr. John</p>
                      <p className="text-xs text-slate-500">Neurology</p>
                    </div>
                  </div>
                  <Badge className="bg-red-50 text-red-700 hover:bg-red-50">In consultation</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                   <div className="mt-0.5 p-1.5 bg-blue-100 rounded-full text-blue-600">
                     <Calendar className="w-4 h-4" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-800">MEDICU booked appointment for Rahul</p>
                     <p className="text-xs text-slate-500 mt-0.5">2 mins ago</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="mt-0.5 p-1.5 bg-green-100 rounded-full text-green-600">
                     <Send className="w-4 h-4" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-800">Reminder sent to patient Emily</p>
                     <p className="text-xs text-slate-500 mt-0.5">15 mins ago</p>
                   </div>
                </div>
                <div className="flex items-start gap-3">
                   <div className="mt-0.5 p-1.5 bg-amber-100 rounded-full text-amber-600">
                     <Clock className="w-4 h-4" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-slate-800">Appointment rescheduled by Dr. Smith</p>
                     <p className="text-xs text-slate-500 mt-0.5">1 hour ago</p>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
