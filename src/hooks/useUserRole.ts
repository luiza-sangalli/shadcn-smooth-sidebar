import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type UserRole = "admin" | "user";

export function useUserRole() {
  const { user, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  const { data: userRoles, isLoading, refetch } = useQuery({
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
    staleTime: 30000, // 30 seconds
  });
  
  useEffect(() => {
    if (!isLoading && userRoles) {
      const hasAdminRole = userRoles.some(r => r.role === "admin");
      console.log("Is admin determined:", hasAdminRole, "User roles:", userRoles);
      setIsAdmin(hasAdminRole);
    } else if (isLoading) {
      // Keep as null while loading
      setIsAdmin(null);
    } else {
      // If not loading and no roles, definitely not admin
      setIsAdmin(false);
    }
  }, [userRoles, isLoading]);
  
  return {
    isAdmin: isAdmin === null ? false : isAdmin, // Default to false if null
    isDefinitelyAdmin: isAdmin === true, // Only true when we know for sure
    userRoles,
    isLoading,
    refetch
  };
}
