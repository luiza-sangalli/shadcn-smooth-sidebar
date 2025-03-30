
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "@/components/ui/use-toast";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAdmin, isDefinitelyAdmin, isLoading: roleLoading, refetch } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  
  const isLoading = authLoading || roleLoading;

  useEffect(() => {
    // Force a refetch when component mounts to ensure fresh data
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Log the current state for debugging
    console.log("AdminRoute - Current state:", { 
      isAuthenticated, 
      isAdmin,
      isDefinitelyAdmin, 
      isLoading,
      path: location.pathname
    });
    
    if (isLoading) {
      // Still loading, don't make any decisions yet
      return;
    }

    // Auth check first
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

    // Then admin check - only do this after status is definitively determined
    if (isDefinitelyAdmin) {
      console.log("User confirmed as admin, allowing access");
      setIsAuthorized(true);
    } else if (!isAdmin) {
      console.log("User is definitely not an admin, redirecting to dashboard");
      toast({
        title: "Acesso restrito",
        description: "Você não tem permissão para acessar a área administrativa.",
        variant: "destructive",
      });
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isAdmin, isDefinitelyAdmin, isLoading, navigate, location.pathname]);

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="ml-2 text-sm text-muted-foreground">Verificando permissões...</p>
      </div>
    );
  }

  // Only render children if user is explicitly authorized
  if (isAuthorized) {
    console.log("Rendering admin page content");
    return <>{children}</>;
  }

  // Show loading while redirecting or still deciding
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      <p className="ml-2 text-sm text-muted-foreground">Verificando acesso administrativo...</p>
    </div>
  );
};

export default AdminRoute;
