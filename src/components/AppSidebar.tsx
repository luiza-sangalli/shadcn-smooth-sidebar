
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
import { toast } from '@/components/ui/use-toast';

export const AppSidebar = () => {
  const { user, logout } = useAuth();
  const { isAdmin, refetch } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<Array<{name: string, icon: any, path: string}>>([]);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

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

  // Force a refetch when component mounts or route changes
  useEffect(() => {
    console.log("AppSidebar - Fetching admin status on mount/route change");
    refetch().then(() => {
      setAdminCheckComplete(true);
    });
  }, [refetch, location.pathname]);

  // Update menu items when isAdmin changes
  useEffect(() => {
    if (!adminCheckComplete) return;
    
    console.log("AppSidebar - Admin status:", {
      isAdmin,
      path: location.pathname,
      adminCheckComplete
    });
    
    // Start with main menu items
    const updatedMenuItems = [...mainMenuItems];
    
    // Add admin item if user is admin
    if (isAdmin) {
      console.log("Adding admin menu item - user is confirmed admin");
      updatedMenuItems.push({
        name: 'Administração',
        icon: Shield,
        path: '/admin',
      });
    }
    
    setMenuItems(updatedMenuItems);
  }, [isAdmin, location.pathname, adminCheckComplete]);

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

  // Handle menu item click with special admin route handling
  const handleMenuItemClick = useCallback((path: string) => {
    console.log("Handling click for path:", path);
    
    // Special handling for admin route
    if (path === '/admin') {
      // Force refetch roles to ensure latest admin status
      refetch().then(({ data }) => {
        const hasAdminRole = data?.some(r => r.role === "admin");
        
        if (!hasAdminRole) {
          toast({
            title: "Acesso restrito",
            description: "Você não tem permissão para acessar esta página.",
            variant: "destructive",
          });
          return;
        }
        
        // Navigate to admin and force a full page reload to ensure proper state
        // This helps synchronize the admin status across components
        window.location.href = '/admin';
      });
      return;
    }
    
    // Use navigate for other paths
    navigate(path);
  }, [navigate, refetch]);

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
