
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export type CourseInput = {
  title: string;
  description: string;
  instructor: string;
  price: number;
  thumbnail_url?: string;
  is_published?: boolean;
  category?: string;
};

export type ModuleInput = {
  course_id: string;
  title: string;
  description?: string;
  position: number;
  is_published?: boolean;
};

export type VideoInput = {
  module_id: string;
  title: string;
  description?: string;
  duration: string;
  video_url: string;
  position: number;
  thumbnail_url?: string;
  is_published?: boolean;
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

  // Update course
  const updateCourse = async (courseId: string, courseData: Partial<CourseInput>) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("courses")
        .update(courseData)
        .eq("id", courseId)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Curso atualizado",
        description: "O curso foi atualizado com sucesso!",
      });
      
      return data;
    } catch (error) {
      console.error("Erro ao atualizar curso:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o curso. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete course
  const deleteCourse = async (courseId: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);
      
      if (error) throw error;
      
      toast({
        title: "Curso excluído",
        description: "O curso foi excluído com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir curso:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o curso. Verifique se há módulos associados.",
        variant: "destructive",
      });
      return false;
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

  // Update module
  const updateModule = async (moduleId: string, moduleData: Partial<ModuleInput>) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("modules")
        .update(moduleData)
        .eq("id", moduleId)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Módulo atualizado",
        description: "O módulo foi atualizado com sucesso!",
      });
      
      return data;
    } catch (error) {
      console.error("Erro ao atualizar módulo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o módulo. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete module
  const deleteModule = async (moduleId: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("modules")
        .delete()
        .eq("id", moduleId);
      
      if (error) throw error;
      
      toast({
        title: "Módulo excluído",
        description: "O módulo foi excluído com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir módulo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o módulo. Verifique se há vídeos associados.",
        variant: "destructive",
      });
      return false;
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

  // Update video
  const updateVideo = async (videoId: string, videoData: Partial<VideoInput>) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("videos")
        .update(videoData)
        .eq("id", videoId)
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Vídeo atualizado",
        description: "O vídeo foi atualizado com sucesso!",
      });
      
      return data;
    } catch (error) {
      console.error("Erro ao atualizar vídeo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o vídeo. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete video
  const deleteVideo = async (videoId: string) => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", videoId);
      
      if (error) throw error;
      
      toast({
        title: "Vídeo excluído",
        description: "O vídeo foi excluído com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir vídeo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o vídeo. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createCourse,
    updateCourse,
    deleteCourse,
    createModule,
    updateModule,
    deleteModule,
    createVideo,
    updateVideo,
    deleteVideo
  };
}
