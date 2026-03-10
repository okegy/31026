import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Filter, HeartPulse, MapPin, Calendar, Clock, Stethoscope, Mail, Phone } from 'lucide-react';

const MOCK_PATIENTS = [
  { id: 1, name: 'Rahul Sharma', age: 42, condition: 'Hypertension', nextAppointment: 'Tomorrow, 10:00 AM', status: 'Stable', doctor: 'Dr. Sarah', phone: '+91 98765 43210', email: 'rahul.s@example.com' },
  { id: 2, name: 'Sarah Connor', age: 35, condition: 'Migraine', nextAppointment: 'Friday, 02:30 PM', status: 'Monitoring', doctor: 'Dr. Emily', phone: '+1 555 0192 837', email: 'sarah.c@example.com' },
  { id: 3, name: 'John Doe', age: 58, condition: 'Type 2 Diabetes', nextAppointment: 'Next Week', status: 'Follow-up', doctor: 'Dr. John', phone: '+1 555 1234 567', email: 'john.d@example.com' },
  { id: 4, name: 'Priya Patel', age: 29, condition: 'Routine Checkup', nextAppointment: 'Today, 04:00 PM', status: 'Awaiting', doctor: 'Dr. Sarah', phone: '+91 91234 56789', email: 'priya.p@example.com' },
  { id: 5, name: 'Michael Chen', age: 46, condition: 'Asthma', nextAppointment: 'Unscheduled', status: 'Action Required', doctor: 'Dr. Emily', phone: '+1 555 9876 543', email: 'm.chen@example.com' },
  { id: 6, name: 'Elena Rodriguez', age: 51, condition: 'Post-op Recovery', nextAppointment: 'Next Monday', status: 'Stable', doctor: 'Dr. John', phone: '+1 555 2468 135', email: 'elena.r@example.com' },
];

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = MOCK_PATIENTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.phone.includes(searchTerm)
  );

  return (
    <DashboardLayout 
      title="Patient Management" 
      subtitle="MEDICU Patient Records & History"
    >
      <div className="space-y-6 animate-fade-in max-w-6xl mx-auto relative z-10">
        
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search patient name, phone, or ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-slate-50 border-slate-200"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" className="border-slate-200 text-slate-600 bg-white shadow-sm flex-1 sm:flex-none">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map(patient => (
            <Card key={patient.id} className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className={`h-2 w-full ${patient.status === 'Monitoring' || patient.status === 'Action Required' ? 'bg-amber-400' : 'bg-green-400'}`}></div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100 uppercase">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg leading-tight">{patient.name}</h3>
                      <p className="text-xs text-slate-500">{patient.age} yrs • ID: #{patient.id.toString().padStart(4, '0')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Condition</p>
                      <p className="text-sm text-slate-800 font-medium">{patient.condition}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Stethoscope className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Assigned Doctor</p>
                      <p className="text-sm text-slate-800">{patient.doctor}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Next Appointment</p>
                      <p className={`text-sm ${patient.nextAppointment === 'Unscheduled' ? 'text-amber-600 font-medium' : 'text-slate-800'}`}>
                        {patient.nextAppointment}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                      <Phone className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-full border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                      <Mail className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:bg-blue-50 font-medium">
                    View Records
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPatients.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200">
              <HeartPulse className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-800">No patients found</h3>
              <p className="text-slate-500">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
