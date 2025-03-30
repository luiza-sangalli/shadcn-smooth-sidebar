
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Home, LayoutDashboard, Settings, Users, BarChart, LogOut, BookOpen } from 'lucide-react';

export const AppSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const mainMenuItems = [
    {
      name: 'Início',
      icon: Home,
      path: '/dashboard',
    },
    {
      name: 'Meus Cursos',
      icon: BookOpen,
      path: '/my-courses',
    },
    {
      name: 'Usuários',
      icon: Users,
      path: '/users',
    },
    {
      name: 'Analytics',
      icon: BarChart,
      path: '/analytics',
    },
    {
      name: 'Configurações',
      icon: Settings,
      path: '/settings',
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">Educa+</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                  >
                    <Link to={item.path} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} alt={user?.name} />
              <AvatarFallback>
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/70 truncate max-w-[120px]">
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            size="icon"
            variant="outline"
            onClick={logout}
            title="Sign out"
            className="h-9 w-9 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
