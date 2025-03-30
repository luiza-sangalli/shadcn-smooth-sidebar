
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
        
        // For mock auth, create a mock profile since we don't have a real Supabase profile
        if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
          console.log("Creating mock profile with user data:", user);
          const mockProfile: Profile = {
            id: user.id,
            name: user.name || "",
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
        
        // Fetch from Supabase
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        console.log("Fetched profile data:", data);
        console.log("User data:", user);

        // Add email from auth user to profile
        const enhancedProfile: Profile = {
          ...data,
          email: user.email,
          name: data.name || user.name || ""
        };
        
        setProfile(enhancedProfile);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch profile"));
        toast({
          title: "Error",
          description: "Failed to load your profile. Please try again later.",
          variant: "destructive",
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
        title: "Error",
        description: "You must be logged in to update your profile.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // In development with mock auth, just update the state
      if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
        const updatedProfile = {
          ...profile,
          ...updatedData,
          updated_at: new Date().toISOString()
        };
        
        setProfile(updatedProfile);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully."
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

      if (error) throw error;

      // Update the local state
      setProfile((prev) => prev ? { ...prev, ...updatedData } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, updateProfile };
}
