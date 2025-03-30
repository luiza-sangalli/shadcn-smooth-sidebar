
import React, { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  
  const isLoading = authLoading || roleLoading;

  useEffect(() => {
    console.log("AdminRoute - Auth status:", { 
      isAuthenticated, 
      isAdmin, 
      isLoading,
      authLoading,
      roleLoading
    });
  }, [isAuthenticated, isAdmin, isLoading, authLoading, roleLoading]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log("User is not authenticated, redirecting to login");
      navigate("/login", { replace: true });
    } else if (!isLoading && isAuthenticated && !isAdmin) {
      console.log("User is not an admin, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be redirected by useEffect
  }
  
  if (!isAdmin) {
    return null; // Will be redirected by useEffect
  }

  console.log("User is admin, allowing access to admin page");
  return <>{children}</>;
};

export default AdminRoute;
