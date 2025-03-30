
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types";
import { useToast } from "./use-toast";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("courses")
          .select("*");

        if (error) {
          throw error;
        }

        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch courses"));
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [toast]);

  return { courses, loading, error };
}
