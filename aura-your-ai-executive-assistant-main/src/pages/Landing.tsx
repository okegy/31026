import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WavyBackground } from '@/components/ui/wavy-background';
import { 
  Heart, 
  Calendar, 
  Mail, 
  Brain, 
  Stethoscope, 
  Shield, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Target,
  Workflow,
  Activity
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'AI Medical Assistant',
      description: 'Advanced healthcare AI designed to manage clinic workflows and appointment scheduling autonomously',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Shield,
      title: 'HIPAA-Ready Architecture',
      description: 'Privacy-first processing ensures patient data remains secure and strictly within your control',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Mail,
      title: 'Automated Patient Follow-Ups',
      description: 'Automatically sends appointment confirmations and health reminders to patients',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      icon: Activity,
      title: 'Real-time Clinic Analytics',
      description: 'Monitor doctor availability, daily patient flow, and clinic efficiency live',
      color: 'from-blue-400 to-cyan-500',
    },
  ];

  const workflow = [
    { step: 'Patient Request', icon: Users, description: 'Natural language input' },
    { step: 'AI Assessment', icon: Brain, description: 'Understands urgency' },
    { step: 'Doctor Matching', icon: Stethoscope, description: 'Finds availability' },
    { step: 'Auto-Scheduling', icon: Calendar, description: 'Booking confirmed' },
    { step: 'Patient Care', icon: Heart, description: 'Follow-ups sent' },
  ];

  const winningPoints = [
    'Autonomous healthcare scheduling - MEDICU acts before you ask',
    'Human-centered, calm, and trustworthy medical design',
    'Seamless integrations: Google Calendar & Gmail notifications',
    'Production-ready scalable clinic architecture',
    'Reduces doctor burnout and clinic administrative overhead',
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 overflow-hidden font-sans">
      
      {/* Hero Section with Wavy Background */}
      <WavyBackground className="max-w-7xl mx-auto px-6 py-24 pb-40" backgroundFill="#f8fafc" colors={['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE']}>
        <div className="text-center animate-fade-in relative z-10 pt-16">
          <Badge className="mb-6 px-6 py-2 text-sm font-medium bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 uppercase tracking-widest shadow-sm">
            <Stethoscope className="w-4 h-4 mr-2 inline" />
            AI Clinic Administrator
          </Badge>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-slate-900 tracking-tight">
            MEDICU
          </h1>
          
          <p className="text-2xl md:text-3xl font-medium mb-6 text-blue-600">
            Intelligent Medical Scheduling & Clinic Assistant
          </p>
          
          <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            An autonomous AI assistant that <span className="text-blue-600 font-medium">schedules patients, manages doctors, and follows up</span> for you.
            <br />
            MEDICU reduces administrative overhead gracefully.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all shadow-blue-500/30"
              onClick={() => navigate('/auth')}
            >
              Experience MEDICU
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="w-full sm:w-auto text-lg px-8 py-6 border-blue-200 text-blue-700 hover:bg-blue-50 bg-white shadow-sm"
              onClick={() => {
                const featuresEl = document.getElementById('features');
                featuresEl?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              How it works
            </Button>
          </div>
        </div>
      </WavyBackground>

      <div className="relative z-10 bg-white">
        {/* Features Grid */}
        <section id="features" className="container mx-auto px-6 py-24 bg-slate-50 border-y border-slate-100">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Next-Generation Healthcare Management</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light">
              Built to handle the complexities of modern medical practices
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="bg-white border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-sm`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* AI Workflow */}
        <section className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">How MEDICU works</h2>
            <p className="text-xl text-slate-500 font-light">Seamless autonomous workflow from request to resolution</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100 -translate-y-1/2 hidden md:block rounded-full"></div>
            <div className="grid md:grid-cols-5 gap-8 relative z-10">
              {workflow.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-white border-4 border-blue-100 shadow-lg flex items-center justify-center mb-6 relative group hover:border-blue-400 transition-colors">
                     <div className="absolute inset-0 rounded-full bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <item.icon className="w-8 h-8 text-blue-600 relative z-10" />
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm border-2 border-white">
                      {idx + 1}
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">{item.step}</h3>
                  <p className="text-sm text-slate-500 font-light">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="bg-slate-900 text-white py-24">
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <Heart className="w-16 h-16 text-rose-500 mx-auto mb-8" />
            <h2 className="text-4xl md:text-5xl font-bold mb-12">
              Why hospitals choose MEDICU
            </h2>
            <div className="grid sm:grid-cols-2 gap-6 text-left">
              {winningPoints.map((point, idx) => (
                <div key={idx} className="flex items-start gap-4 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                  <p className="text-lg text-slate-200 font-light leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-32 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-slate-900">
            Ready to upgrade your clinic?
          </h2>
          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto font-light">
            Join the future of healthcare administration with our autonomous medical assistant.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-10 py-8 bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-blue-500/20 transition-all rounded-xl"
            onClick={() => navigate('/auth')}
          >
            Deploy MEDICU Today
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </section>
      </div>
    </div>
  );
}
