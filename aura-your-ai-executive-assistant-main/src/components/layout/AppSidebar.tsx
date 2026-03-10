import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Activity, 
  CalendarCheck, 
  Heart,
  Stethoscope,
  Calendar, 
  MessageSquare,
  Activity as ActivityLogIcon,
  LogOut,
  Sparkles,
  BarChart3,
  Network
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const doctorNavItems = [
  { title: 'Doctor Dashboard', icon: ActivityLogIcon, path: '/dashboard' },
  { title: 'Appointments', icon: CalendarCheck, path: '/tasks' },
  { title: 'Patient Records', icon: Heart, path: '/patients' },
  { title: 'Doctors Network', icon: Stethoscope, path: '/doctors' },
  { title: 'Calendar', icon: Calendar, path: '/calendar' },
  { title: 'Waitlist Agent', icon: Network, path: '/waitlist' },
  { title: 'Statistical Reports', icon: BarChart3, path: '/doctor-analytics' },
  { title: 'Messages & Alerts', icon: MessageSquare, path: '/emails' },
  { title: 'Activity Log', icon: ActivityLogIcon, path: '/activity' },
];

const patientNavItems = [
  { title: 'Patient Dashboard', icon: Heart, path: '/patient-dashboard' },
  { title: 'Book Appointment', icon: CalendarCheck, path: '/tasks' },
  { title: 'My Appointments', icon: Calendar, path: '/calendar' },
  { title: 'Notifications', icon: MessageSquare, path: '/emails' },
];

export function AppSidebar() {
  const location = useLocation();
  const { signOut, isDemoMode, user, userRole } = useAuth();
  
  const navItems = userRole === 'patient' ? patientNavItems : doctorNavItems;

  return (
    <Sidebar className="border-r border-slate-200 bg-slate-50">
      <SidebarHeader className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shadow-inner pt-0.5">
            <Stethoscope className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-blue-900 tracking-tight">MEDICU</h1>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{userRole === 'patient' ? 'Patient Portal' : 'Clinic Assistant'}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Clinic Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                // Determine active state - basic matching or specific map
                const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        transition-all duration-200 mb-1 rounded-lg
                        ${isActive 
                          ? 'bg-blue-600/10 text-blue-700 font-semibold' 
                          : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                        }
                      `}
                    >
                      <NavLink to={item.path} className="flex items-center gap-3 px-3 py-2.5">
                        <item.icon className={`w-4.5 h-4.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-200">
        <div className="space-y-3">
          {(user || isDemoMode) && (
            <div className="px-3 py-2 rounded-lg bg-white border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-800 truncate">
                {user?.email || (userRole === 'patient' ? 'patient_demo' : 'doctor_demo')}
              </p>
              <p className="text-xs text-slate-500">
                {user?.user_metadata?.full_name || (userRole === 'patient' ? 'Patient Portal User' : 'Clinic Administrator')}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isDemoMode ? 'Log Out' : 'Sign Out'}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
