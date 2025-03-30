
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
  const { 
    isAdmin, 
    isDefinitelyNotAdmin,
    isAdminStatusLoading, 
    refetch 
  } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [attemptCount, setAttemptCount] = useState(0);
  const [hasCheckedAdmin, setHasCheckedAdmin] = useState(false);
  
  const isLoading = authLoading || isAdminStatusLoading;
  
  // Force refetch when component mounts and when location changes
  useEffect(() => {
    console.log("AdminRoute - Fetching fresh admin status on mount/route change");
    refetch().then(() => {
      setHasCheckedAdmin(true);
    });
  }, [refetch, location.pathname]);
  
  // Retry logic if needed
  useEffect(() => {
    if (attemptCount > 0 && attemptCount < 3 && !isAdmin && !isDefinitelyNotAdmin) {
      const timer = setTimeout(() => {
        console.log(`AdminRoute - Retry attempt ${attemptCount}/3`);
        refetch();
        setAttemptCount(prev => prev + 1);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [attemptCount, isAdmin, isDefinitelyNotAdmin, refetch]);

  // Handle authentication and authorization with clear action flow
  useEffect(() => {
    if (isLoading || !hasCheckedAdmin) {
      // Still loading or hasn't done initial check yet
      return;
    }

    console.log("AdminRoute - Current state:", { 
      isAuthenticated, 
      isAdmin,
      isDefinitelyNotAdmin,
      hasCheckedAdmin,
      isLoading,
      path: location.pathname
    });
    
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

    // Then check admin status (after loading is complete and admin check done)
    if (isDefinitelyNotAdmin) {
      console.log("User is definitely not an admin, redirecting to dashboard");
      toast({
        title: "Acesso restrito",
        description: "Você não tem permissão para acessar a área administrativa.",
        variant: "destructive",
      });
      navigate("/dashboard", { replace: true });
      return;
    }
    
    // If we still don't know admin status after checks, try one more time
    if (!isAdmin && attemptCount === 0) {
      console.log("AdminRoute - Initial admin check inconclusive, retrying");
      setAttemptCount(1);
    }
  }, [
    isAuthenticated, 
    isAdmin, 
    isDefinitelyNotAdmin,
    isLoading, 
    hasCheckedAdmin,
    navigate, 
    location.pathname, 
    attemptCount
  ]);

  // Show a loading state while checking permissions
  if (isLoading || !hasCheckedAdmin || (!isAdmin && !isDefinitelyNotAdmin && attemptCount < 3)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="ml-2 text-sm text-muted-foreground">Verificando permissões...</p>
      </div>
    );
  }

  // Show loading while redirecting
  if (!isAuthenticated || isDefinitelyNotAdmin) {
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
