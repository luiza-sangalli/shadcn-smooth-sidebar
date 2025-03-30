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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Book, Folder, Video, Plus, Edit, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Esquemas de validação
const courseSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  instructor: z.string().min(3, { message: "O nome do instrutor deve ter pelo menos 3 caracteres" }),
  price: z.coerce.number().min(0, { message: "O preço não pode ser negativo" }),
  thumbnail_url: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
  is_published: z.boolean().default(true),
  category: z.string().optional(),
});

const moduleSchema = z.object({
  course_id: z.string().uuid({ message: "Selecione um curso válido" }),
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  position: z.coerce.number().min(0, { message: "A posição não pode ser negativa" }),
  is_published: z.boolean().default(true),
});

const videoSchema = z.object({
  module_id: z.string().uuid({ message: "Selecione um módulo válido" }),
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  duration: z.string().min(4, { message: "Formato inválido, use MM:SS ou HH:MM:SS" }),
  video_url: z.string().url({ message: "URL inválida" }),
  position: z.coerce.number().min(0, { message: "A posição não pode ser negativa" }),
  thumbnail_url: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
  is_published: z.boolean().default(true),
});

type CourseForm = z.infer<typeof courseSchema>;
type ModuleForm = z.infer<typeof moduleSchema>;
type VideoForm = z.infer<typeof videoSchema>;

const CATEGORIES = [
  "Programação",
  "Design",
  "Marketing",
  "Negócios",
  "Música",
  "Fotografia",
  "Saúde",
  "Educação",
  "Desenvolvimento Pessoal",
  "Outros"
];

