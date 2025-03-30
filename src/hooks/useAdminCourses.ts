
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export type CourseInput = {
  title: string;
  description: string;
  instructor: string;
  price: number;
  thumbnail_url?: string;
};

export type ModuleInput = {
  course_id: string;
  title: string;
  description?: string;
  position: number;
};

export type VideoInput = {
  module_id: string;
  title: string;
  description?: string;
  duration: string;
  video_url: string;
  position: number;
  thumbnail_url?: string;
};

export function useAdminCourses() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Create course
  const createCourse = async (courseData: CourseInput) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("courses")
        .insert(courseData)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Curso criado",
        description: "O curso foi criado com sucesso!",
      });
      
      return data;
    } catch (error) {
      console.error("Erro ao criar curso:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o curso. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create module
  const createModule = async (moduleData: ModuleInput) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("modules")
        .insert(moduleData)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Módulo criado",
        description: "O módulo foi criado com sucesso!",
      });
      
      return data;
    } catch (error) {
      console.error("Erro ao criar módulo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o módulo. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create video
  const createVideo = async (videoData: VideoInput) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("videos")
        .insert(videoData)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Vídeo criado",
        description: "O vídeo foi criado com sucesso!",
      });
      
      return data;
    } catch (error) {
      console.error("Erro ao criar vídeo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o vídeo. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createCourse,
    createModule,
    createVideo
  };
}
