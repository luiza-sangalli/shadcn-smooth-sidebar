
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

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

  // Handle redirects when loading is complete
  useEffect(() => {
    if (isLoading) {
      return; // Wait until we're done loading
    }

    if (!isAuthenticated) {
      console.log("User is not authenticated, redirecting to login");
      navigate("/login", { replace: true });
      return;
    }

    if (!isAdmin) {
      console.log("User is not an admin, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
      return;
    }

    // If we get here, user is authenticated and is an admin
    console.log("User is authenticated and is an admin, allowing access");
    setHasCheckedPermissions(true);
  }, [isAuthenticated, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
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
    </div>
  );
};

export default AdminRoute;
