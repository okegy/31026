import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Mail, 
  Activity, 
  LogOut,
  Sparkles,
  Settings,
  BarChart3
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

const mainNavItems = [
  { title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { title: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { title: 'Calendar', icon: Calendar, path: '/calendar' },
  { title: 'Analytics', icon: BarChart3, path: '/analytics' },
  { title: 'Emails', icon: Mail, path: '/emails' },
  { title: 'Agent Activity', icon: Activity, path: '/activity' },
];

export function AppSidebar() {
  const location = useLocation();
  const { signOut, isDemoMode, user } = useAuth();

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center ai-glow">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg gradient-text">AURA</h1>
            <p className="text-xs text-muted-foreground">AI Assistant</p>
          </div>
        </div>
        {isDemoMode && (
          <Badge variant="secondary" className="mt-3 w-full justify-center">
            <Sparkles className="w-3 h-3 mr-1" />
            Demo Mode
          </Badge>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 mb-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        transition-all duration-200
                        ${isActive 
                          ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                          : 'hover:bg-sidebar-accent text-sidebar-foreground'
                        }
                      `}
                    >
                      <NavLink to={item.path} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                        <span className="font-medium">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="space-y-3">
          {user && (
            <div className="px-3 py-2 rounded-lg bg-sidebar-accent">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.user_metadata?.full_name || 'User'}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isDemoMode ? 'Exit Demo' : 'Sign Out'}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
