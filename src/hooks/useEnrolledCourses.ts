
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Course, Enrollment, Progress } from "@/types";
import { useToast } from "./use-toast";

export interface EnrolledCourse extends Course {
  enrollment: Enrollment;
  progress: number;
  lastAccessed?: string;
  completedLessons: number;
  totalLessons: number;
}

export function useEnrolledCourses(showArchived = false) {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchEnrolledCourses() {
      try {
        setLoading(true);

        // Fetch enrollments for the current user
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from("enrollments")
          .select("*")
          .eq("user_id", user.id);

        if (enrollmentsError) throw enrollmentsError;

        if (!enrollments || enrollments.length === 0) {
          setEnrolledCourses([]);
          return;
        }

        // Get course IDs from enrollments
        const courseIds = enrollments.map((enrollment) => enrollment.course_id);

        // Fetch courses based on enrollment course IDs
        const { data: courses, error: coursesError } = await supabase
          .from("courses")
          .select("*")
          .in("id", courseIds);

        if (coursesError) throw coursesError;

        // Fetch modules for these courses to get total lesson count
        const { data: modules, error: modulesError } = await supabase
          .from("modules")
          .select("*")
          .in("course_id", courseIds);

        if (modulesError) throw modulesError;

        // Get module IDs to fetch videos
        const moduleIds = modules ? modules.map(module => module.id) : [];
        
        // Fetch videos to calculate total lessons per course
        const { data: videos, error: videosError } = moduleIds.length > 0 
          ? await supabase
              .from("videos")
              .select("*")
              .in("module_id", moduleIds)
          : { data: [], error: null };

        if (videosError) throw videosError;

        // Fetch progress records for this user
        const { data: progressData, error: progressError } = await supabase
          .from("progress")
          .select("*")
          .eq("user_id", user.id);

        if (progressError) throw progressError;

        // Build enriched course objects
        const enrichedCourses = courses.map(course => {
          // Find enrollment for this course
          const enrollment = enrollments.find(e => e.course_id === course.id);
          
          // Get modules for this course
          const courseModules = modules.filter(m => m.course_id === course.id);
          
          // Get all video IDs for this course
          const courseModuleIds = courseModules.map(m => m.id);
          const courseVideos = videos.filter(v => courseModuleIds.includes(v.module_id));
          
          // Count total and completed lessons
          const totalLessons = courseVideos.length;
          
          // Get progress for videos in this course
          const videoIds = courseVideos.map(v => v.id);
          const courseProgress = progressData.filter(p => 
            videoIds.includes(p.video_id)
          );
          
          const completedLessons = courseProgress.filter(p => p.completed).length;
          
          // Calculate overall progress percentage
          const progress = totalLessons > 0 
            ? Math.round((completedLessons / totalLessons) * 100) 
            : 0;
          
          // Find last accessed date
          let lastAccessed: string | undefined = undefined;
          if (courseProgress.length > 0) {
            const lastWatched = courseProgress.reduce((latest, current) => {
              const currentDate = new Date(current.last_watched_at);
              return latest > currentDate ? latest : currentDate;
            }, new Date(0));
            
            if (lastWatched.getTime() > 0) {
              lastAccessed = lastWatched.toISOString().split('T')[0];
            }
          }
          
          // Create the enriched course object
          return {
            ...course,
            enrollment: enrollment!,
            progress,
            lastAccessed,
            completedLessons,
            totalLessons,
            // Mark as archived based on some criteria - this would need to be stored in the database
            // For now we'll assume enrollments are never archived
            isArchived: false
          };
        });

        // Filter by archived status if needed
        const filteredCourses = showArchived 
          ? enrichedCourses.filter(course => course.isArchived) 
          : enrichedCourses.filter(course => !course.isArchived);

        setEnrolledCourses(filteredCourses);
      } catch (err) {
        console.error("Error fetching enrolled courses:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch enrolled courses"));
        toast({
          title: "Error",
          description: "Failed to load your courses. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchEnrolledCourses();
  }, [user, toast, showArchived]);

  return { enrolledCourses, loading, error };
}
