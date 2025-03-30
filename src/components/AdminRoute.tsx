
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "@/components/ui/use-toast";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading, refetch } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isLoading = authLoading || roleLoading;

  // Force refetch roles when this component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Handle authentication and authorization
  useEffect(() => {
    // Log the current state for debugging
    console.log("AdminRoute - Current state:", { 
      isAuthenticated, 
      isAdmin,
      isLoading,
      path: location.pathname
    });
    
    if (isLoading) {
      // Still loading, don't make any decisions yet
      return;
    }

    // First check authentication
    if (!isAuthenticated) {
      console.log("User is not authenticated, redirecting to login");
      toast({
        title: "Autenticação necessária",
        description: "Você precisa estar logado para acessar esta página.",
        variant: "destructive",
      });
      navigate("/login", { replace: true });
      return;
    }

    // Then check admin status (only after loading is complete)
    if (!isAdmin) {
      console.log("User is not an admin, redirecting to dashboard");
      toast({
        title: "Acesso restrito",
        description: "Você não tem permissão para acessar a área administrativa.",
        variant: "destructive",
      });
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate, location.pathname]);

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="ml-2 text-sm text-muted-foreground">Verificando permissões...</p>
      </div>
    );
  }

  // Show loading while redirecting
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="ml-2 text-sm text-muted-foreground">Redirecionando...</p>
      </div>
    );
  }

  // Only render children if user is admin and authenticated
  return <>{children}</>;
};

export default AdminRoute;
