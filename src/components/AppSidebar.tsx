
import React, { useEffect } from 'react';
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
import { useUserRole } from '@/hooks/useUserRole';
import { Home, LogOut, BookOpen, User, Shield } from 'lucide-react';

export const AppSidebar = () => {
  const { user, logout } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const location = useLocation();

  useEffect(() => {
    console.log("AppSidebar - isAdmin:", isAdmin, "roleLoading:", roleLoading);
  }, [isAdmin, roleLoading]);

  // Basic menu items available to all users
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
      name: 'Minha Conta',
      icon: User,
      path: '/my-account',
    },
  ];
  
  // Create the menu items array with admin item conditionally added
  const menuItems = [...mainMenuItems];
  if (isAdmin) {
    console.log("Adding admin menu item");
    menuItems.push({
      name: 'Administração',
      icon: Shield,
      path: '/admin',
    });
  }

  // Helper function to get user initial or fallback
  const getUserInitial = () => {
    if (user?.name && user.name.length > 0) {
      return user.name.charAt(0).toUpperCase();
    } 
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Handle menu item click
  const handleMenuItemClick = (path: string) => {
    console.log("Navigating to:", path);
    
    // Use window.location.href to force a complete page refresh and proper state reset
    // This ensures that all components re-initialize with current permissions
    window.location.href = path;
  };

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
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path}
                    onClick={() => handleMenuItemClick(item.path)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
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
              <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} alt={user?.name || user?.email} />
              <AvatarFallback>
                {getUserInitial()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user?.name || user?.email?.split('@')[0]}</p>
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
