
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-16 items-center justify-between border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary"></span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    <span>{user?.name || user?.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/my-account">Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="main-content">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
