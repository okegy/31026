import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AIProcessingFlow } from '@/components/AIProcessingFlow';
import { VoiceInputSimple } from '@/components/VoiceInputSimple';
import { AIAgent, AIProcessingStep } from '@/lib/aiAgent';
import { useTasks } from '@/hooks/use-tasks';
import { useEvents } from '@/hooks/use-events';
import { useToast } from '@/hooks/use-toast';
import { getStoredGoogleUser, initiateGoogleLogin, isGoogleAuthenticated } from '@/lib/googleAuth';
import { 
  Sparkles, 
  Send, 
  Zap, 
  Calendar,
  Mail,
  CheckCircle,
  Brain,
  Loader2,
  Bell,
  X,
  CheckSquare,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/use-notifications';
import { demoTasks, demoEvents, demoAgentLogs, getDemoStats } from '@/lib/demoData';
import { format } from 'date-fns';

export default function Dashboard() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<AIProcessingStep[]>([]);
  const [showResult, setShowResult] = useState(false);
  
  const { createTask } = useTasks();
  const { createEvent } = useEvents();
  const { toast } = useToast();
  
  const googleUser = getStoredGoogleUser();
  const isGoogleAuth = isGoogleAuthenticated();
  const { isDemoMode } = useAuth();
  const { hasPermission, requestPermission } = useNotifications();
  const [showNotificationBanner, setShowNotificationBanner] = React.useState(true);
  const stats = getDemoStats();
  
  const todayTasks = demoTasks.filter(t => t.status !== 'completed').slice(0, 3);
  const overdueTasks = demoTasks.filter(t => t.status === 'missed');
  const upcomingEvents = demoEvents.slice(0, 3);
  const recentLogs = demoAgentLogs.filter(l => l.action_type === 'suggestion').slice(0, 2);

  const handleAIProcess = async () => {
    if (!input.trim()) {
      toast({
        title: "Empty input",
        description: "Please tell AURA what you need",
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
        googleUser?.email || 'demo@example.com',
        createTask,
        createEvent
      );

      setShowResult(true);

      if (result.success) {
        toast({
          title: "✓ Task Automated Successfully!",
          description: result.emailSent 
            ? "Task created, calendar updated, and confirmation email sent"
            : "Task created and calendar updated",
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

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowNotificationBanner(false);
    }
  };

  return (
    <DashboardLayout 
      title="AURA Dashboard" 
      subtitle="Your Autonomous AI Assistant"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Notification Permission Banner */}
        {!hasPermission && showNotificationBanner && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Enable Task Reminders</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified about upcoming deadlines and important tasks
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleEnableNotifications} size="sm">
                  Enable Notifications
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowNotificationBanner(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Google Auth Status */}
        {!isGoogleAuth && (
          <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Connect Google Account</h3>
                    <p className="text-sm text-gray-400">
                      Enable Gmail notifications and Google Calendar sync
                    </p>
                  </div>
                </div>
                <Button
                  onClick={initiateGoogleLogin}
                  className="bg-white text-gray-900 hover:bg-gray-100"
                >
                  <img 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    className="w-4 h-4 mr-2"
                  />
                  Connect Google
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isGoogleAuth && googleUser && (
          <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <img 
                  src={googleUser.picture} 
                  alt={googleUser.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-semibold text-white">{googleUser.name}</p>
                  <p className="text-sm text-gray-400">{googleUser.email}</p>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Input */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">What can AURA help you with?</h3>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Tell AURA what you need help with..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isProcessing}
                  className="pr-12 bg-white dark:bg-gray-800 border-primary/30"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
                  <VoiceInputSimple onTranscript={setInput} />
                </div>
              </div>
              <Button onClick={handleAIProcess} disabled={isProcessing || !input.trim()}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Automate
                  </>
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-purple-500/20 border-purple-500/50 text-gray-300"
                onClick={() => setInput("Remind me to submit my assignment tomorrow at 6 pm")}
              >
                Try: Assignment reminder
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-purple-500/20 border-purple-500/50 text-gray-300"
                onClick={() => setInput("Schedule a meeting with John next Monday at 2pm")}
              >
                Try: Schedule meeting
              </Badge>
              <Badge 
                variant="outline" 
                className="cursor-pointer hover:bg-purple-500/20 border-purple-500/50 text-gray-300"
                onClick={() => setInput("Call Sarah tomorrow at 10am - URGENT")}
              >
                Try: Urgent call
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* AI Processing Flow */}
        {processingSteps.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">AI Processing Flow</h3>
            </div>
            <AIProcessingFlow steps={processingSteps} />
          </div>
        )}

        {/* Result Summary */}
        {showResult && processingSteps.length > 0 && (
          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    ✓ Task Automated Successfully
                  </h3>
                  <div className="space-y-2 text-gray-300">
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Intent understood and analyzed
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Task created and prioritized
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      Calendar event scheduled
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      {isGoogleAuth ? 'Email confirmation sent' : 'Reminders configured'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-4">
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
