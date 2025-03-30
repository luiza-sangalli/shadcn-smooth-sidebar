
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "@/components/ui/use-toast";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [hasCheckedPermissions, setHasCheckedPermissions] = useState(false);
  
  const isLoading = authLoading || roleLoading;

  useEffect(() => {
    console.log("AdminRoute - Auth status:", { 
      isAuthenticated, 
      isAdmin, 
      isLoading,
      authLoading,
      roleLoading,
      hasCheckedPermissions
    });
  }, [isAuthenticated, isAdmin, isLoading, authLoading, roleLoading, hasCheckedPermissions]);

  // Only check permissions when loading is complete
  useEffect(() => {
    if (isLoading) {
      return; // Wait until we're done loading
    }

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

    if (!isAdmin) {
      console.log("User is not an admin, redirecting to dashboard");
      toast({
        title: "Acesso restrito",
        description: "Você não tem permissão para acessar a área administrativa.",
        variant: "destructive",
      });
      navigate("/dashboard", { replace: true });
      return;
    }

    // If we get here, user is authenticated and is an admin
    console.log("User is authenticated and is an admin, allowing access");
    setHasCheckedPermissions(true);
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p className="ml-2 text-sm text-muted-foreground">Verificando permissões...</p>
      </div>
    );
  }

  // Only render children if we've confirmed the user has admin permissions
  if (hasCheckedPermissions && isAuthenticated && isAdmin) {
    console.log("Rendering admin page content");
    return <>{children}</>;
  }

  // Show loading while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      <p className="ml-2 text-sm text-muted-foreground">Redirecionando...</p>
    </div>
  );
};

export default AdminRoute;
