
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
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && isAuthenticated,
  });
  
  useEffect(() => {
    if (userRoles) {
      setIsAdmin(userRoles.some(r => r.role === "admin"));
    }
  }, [userRoles]);
  
  return {
    isAdmin,
    userRoles,
    isLoading,
  };
}
