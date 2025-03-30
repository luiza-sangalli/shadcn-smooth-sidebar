
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type UserRole = "admin" | "user";

export function useUserRole() {
  const { user, isAuthenticated } = useAuth();
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);
  
  const { 
    data: userRoles, 
    isLoading, 
    refetch,
    isError
  } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) {
        console.log("Not fetching roles: user not authenticated or missing ID");
        return [];
      }
      
      console.log("Fetching roles for user:", user.id);
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
        
      if (error) {
        console.error("Error fetching user roles:", error);
        throw error;
      }
      
      console.log("User roles fetched:", data);
      return data || [];
    },
    enabled: !!user?.id && isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: 5000, // Reduced to 5 seconds for more frequent refreshes
  });
  
  // Update admin status whenever role data changes or loads
  useEffect(() => {
    if (userRoles) {
      const hasAdminRole = userRoles.some(r => r.role === "admin");
      console.log("Admin status determined:", hasAdminRole, "User roles:", userRoles);
      setAdminStatus(hasAdminRole);
    } else if (isError) {
      console.error("Error loading roles, defaulting to non-admin");
      setAdminStatus(false);
    } else if (!isLoading && !userRoles?.length) {
      // If query completed but no roles found
      console.log("No roles found, user is not admin");
      setAdminStatus(false);
    }
  }, [userRoles, isLoading, isError]);

  // Ensure we expose a reliable admin status
  const isAdmin = adminStatus === true;
  
  return {
    isAdmin,
    userRoles,
    isLoading,
    refetch,
    // Debug data - helpful for troubleshooting
    _debug: {
      adminStatus,
      userRolesData: userRoles,
      authUser: user?.id
    }
  };
}
