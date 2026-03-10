import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Star, Clock, HeartPulse, Building2, Phone, Mail, Award, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Sarah Connor', specialty: 'Cardiology', experience: '12 Years', status: 'Available', todayAppointments: 8, rating: 4.9, icon: HeartPulse, img: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150&h=150', room: 'A-102' },
  { id: 2, name: 'Dr. John Smith', specialty: 'Neurology', experience: '15 Years', status: 'In Consultation', todayAppointments: 12, rating: 4.8, icon: Stethoscope, img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150&h=150', room: 'B-205' },
  { id: 3, name: 'Dr. Emily Chen', specialty: 'Pediatrics', experience: '8 Years', status: 'Off Duty', todayAppointments: 0, rating: 4.9, icon: HeartPulse, img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=150&h=150', room: 'C-301' },
];

export default function Doctors() {
  return (
    <DashboardLayout 
      title="Medical Staff" 
      subtitle="MEDICU Doctor Directory & Availability"
    >
      <div className="space-y-6 animate-fade-in max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="font-semibold text-slate-800 flex items-center gap-2">
             <Building2 className="w-5 h-5 text-blue-600" />
             Clinic Departments
           </h3>
           <div className="flex gap-2">
             <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer">All</Badge>
             <Badge variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">Cardiology</Badge>
             <Badge variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">Neurology</Badge>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_DOCTORS.map(doctor => (
            <Card key={doctor.id} className="bg-white border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col">
              <div className="h-24 bg-gradient-to-r from-blue-50 to-purple-50 relative border-b border-slate-100">
                <div className="absolute -bottom-10 left-6">
                  <div className="relative">
                    <img src={doctor.img} alt={doctor.name} className="w-20 h-20 rounded-full border-4 border-white object-cover shadow-sm bg-slate-200" />
                    <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white
                      ${doctor.status === 'Available' ? 'bg-green-500' : 
                        doctor.status === 'In Consultation' ? 'bg-amber-500' : 'bg-slate-400'}`} 
                    />
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className={`
                    ${doctor.status === 'Available' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                      doctor.status === 'In Consultation' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 
                      'bg-slate-100 text-slate-800 hover:bg-slate-200'}
                  `}>
                    {doctor.status}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="pt-14 pb-6 px-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-800 leading-tight mb-1">{doctor.name}</h3>
                  <p className="text-blue-600 font-medium flex items-center text-sm">
                    <doctor.icon className="w-3.5 h-3.5 mr-1" />
                    {doctor.specialty}
                  </p>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2 py-1 rounded-md text-xs border border-slate-100">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-semibold">{doctor.rating}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2 py-1 rounded-md text-xs border border-slate-100">
                    <Award className="w-3.5 h-3.5 text-purple-500" />
                    <span className="font-semibold">{doctor.experience}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2 py-1 rounded-md text-xs border border-slate-100">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-semibold">Rm {doctor.room}</span>
                  </div>
                </div>

                <div className="mt-auto space-y-4">
                  <div className="flex justify-between items-center py-2 border-y border-slate-100">
                    <div className="text-sm text-slate-500">Appointments Today</div>
                    <div className="font-bold text-slate-800">{doctor.todayAppointments}</div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1 bg-white border-blue-200 text-blue-700 hover:bg-blue-50 shadow-sm" disabled={doctor.status === 'Off Duty'}>
                      <Clock className="w-4 h-4 mr-2" />
                      Schedule
                    </Button>
                    <Button variant="outline" size="icon" className="border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
