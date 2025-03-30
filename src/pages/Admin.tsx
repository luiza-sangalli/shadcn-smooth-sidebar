
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCourses, CourseInput, ModuleInput, VideoInput } from "@/hooks/useAdminCourses";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Book, Folder, Video, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { user } = useAuth();
  const { isLoading, createCourse, createModule, createVideo } = useAdminCourses();
  const { toast } = useToast();
  
  // State for new course form
  const [newCourse, setNewCourse] = useState<CourseInput>({
    title: "",
    description: "",
    instructor: user?.name || "",
    price: 0,
  });

  // State for new module form
  const [newModule, setNewModule] = useState<Omit<ModuleInput, "course_id">>({
    title: "",
    description: "",
    position: 0,
  });
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // State for new video form
  const [newVideo, setNewVideo] = useState<Omit<VideoInput, "module_id">>({
    title: "",
    description: "",
    duration: "00:00",
    video_url: "",
    position: 0,
  });
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");

  // Fetch all courses
  const { data: courses, refetch: refetchCourses } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all modules
  const { data: modules, refetch: refetchModules } = useQuery({
    queryKey: ["admin-modules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all videos
  const { data: videos } = useQuery({
    queryKey: ["admin-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Handle course creation
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title || !newCourse.instructor) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o título e o instrutor.",
        variant: "destructive",
      });
      return;
    }

    const course = await createCourse(newCourse);
    if (course) {
      setNewCourse({
        title: "",
        description: "",
        instructor: user?.name || "",
        price: 0,
      });
      refetchCourses();
    }
  };

  // Handle module creation
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModule.title || !selectedCourseId) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um curso e preencha pelo menos o título do módulo.",
        variant: "destructive",
      });
      return;
    }

    const moduleData: ModuleInput = {
      ...newModule,
      course_id: selectedCourseId,
    };

    const module = await createModule(moduleData);
    if (module) {
      setNewModule({
        title: "",
        description: "",
        position: 0,
      });
      refetchModules();
    }
  };

  // Handle video creation
  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.title || !newVideo.video_url || !selectedModuleId) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um módulo e preencha pelo menos o título e a URL do vídeo.",
        variant: "destructive",
      });
      return;
    }

    const videoData: VideoInput = {
      ...newVideo,
      module_id: selectedModuleId,
    };

    const video = await createVideo(videoData);
    if (video) {
      setNewVideo({
        title: "",
        description: "",
        duration: "00:00",
        video_url: "",
        position: 0,
      });
    }
  };

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-8">Painel de Administração</h1>
      
      <Tabs defaultValue="courses">
        <TabsList className="mb-6">
          <TabsTrigger value="courses">Cursos</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="videos">Vídeos</TabsTrigger>
        </TabsList>
        
        {/* CURSOS */}
        <TabsContent value="courses">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form to create a new course */}
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Curso</CardTitle>
                <CardDescription>Crie um novo curso na plataforma</CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateCourse}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título*</Label>
                    <Input 
                      id="title" 
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                      placeholder="Ex: JavaScript Avançado"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea 
                      id="description" 
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                      placeholder="Descreva o curso"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instrutor*</Label>
                    <Input 
                      id="instructor" 
                      value={newCourse.instructor}
                      onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                      placeholder="Nome do instrutor"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input 
                      id="price" 
                      type="number"
                      min="0"
                      step="0.01"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse({...newCourse, price: parseFloat(e.target.value)})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">URL da Imagem (Thumbnail)</Label>
                    <Input 
                      id="thumbnail" 
                      value={newCourse.thumbnail_url || ""}
                      onChange={(e) => setNewCourse({...newCourse, thumbnail_url: e.target.value})}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Curso
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            {/* List of existing courses */}
            <Card>
              <CardHeader>
                <CardTitle>Cursos Existentes</CardTitle>
                <CardDescription>
                  {courses?.length || 0} cursos na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {courses?.map((course) => (
                    <AccordionItem key={course.id} value={course.id}>
                      <AccordionTrigger className="flex items-center">
                        <span className="flex items-center">
                          <Book className="mr-2 h-4 w-4" />
                          {course.title}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p><strong>ID:</strong> {course.id}</p>
                          <p><strong>Instrutor:</strong> {course.instructor}</p>
                          <p><strong>Preço:</strong> R$ {course.price.toFixed(2)}</p>
                          {course.description && (
                            <p><strong>Descrição:</strong> {course.description}</p>
                          )}
                          <p><strong>Criado em:</strong> {new Date(course.created_at).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* MÓDULOS */}
        <TabsContent value="modules">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form to create a new module */}
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Módulo</CardTitle>
                <CardDescription>Crie um novo módulo para um curso</CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateModule}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="courseSelect">Selecione o Curso*</Label>
                    <select 
                      id="courseSelect"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={selectedCourseId}
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                      required
                    >
                      <option value="">Selecione um curso</option>
                      {courses?.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="moduleTitle">Título do Módulo*</Label>
                    <Input 
                      id="moduleTitle" 
                      value={newModule.title}
                      onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                      placeholder="Ex: Introdução ao JavaScript"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="moduleDescription">Descrição do Módulo</Label>
                    <Textarea 
                      id="moduleDescription" 
                      value={newModule.description || ""}
                      onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                      placeholder="Descreva o módulo"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="modulePosition">Posição</Label>
                    <Input 
                      id="modulePosition" 
                      type="number"
                      min="0"
                      value={newModule.position}
                      onChange={(e) => setNewModule({...newModule, position: parseInt(e.target.value)})}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Módulo
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            {/* List of existing modules */}
            <Card>
              <CardHeader>
                <CardTitle>Módulos Existentes</CardTitle>
                <CardDescription>
                  {modules?.length || 0} módulos na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {modules?.map((module) => {
                    const courseInfo = courses?.find(c => c.id === module.course_id);
                    return (
                      <AccordionItem key={module.id} value={module.id}>
                        <AccordionTrigger className="flex items-center">
                          <span className="flex items-center">
                            <Folder className="mr-2 h-4 w-4" />
                            {module.title}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p><strong>ID:</strong> {module.id}</p>
                            <p><strong>Curso:</strong> {courseInfo?.title || module.course_id}</p>
                            <p><strong>Posição:</strong> {module.position}</p>
                            {module.description && (
                              <p><strong>Descrição:</strong> {module.description}</p>
                            )}
                            <p><strong>Criado em:</strong> {new Date(module.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* VÍDEOS */}
        <TabsContent value="videos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form to create a new video */}
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Vídeo</CardTitle>
                <CardDescription>Crie um novo vídeo para um módulo</CardDescription>
              </CardHeader>
              <form onSubmit={handleCreateVideo}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="moduleSelect">Selecione o Módulo*</Label>
                    <select 
                      id="moduleSelect"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                      value={selectedModuleId}
                      onChange={(e) => setSelectedModuleId(e.target.value)}
                      required
                    >
                      <option value="">Selecione um módulo</option>
                      {modules?.map((module) => {
                        const courseInfo = courses?.find(c => c.id === module.course_id);
                        return (
                          <option key={module.id} value={module.id}>
                            {courseInfo?.title ? `${courseInfo.title} - ` : ""}{module.title}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="videoTitle">Título do Vídeo*</Label>
                    <Input 
                      id="videoTitle" 
                      value={newVideo.title}
                      onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                      placeholder="Ex: Introdução às Variáveis"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="videoDescription">Descrição do Vídeo</Label>
                    <Textarea 
                      id="videoDescription" 
                      value={newVideo.description || ""}
                      onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                      placeholder="Descreva o vídeo"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="videoDuration">Duração (formato: MM:SS ou HH:MM:SS)*</Label>
                    <Input 
                      id="videoDuration" 
                      value={newVideo.duration}
                      onChange={(e) => setNewVideo({...newVideo, duration: e.target.value})}
                      placeholder="Ex: 10:30"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">URL do Vídeo*</Label>
                    <Input 
                      id="videoUrl" 
                      value={newVideo.video_url}
                      onChange={(e) => setNewVideo({...newVideo, video_url: e.target.value})}
                      placeholder="https://exemplo.com/video.mp4"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="videoThumbnail">URL da Imagem de Capa</Label>
                    <Input 
                      id="videoThumbnail" 
                      value={newVideo.thumbnail_url || ""}
                      onChange={(e) => setNewVideo({...newVideo, thumbnail_url: e.target.value})}
                      placeholder="https://exemplo.com/thumbnail.jpg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="videoPosition">Posição</Label>
                    <Input 
                      id="videoPosition" 
                      type="number"
                      min="0"
                      value={newVideo.position}
                      onChange={(e) => setNewVideo({...newVideo, position: parseInt(e.target.value)})}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isLoading}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Vídeo
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            {/* List of existing videos */}
            <Card>
              <CardHeader>
                <CardTitle>Vídeos Existentes</CardTitle>
                <CardDescription>
                  {videos?.length || 0} vídeos na plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {videos?.map((video) => {
                    const moduleInfo = modules?.find(m => m.id === video.module_id);
                    return (
                      <AccordionItem key={video.id} value={video.id}>
                        <AccordionTrigger className="flex items-center">
                          <span className="flex items-center">
                            <Video className="mr-2 h-4 w-4" />
                            {video.title}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p><strong>ID:</strong> {video.id}</p>
                            <p><strong>Módulo:</strong> {moduleInfo?.title || video.module_id}</p>
                            <p><strong>Duração:</strong> {video.duration}</p>
                            <p><strong>Posição:</strong> {video.position}</p>
                            {video.description && (
                              <p><strong>Descrição:</strong> {video.description}</p>
                            )}
                            <p>
                              <strong>URL:</strong>{" "}
                              <a 
                                href={video.video_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                              >
                                {video.video_url.substring(0, 30)}...
                              </a>
                            </p>
                            <p><strong>Criado em:</strong> {new Date(video.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
