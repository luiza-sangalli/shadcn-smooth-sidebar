
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CourseWithContent, ModuleWithVideos } from "@/types";
import { useToast } from "./use-toast";

export function useCourseContent(courseId: string | undefined) {
  const [course, setCourse] = useState<CourseWithContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    async function fetchCourseContent() {
      try {
        setLoading(true);
        
        // Fetch the course
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();
        
        if (courseError) throw courseError;
        
        // Fetch modules for this course
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("*")
          .eq("course_id", courseId)
          .order("position", { ascending: true });
        
        if (modulesError) throw modulesError;
        
        // Fetch videos for all modules
        const moduleIds = modulesData.map(module => module.id);
        
        if (moduleIds.length > 0) {
          const { data: videosData, error: videosError } = await supabase
            .from("videos")
            .select("*")
            .in("module_id", moduleIds)
            .order("position", { ascending: true });
          
          if (videosError) throw videosError;
          
          // Group videos by module
          const modulesWithVideos: ModuleWithVideos[] = modulesData.map(module => ({
            ...module,
            videos: videosData.filter(video => video.module_id === module.id)
          }));
          
          // Complete course with modules and videos
          setCourse({
            ...courseData,
            modules: modulesWithVideos
          });
        } else {
          // Course has no modules
          setCourse({
            ...courseData,
            modules: []
          });
        }
      } catch (err) {
        console.error("Error fetching course content:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch course content"));
        toast({
          title: "Error",
          description: "Failed to load course content. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCourseContent();
  }, [courseId, toast]);

  return { course, loading, error };
}
