import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Calendar, Activity } from 'lucide-react';

export default function DoctorAnalytics() {
  return (
    <DashboardLayout 
      title="Clinic Statistical Reports" 
      subtitle="Analytics overview of patient flow and workload distribution"
    >
      <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Daily Patient Visits</CardTitle>
              <Users className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">42</div>
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12% from yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Cancellation Rate</CardTitle>
              <Activity className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">4.5%</div>
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> -2% lower than avg</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Waitlist Recoveries</CardTitle>
              <Users className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">18</div>
              <p className="text-xs text-slate-500 mt-1">Slots automatically filled</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Avg Waiting Time</CardTitle>
              <Calendar className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">14 min</div>
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> 3 min improvement</p>
            </CardContent>
          </Card>
        </div>

        {/* Mock Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Weekly Appointment Load</CardTitle>
              <CardDescription>Visualizing peak consultation times across days.</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-end justify-between p-6 gap-2 border-t border-slate-100">
               {/* Mock Bar Chart */}
               {[40, 65, 55, 80, 45, 30].map((val, i) => (
                 <div key={i} className="w-full bg-blue-100 rounded-t-sm flex flex-col justify-end group">
                   <div style={{height: `${val}%`}} className="w-full bg-blue-500 rounded-t-sm transition-all group-hover:bg-blue-600"></div>
                 </div>
               ))}
            </CardContent>
            <div className="flex justify-between px-6 pb-4 text-xs font-semibold text-slate-400">
               <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span>
            </div>
          </Card>
          
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Consultation Distribution</CardTitle>
              <CardDescription>Breakdown of specialities seen monthly.</CardDescription>
            </CardHeader>
            <CardContent className="h-72 flex items-center justify-center p-6 border-t border-slate-100">
               {/* Mock Pie Chart (CSS based for demo) */}
               <div className="w-48 h-48 rounded-full bg-slate-100 relative overflow-hidden" 
                 style={{background: 'conic-gradient(#3b82f6 0% 45%, #8b5cf6 45% 75%, #10b981 75% 100%)'}}>
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
                     <span className="font-bold text-slate-700 text-xl">Monthly</span>
                  </div>
               </div>
            </CardContent>
            <div className="flex justify-center gap-4 px-6 pb-6 text-sm">
               <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Cardiology (45%)</div>
               <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Neurology (30%)</div>
               <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Ortho (25%)</div>
            </div>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}