const Admin = () => {
  const { user } = useAuth();
  const { 
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
  } = useAdminCourses();
  const { toast } = useToast();

  // Estados para os formulários de edição
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  
  // Estado para os formulários de criação
  const [activeTab, setActiveTab] = useState("courses");

  // Formulário de curso
  const courseForm = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      instructor: user?.name || "",
      price: 0,
      thumbnail_url: "",
      is_published: true,
      category: "",
    },
  });

  // Formulário de módulo
  const moduleForm = useForm<ModuleForm>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      course_id: "",
      title: "",
      description: "",
      position: 0,
      is_published: true,
    },
  });

  // Formulário de vídeo
  const videoForm = useForm<VideoForm>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      module_id: "",
      title: "",
      description: "",
      duration: "00:00",
      video_url: "",
      position: 0,
      thumbnail_url: "",
      is_published: true,
    },
  });

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
  const { data: videos, refetch: refetchData } = useQuery({
    queryKey: ["admin-videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;
      // Adicionar a propriedade is_published a cada vídeo baseado no published_at
      return (data || []).map(video => ({
        ...video,
        is_published: !!video.published_at
      }));
    },
  });

  // Resetar os formulários
  const resetForms = () => {
    courseForm.reset({
      title: "",
      description: "",
      instructor: user?.name || "",
      price: 0,
      thumbnail_url: "",
      is_published: true,
      category: "",
    });
    
    moduleForm.reset({
      course_id: "",
      title: "",
      description: "",
      position: 0,
      is_published: true,
    });
    
    videoForm.reset({
      module_id: "",
      title: "",
      description: "",
      duration: "00:00",
      video_url: "",
      position: 0,
      thumbnail_url: "",
      is_published: true,
    });
  };

  // Handle course creation
  const handleCreateCourse = async (data: CourseForm) => {
    const course = await createCourse(data as CourseInput);
    if (course) {
      resetForms();
      refetchCourses();
    }
  };

  // Handle module creation
  const handleCreateModule = async (data: ModuleForm) => {
    const module = await createModule(data as ModuleInput);
    if (module) {
      resetForms();
      refetchModules();
    }
  };

  // Handle video creation
  const handleCreateVideo = async (data: VideoForm) => {
    const video = await createVideo(data as VideoInput);
    if (video) {
      resetForms();
      refetchData();
    }
  };

  // Preparar curso para edição
  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    courseForm.reset({
      title: course.title,
      description: course.description || "",
      instructor: course.instructor,
      price: course.price,
      thumbnail_url: course.thumbnail_url || "",
      is_published: course.is_published !== false,
      category: course.category || "",
    });
  };

  // Atualizar curso
  const handleUpdateCourse = async (data: CourseForm) => {
    if (!editingCourse) return;
    
    const updated = await updateCourse(editingCourse.id, data as CourseInput);
    if (updated) {
      setEditingCourse(null);
      resetForms();
      refetchCourses();
    }
  };

  // Preparar módulo para edição
  const handleEditModule = (module: any) => {
    setEditingModule(module);
    moduleForm.reset({
      course_id: module.course_id,
      title: module.title,
      description: module.description || "",
      position: module.position,
      is_published: module.is_published !== false,
    });
  };

  // Atualizar módulo
  const handleUpdateModule = async (data: ModuleForm) => {
    if (!editingModule) return;
    
    const updated = await updateModule(editingModule.id, data as ModuleInput);
    if (updated) {
      setEditingModule(null);
      resetForms();
      refetchModules();
    }
  };

  // Preparar vídeo para edição
  const handleEditVideo = (video: any) => {
    setEditingVideo(video);
    videoForm.reset({
      module_id: video.module_id,
      title: video.title,
      description: video.description || "",
      duration: video.duration,
      video_url: video.video_url,
      position: video.position,
      thumbnail_url: video.thumbnail_url || "",
      is_published: video.is_published !== false,
    });
  };

  // Atualizar vídeo
  const handleUpdateVideo = async (data: VideoForm) => {
    if (!editingVideo) return;
    
    const updated = await updateVideo(editingVideo.id, data as VideoInput);
    if (updated) {
      setEditingVideo(null);
      resetForms();
      refetchData();
    }
  };

  // Excluir curso
  const handleDeleteCourse = async (courseId: string) => {
    const success = await deleteCourse(courseId);
    if (success) {
      refetchCourses();
    }
  };

  // Excluir módulo
  const handleDeleteModule = async (moduleId: string) => {
    const success = await deleteModule(moduleId);
    if (success) {
      refetchModules();
    }
  };

  // Excluir vídeo
  const handleDeleteVideo = async (videoId: string) => {
    const success = await deleteVideo(videoId);
    if (success) {
      refetchData();
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <h1 className="text-3xl font-bold mb-8">Painel de Administração</h1>
      
      <Tabs defaultValue="courses" value={activeTab} onValueChange={setActiveTab}>
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
                <CardTitle>{editingCourse ? "Editar Curso" : "Adicionar Curso"}</CardTitle>
                <CardDescription>
                  {editingCourse 
                    ? "Edite as informações do curso selecionado" 
                    : "Crie um novo curso na plataforma"}
                </CardDescription>
              </CardHeader>
              
              <Form {...courseForm}>
                <form onSubmit={courseForm.handleSubmit(editingCourse ? handleUpdateCourse : handleCreateCourse)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={courseForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título*</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: JavaScript Avançado" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={courseForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva o curso" 
                              rows={3}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={courseForm.control}
                      name="instructor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instrutor*</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nome do instrutor" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={courseForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORIES.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={courseForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="0"
                              step="0.01"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={courseForm.control}
                      name="thumbnail_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL da Imagem (Thumbnail)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://exemplo.com/imagem.jpg" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            URL da imagem de capa do curso
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={courseForm.control}
                      name="is_published"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Publicado</FormLabel>
                            <FormDescription>
                              O curso ficará visível para os usuários
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {editingCourse ? (
                      <>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setEditingCourse(null);
                            resetForms();
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          <Check className="mr-2 h-4 w-4" />
                          Salvar Alterações
                        </Button>
                      </>
                    ) : (
                      <Button type="submit" disabled={isLoading}>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Curso
                      </Button>
                    )}
                  </CardFooter>
                </form>
              </Form>
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
                      <AccordionTrigger className="flex items-center group">
                        <div className="flex items-center gap-2 flex-1 pr-4">
                          <Book className={cn(
                            "mr-2 h-4 w-4",
                            course.is_published === false && "text-muted-foreground"
                          )} />
                          <span className={cn(
                            course.is_published === false && "text-muted-foreground"
                          )}>
                            {course.title}
                          </span>
                          {course.is_published === false && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                              Rascunho
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCourse(course);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir curso</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o curso "{course.title}"? 
                                  Esta ação não pode ser desfeita e todos os módulos e vídeos 
                                  associados serão excluídos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCourse(course.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p><strong>ID:</strong> {course.id}</p>
                          <p><strong>Instrutor:</strong> {course.instructor}</p>
                          <p><strong>Preço:</strong> R$ {course.price.toFixed(2)}</p>
                          {course.category && (
                            <p><strong>Categoria:</strong> {course.category}</p>
                          )}
                          {course.description && (
                            <p><strong>Descrição:</strong> {course.description}</p>
                          )}
                          <p><strong>Status:</strong> {course.is_published === false ? "Rascunho" : "Publicado"}</p>
                          <p><strong>Criado em:</strong> {new Date(course.created_at).toLocaleDateString('pt-BR')}</p>
                          
                          {course.thumbnail_url && (
                            <div className="mt-4">
                              <p><strong>Thumbnail:</strong></p>
                              <img 
                                src={course.thumbnail_url} 
                                alt={course.title} 
                                className="mt-2 rounded-md max-w-full max-h-32 object-cover"
                              />
                            </div>
                          )}

                          <div className="flex gap-2 mt-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setActiveTab("modules");
                                moduleForm.setValue("course_id", course.id);
                              }}
                            >
                              <Plus className="mr-2 h-3 w-3" />
                              Adicionar Módulo
                            </Button>
                          </div>
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
                <CardTitle>{editingModule ? "Editar Módulo" : "Adicionar Módulo"}</CardTitle>
                <CardDescription>
                  {editingModule 
                    ? "Edite as informações do módulo selecionado" 
                    : "Crie um novo módulo para um curso"}
                </CardDescription>
              </CardHeader>
              
              <Form {...moduleForm}>
                <form onSubmit={moduleForm.handleSubmit(editingModule ? handleUpdateModule : handleCreateModule)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={moduleForm.control}
                      name="course_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selecione o Curso*</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                            disabled={!!editingModule}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um curso" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {courses?.map((course) => (
                                <SelectItem key={course.id} value={course.id}>
                                  {course.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={moduleForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do Módulo*</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Introdução ao JavaScript" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={moduleForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição do Módulo</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva o módulo" 
                              rows={3}
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={moduleForm.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Posição</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            Ordem em que o módulo aparece no curso
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={moduleForm.control}
                      name="is_published"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Publicado</FormLabel>
                            <FormDescription>
                              O módulo ficará visível para os usuários
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {editingModule ? (
                      <>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setEditingModule(null);
                            resetForms();
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          <Check className="mr-2 h-4 w-4" />
                          Salvar Alterações
                        </Button>
                      </>
                    ) : (
                      <Button type="submit" disabled={isLoading}>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Módulo
                      </Button>
                    )}
                  </CardFooter>
                </form>
              </Form>
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
                        <AccordionTrigger className="flex items-center group">
                          <div className="flex items-center gap-2 flex-1 pr-4">
                            <Folder className={cn(
                              "mr-2 h-4 w-4",
                              module.is_published === false && "text-muted-foreground"
                            )} />
                            <span className={cn(
                              module.is_published === false && "text-muted-foreground"
                            )}>
                              {module.title}
                            </span>
                            {module.is_published === false && (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                Rascunho
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditModule(module);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir módulo</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o módulo "{module.title}"? 
                                    Esta ação não pode ser desfeita e todos os vídeos 
                                    associados serão excluídos.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteModule(module.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p><strong>ID:</strong> {module.id}</p>
                            <p><strong>Curso:</strong> {courseInfo?.title || module.course_id}</p>
                            <p><strong>Posição:</strong> {module.position}</p>
                            {module.description && (
                              <p><strong>Descrição:</strong> {module.description}</p>
                            )}
                            <p><strong>Status:</strong> {module.is_published === false ? "Rascunho" : "Publicado"}</p>
                            <p><strong>Criado em:</strong> {new Date(module.created_at).toLocaleDateString('pt-BR')}</p>

                            <div className="flex gap-2 mt-4">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setActiveTab("videos");
                                  videoForm.setValue("module_id", module.id);
                                }}
                              >
                                <Plus className="mr-2 h-3 w-3" />
                                Adicionar Vídeo
                              </Button>
                            </div>
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
                <CardTitle>{editingVideo ? "Editar Vídeo" : "Adicionar Vídeo"}</CardTitle>
                <CardDescription>
                  {editingVideo 
                    ? "Edite as informações do vídeo selecionado" 
                    : "Crie um novo vídeo para um módulo"}
                </CardDescription>
              </CardHeader>
              
              <Form {...videoForm}>
                <form onSubmit={videoForm.handleSubmit(editingVideo ? handleUpdateVideo : handleCreateVideo)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={videoForm.control}
                      name="module_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selecione o Módulo*</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                            disabled={!!editingVideo}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um módulo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {modules?.map((module) => {
                                const courseInfo = courses?.find(c => c.id === module.course_id);
                                return (
                                  <SelectItem key={module.id} value={module.id}>
                                    {courseInfo?.title ? `${courseInfo.title} - ` : ""}{module.title}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={videoForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do Vídeo*</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: Introdução às Variáveis" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={
