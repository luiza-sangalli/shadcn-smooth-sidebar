
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Profile } from "@/types";
import { useToast } from "./use-toast";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch profile data
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      try {
        setLoading(true);
        console.log("Fetching profile for user:", user);
        
        // For mock auth, create a mock profile since we don't have a real Supabase profile
        if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
          console.log("Creating mock profile with user data:", user);
          const mockProfile: Profile = {
            id: user.id,
            name: user?.name || user?.email?.split('@')[0] || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            avatar_url: null,
            email: user.email,
            whatsapp: "(11) 99999-9999",
            documentType: "cpf",
            documentNumber: "123.456.789-00"
          };
          
          setProfile(mockProfile);
          setLoading(false);
          return;
        }
        
        // In production, try to fetch from Supabase
        console.log("Attempting to fetch profile from Supabase for user ID:", user.id);
        
        // Check if user ID is in UUID format for Supabase
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
        
        if (!isUUID) {
          console.log("User ID is not in UUID format. Creating mock profile for production.");
          // If not a UUID (like in mock auth), create a mock profile
          const mockProfile: Profile = {
            id: user.id,
            name: user?.name || user?.email?.split('@')[0] || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            avatar_url: null,
            email: user.email,
            whatsapp: "",
            documentType: "cpf",
            documentNumber: ""
          };
          
          setProfile(mockProfile);
          setLoading(false);
          return;
        }
        
        // Fetch from Supabase
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Supabase query error:", error);
          throw error;
        }

        console.log("Fetched profile data:", data);
        console.log("User data:", user);

        // Add email from auth user to profile
        const enhancedProfile: Profile = {
          ...data,
          email: user.email,
          name: data.name || user?.name || user?.email?.split('@')[0] || ""
        };
        
        setProfile(enhancedProfile);
      } catch (err) {
        console.error("Error fetching profile:", err);
        
        // Create a fallback profile if fetch fails
        if (user) {
          console.log("Creating fallback profile due to fetch error");
          const fallbackProfile: Profile = {
            id: user.id,
            name: user?.name || user?.email?.split('@')[0] || "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            avatar_url: null,
            email: user.email,
            whatsapp: "",
            documentType: "cpf",
            documentNumber: ""
          };
          
          setProfile(fallbackProfile);
        }
        
        setError(err instanceof Error ? err : new Error("Failed to fetch profile"));
        toast({
          title: "Aviso",
          description: "Usando perfil padrão. Alguns dados podem não estar disponíveis.",
          variant: "default",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [user, toast]);

  // Update profile function
  const updateProfile = async (updatedData: Partial<Profile>) => {
    if (!user || !profile) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para atualizar seu perfil.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("Updating profile for user:", user.id);
      console.log("Update data:", updatedData);
      
      // In development with mock auth, just update the state
      if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
        const updatedProfile = {
          ...profile,
          ...updatedData,
          updated_at: new Date().toISOString()
        };
        
        setProfile(updatedProfile);
        toast({
          title: "Perfil atualizado",
          description: "Seu perfil foi atualizado com sucesso."
        });
        
        return;
      }
      
      // Check if user ID is in UUID format
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
      
      if (!isUUID) {
        console.log("User ID is not in UUID format. Updating mock profile for production.");
        // If not a UUID, just update the local state
        const updatedProfile = {
          ...profile,
          ...updatedData,
          updated_at: new Date().toISOString()
        };
        
        setProfile(updatedProfile);
        toast({
          title: "Perfil atualizado",
          description: "Seu perfil foi atualizado com sucesso."
        });
        
        return;
      }
      
      // Update in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          name: updatedData.name,
          avatar_url: updatedData.avatar_url,
          updated_at: new Date().toISOString(),
          // Add any additional fields that need to be updated
          whatsapp: updatedData.whatsapp,
          socialName: updatedData.socialName,
          documentType: updatedData.documentType,
          documentNumber: updatedData.documentNumber,
          companyName: updatedData.companyName,
          address: updatedData.address,
          city: updatedData.city,
          state: updatedData.state,
          zipCode: updatedData.zipCode
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating profile in Supabase:", error);
        throw error;
      }

      // Update the local state
      setProfile((prev) => prev ? { ...prev, ...updatedData } : null);
      
      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso."
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Falha na atualização",
        description: "Não foi possível atualizar seu perfil. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, updateProfile };
}
