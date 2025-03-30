
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type UserRole = "admin" | "user";

export function useUserRole() {
  const { user, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id) return [];
      
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
    staleTime: 60000, // 1 minute
  });
  
  useEffect(() => {
    if (userRoles) {
      const hasAdminRole = userRoles.some(r => r.role === "admin");
      console.log("Is admin:", hasAdminRole);
      setIsAdmin(hasAdminRole);
    }
  }, [userRoles]);
  
  return {
    isAdmin,
    userRoles,
    isLoading,
  };
}
