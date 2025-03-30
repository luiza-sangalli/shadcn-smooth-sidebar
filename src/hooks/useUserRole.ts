
import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type UserRole = "admin" | "user";

export function useUserRole() {
  const { user, isAuthenticated } = useAuth();
  const [adminStatus, setAdminStatus] = useState<boolean | null>(null);
  
  // Using a more reliable query approach with better caching and manual control
  const { 
    data: userRoles, 
    isLoading, 
    refetch,
    isError,
    isSuccess
  } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) {
        console.log("Not fetching roles: user not authenticated or missing ID");
        return [];
      }
      
      console.log("Fetching roles for user:", user.id);
      
      // Use a fresh client instance to avoid caching issues
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
    staleTime: 0, // No stale time to ensure fresh data every refetch
    gcTime: 5000, // Short cache time before garbage collection (replaces cacheTime)
  });
  
  // Force a refetch with stronger cache busting
  const forceRefresh = useCallback(async () => {
    console.log("Forcing admin role refresh");
    // Clear cache and reload data
    return await refetch({ cancelRefetch: true });
  }, [refetch]);
  
  // Update admin status whenever role data changes or loads
  useEffect(() => {
    if (isSuccess && userRoles) {
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
  }, [userRoles, isLoading, isError, isSuccess]);

  // Reliable admin status with clear state indication
  const isAdmin = adminStatus === true;
  const isDefinitelyNotAdmin = adminStatus === false;
  const isAdminStatusLoading = adminStatus === null || isLoading;
  
  return {
    isAdmin,
    isDefinitelyNotAdmin,
    isAdminStatusLoading,
    userRoles,
    isLoading,
    refetch: forceRefresh,
    // Debug data - helpful for troubleshooting
    _debug: {
      adminStatus,
      userRolesData: userRoles,
      authUser: user?.id
    }
  };
}
