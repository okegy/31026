import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AIProcessingFlow } from '@/components/AIProcessingFlow';
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
  Clock,
  AlertTriangle,
  TrendingUp,
  Brain,
  Loader2
} from 'lucide-react';

export default function DashboardNew() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<AIProcessingStep[]>([]);
  const [showResult, setShowResult] = useState(false);
  
  const { createTask } = useTasks();
  const { createEvent } = useEvents();
  const { toast } = useToast();
  
  const googleUser = getStoredGoogleUser();
  const isGoogleAuth = isGoogleAuthenticated();

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

  return (
    <DashboardLayout 
      title="AURA Dashboard" 
      subtitle="Your Autonomous AI Assistant"
    >
      <div className="space-y-6 animate-fade-in">
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
                <div>
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Connected to Google
                  </h3>
                  <p className="text-sm text-gray-400">{googleUser.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Input Section */}
        <Card className="ai-border ai-glow bg-gradient-to-br from-slate-900/90 to-purple-900/30 backdrop-blur-xl border-purple-500/30">
          <CardContent className="pt-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Tell AURA What You Need</h3>
              </div>
              <p className="text-sm text-gray-400">
                Use natural language. AURA will understand, plan, and execute autonomously.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <Input
                  placeholder="Remind me to submit my assignment tomorrow at 6 pm and email me if I forget"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isProcessing}
                  className="pl-12 h-14 text-base bg-slate-900/50 border-purple-500/30 focus:border-purple-500 text-white placeholder:text-gray-500"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                  onClick={handleAIProcess}
                  disabled={isProcessing || !input.trim()}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      AURA is Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Let AURA Handle It
                    </>
                  )}
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
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
          <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30 hover:border-purple-500/50 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Multi-Agent AI</h3>
              <p className="text-sm text-gray-400">
                Specialized agents work together to understand, plan, and execute
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30 hover:border-blue-500/50 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Smart Scheduling</h3>
              <p className="text-sm text-gray-400">
                Automatic calendar integration with conflict detection
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/30 hover:border-green-500/50 transition-all">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">Proactive Emails</h3>
              <p className="text-sm text-gray-400">
                Automated reminders and follow-ups via Gmail
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
