
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, FileVideo, Clock, BookOpen } from "lucide-react";
import { useCourseContent } from "@/hooks/useCourseContent";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, loading, error } = useCourseContent(courseId);
  const { toast } = useToast();
  
  // Handling loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-24 w-full" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="order-first md:order-last">
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
        <div className="mt-12">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Handling error or course not found
  if (error || !course) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Curso não encontrado</h1>
        <p className="mb-4">O curso que você está procurando não existe ou foi removido.</p>
        <Button asChild>
          <Link to="/dashboard">Voltar para cursos disponíveis</Link>
        </Button>
      </div>
    );
  }

  // Use mock data for now until we have proper enrollment detection
  const isEnrolled = false;
  const totalVideos = course.modules?.reduce((acc, module) => acc + module.videos.length, 0) || 0;
  const completedVideos = 0; // This will come from progress tracking
  const progress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
  
  // Function to get course level (placeholder)
  const getCourseLevel = (price: number): string => {
    if (price <= 100) return 'Iniciante';
    if (price <= 200) return 'Intermediário';
    return 'Avançado';
  };

  const handlePurchaseCourse = () => {
    toast({
      title: "Compra iniciada",
      description: "Você será redirecionado para a página de pagamento.",
      duration: 3000,
    });
    // Implement actual purchase flow
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Course Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-muted-foreground">{course.description}</p>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileVideo className="h-3 w-3" />
              {totalVideos} vídeos
            </Badge>
            {course.modules && course.modules.length > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {course.modules.length} módulos
              </Badge>
            )}
            <Badge variant="outline">{getCourseLevel(Number(course.price))}</Badge>
          </div>

          {isEnrolled && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso do curso</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <div>
            {isEnrolled ? (
              <Button className="w-full md:w-auto">
                <Play className="mr-2 h-4 w-4" />
                Continuar Assistindo
              </Button>
            ) : (
              <Button className="w-full md:w-auto" onClick={handlePurchaseCourse}>
                <BookOpen className="mr-2 h-4 w-4" />
                Comprar Curso por R$ {Number(course.price).toFixed(2)}
              </Button>
            )}
          </div>
        </div>

        {/* Course Image */}
        <div className="order-first md:order-last">
          <div className="rounded-lg overflow-hidden">
            <img 
              src={course.thumbnail_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"} 
              alt={course.title} 
              className="w-full h-auto object-cover aspect-video"
            />
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Conteúdo do Curso</h2>
        {course.modules && course.modules.length > 0 ? (
          <div className="space-y-4">
            {course.modules.map((module, moduleIndex) => (
              <div key={module.id} className="border rounded-lg overflow-hidden">
                <div className="bg-muted p-4">
                  <h3 className="font-medium">
                    Módulo {moduleIndex + 1}: {module.title}
                  </h3>
                  {module.description && (
                    <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                  )}
                </div>
                <div className="divide-y">
                  {module.videos.map((video, videoIndex) => (
                    <Card key={video.id} className="border-0 rounded-none">
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row hover:bg-muted/50 transition-colors p-4">
                          <div className="h-20 md:w-36 md:min-w-36 relative mb-2 md:mb-0 md:mr-4">
                            <img 
                              src={video.thumbnail_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"} 
                              alt={video.title} 
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-medium">
                                {moduleIndex + 1}.{videoIndex + 1} {video.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">{video.description}</p>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mt-2">
                              <Clock className="h-3 w-3 mr-1" />
                              {video.duration}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Nenhum conteúdo disponível para este curso ainda.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
