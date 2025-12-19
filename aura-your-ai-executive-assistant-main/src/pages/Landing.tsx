import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Calendar, 
  Mail, 
  Brain, 
  Zap, 
  Shield, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Target,
  Workflow
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  const features = [
    {
      icon: Brain,
      title: 'Multi-Agent AI Architecture',
      description: 'Specialized AI agents work together to understand, plan, and execute tasks autonomously',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Shield,
      title: 'Privacy-First Offline LLM',
      description: 'Zero-cost AI processing with open-source models. Your data never leaves your control',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Mail,
      title: 'Proactive Email Follow-Ups',
      description: 'Automatically sends reminders and status updates via Gmail integration',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Target,
      title: 'Intelligent Prioritization',
      description: 'AI analyzes urgency and importance to prioritize your tasks automatically',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const workflow = [
    { step: 'Natural Language Input', icon: Users, description: 'Speak naturally' },
    { step: 'NLP Intent Recognition', icon: Brain, description: 'AI understands context' },
    { step: 'Multi-Agent Planning', icon: Workflow, description: 'Agents coordinate' },
    { step: 'Smart Execution', icon: Zap, description: 'Actions automated' },
    { step: 'Proactive Follow-Up', icon: Mail, description: 'Never forget again' },
  ];

  const winningPoints = [
    'Autonomous, not reactive - AURA acts before you ask',
    'Zero-cost AI with offline open-source LLM',
    'Real-world integrations: Gmail + Google Calendar',
    'Production-ready scalable architecture',
    'Privacy-first: Your data stays with you',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="animate-fade-in">
            <Badge className="mb-6 px-6 py-2 text-sm font-semibold bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Autonomous AI Agent
            </Badge>
            
            <h1 className="text-7xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              AURA
            </h1>
            
            <p className="text-3xl md:text-4xl font-semibold mb-4 text-purple-200">
              Autonomous Unified Reminder Agent
            </p>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              An autonomous AI agent that <span className="text-purple-400 font-semibold">plans, schedules, and follows up</span> for you.
              <br />
              AURA reduces cognitive overload by managing tasks across calendar and email autonomously.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50 transition-all hover:scale-105"
                onClick={() => navigate('/dashboard')}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <Sparkles className={`w-5 h-5 mr-2 ${isHovering ? 'animate-spin' : ''}`} />
                Try AURA Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg font-semibold border-2 border-purple-500/50 hover:bg-purple-500/10"
                onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See How It Works
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                <span>Google Calendar</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-400" />
                <span>Gmail Integration</span>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">
              Experience Autonomous Task Management
            </h2>
            <p className="text-xl text-gray-400 text-center mb-12">
              Just tell AURA what you need. It handles the rest.
            </p>

            <Card className="bg-gradient-to-br from-slate-900/90 to-purple-900/30 backdrop-blur-xl border-purple-500/30 shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-gray-400 mb-4">Try saying:</p>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-sm px-4 py-2 border-purple-500/50">
                        "Remind me to submit my assignment tomorrow at 6 pm and email me if I forget"
                      </Badge>
                      <br />
                      <Badge variant="outline" className="text-sm px-4 py-2 border-blue-500/50">
                        "Schedule a meeting with John next Monday at 2pm"
                      </Badge>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    onClick={() => navigate('/dashboard')}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Let AURA Handle It
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-center mb-16">
            Multi-Agent AI Architecture
          </h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group bg-gradient-to-br from-slate-900/50 to-purple-900/20 backdrop-blur-xl border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105 cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Workflow Section */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-center mb-4">
            How AURA Works
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16">
            Five-step autonomous workflow
          </p>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {workflow.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center font-bold text-lg">
                    {index + 1}
                  </div>
                  <Card className="flex-1 bg-gradient-to-r from-slate-900/50 to-purple-900/20 backdrop-blur-xl border-purple-500/20 hover:border-purple-500/50 transition-all">
                    <CardContent className="p-4 flex items-center gap-4">
                      <item.icon className="w-6 h-6 text-purple-400" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.step}</h4>
                        <p className="text-sm text-gray-400">{item.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-600" />
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why AURA Wins */}
        <section className="container mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-center mb-4">
            Why AURA Wins
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16">
            Built for judges, designed for users
          </p>

          <div className="max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-slate-900/90 to-purple-900/30 backdrop-blur-xl border-purple-500/30">
              <CardContent className="p-8">
                <div className="space-y-4">
                  {winningPoints.map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                      <p className="text-lg">{point}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Stop managing tasks.
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Let AURA manage them for you.
            </span>
          </h2>
          
          <Button
            size="lg"
            className="h-16 px-12 text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/50 transition-all hover:scale-105"
            onClick={() => navigate('/dashboard')}
          >
            <Sparkles className="w-6 h-6 mr-2" />
            Experience AURA
          </Button>

          <div className="mt-16 text-gray-500 text-sm">
            <p>Powered by Multi-Agent AI Architecture</p>
            <p className="mt-2">AURA - Autonomous Unified Reminder Agent</p>
          </div>
        </section>
      </div>
    </div>
  );
}
