
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Clock, Calendar, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Mock data for videos - in a real app, this would come from an API
const coursesData = {
  1: {
    id: 1,
    title: "Desenvolvimento Web Completo",
    instructor: "João Silva",
    videos: [
      {
        id: 1,
        title: "Introdução ao Desenvolvimento Web",
        description: "Visão geral das tecnologias web modernas",
        duration: "15:30",
        publishedAt: "2023-10-15",
        thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
      {
        id: 2,
        title: "HTML5 Fundamentos",
        description: "Estrutura semântica e boas práticas",
        duration: "28:45",
        publishedAt: "2023-10-18",
        thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
      {
        id: 3,
        title: "CSS3 Essencial",
        description: "Estilização moderna e responsiva",
        duration: "32:10",
        publishedAt: "2023-10-22",
        thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
      {
        id: 4,
        title: "JavaScript Básico",
        description: "Fundamentos da linguagem e manipulação do DOM",
        duration: "45:20",
        publishedAt: "2023-10-25",
        thumbnail: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
      {
        id: 5,
        title: "Trabalhando com APIs",
        description: "Consumindo e criando APIs RESTful",
        duration: "38:15",
        publishedAt: "2023-10-28",
        thumbnail: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
    ],
  },
  2: {
    id: 2,
    title: "Python para Data Science",
    instructor: "Maria Oliveira",
    videos: [
      {
        id: 1,
        title: "Introdução ao Python",
        description: "Visão geral da linguagem e ambiente de desenvolvimento",
        duration: "22:45",
        publishedAt: "2023-11-05",
        thumbnail: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
      {
        id: 2,
        title: "NumPy Fundamentos",
        description: "Arrays e operações matemáticas eficientes",
        duration: "33:20",
        publishedAt: "2023-11-08",
        thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
      {
        id: 3,
        title: "Pandas Essencial",
        description: "Manipulação e análise de dados tabulares",
        duration: "40:15",
        publishedAt: "2023-11-12",
        thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
    ],
  },
  4: {
    id: 4,
    title: "JavaScript Avançado",
    instructor: "Carlos Santos",
    videos: [
      {
        id: 1,
        title: "ES6+ e Recursos Modernos",
        description: "Novos recursos da linguagem JavaScript",
        duration: "28:15",
        publishedAt: "2023-09-10",
        thumbnail: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: true,
      },
      {
        id: 2,
        title: "Promises e Async/Await",
        description: "Programação assíncrona moderna",
        duration: "35:40",
        publishedAt: "2023-09-15",
        thumbnail: "https://images.unsplash.com/photo-1552308995-2baac1ad5490?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: true,
      },
      {
        id: 3,
        title: "Padrões de Design em JavaScript",
        description: "Soluções elegantes para problemas comuns",
        duration: "42:30",
        publishedAt: "2023-09-20",
        thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: true,
      },
      {
        id: 4,
        title: "APIs Web Modernas",
        description: "Fetch, WebSockets, IndexedDB e mais",
        duration: "38:15",
        publishedAt: "2023-09-25",
        thumbnail: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
    ],
  }
};

const VideoPlayer: React.FC = () => {
  const { courseId, videoId } = useParams<{ courseId: string; videoId: string }>();
  const course = coursesData[Number(courseId) as keyof typeof coursesData];
  
  // If no videoId is provided, use the first video
  const initialVideoId = videoId ? Number(videoId) : course?.videos[0]?.id;
  
  const [activeVideoId, setActiveVideoId] = useState<number>(initialVideoId);
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  
  if (!course) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Curso não encontrado</h1>
        <p className="mb-4">O curso que você está procurando não existe ou foi removido.</p>
        <Button asChild>
          <Link to="/my-courses">Voltar para meus cursos</Link>
        </Button>
      </div>
    );
  }
  
  const activeVideo = course.videos.find(v => v.id === activeVideoId) || course.videos[0];

  return (
    <div className="container mx-auto py-4 px-4 h-[calc(100vh-6rem)]">
      <Button variant="outline" asChild className="mb-4">
        <Link to={`/course/${courseId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o curso
        </Link>
      </Button>
      
      <ResizablePanelGroup 
        direction="horizontal" 
        className="min-h-[calc(100vh-8rem)] border rounded-lg overflow-hidden"
      >
        {/* Main content column */}
        <ResizablePanel defaultSize={75} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="aspect-video bg-black relative">
              <div className="absolute inset-0 flex items-center justify-center text-white flex-col">
                <p className="text-xl">Vídeo {activeVideo.id} do curso {course.title}</p>
                <p className="text-muted-foreground text-sm">(Player de vídeo seria implementado aqui)</p>
              </div>
            </div>
            
            <div className="p-4 flex-1 overflow-auto">
              <h1 className="text-2xl font-bold mb-2">{activeVideo.title}</h1>
              
              <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {activeVideo.publishedAt}
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {activeVideo.duration}
                </div>
                <div className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  {course.instructor}
                </div>
              </div>
              
              <p className="text-muted-foreground">
                {activeVideo.description}
              </p>
            </div>
          </div>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Sidebar column */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <Collapsible open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Conteúdo do Curso</h2>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {isMenuOpen ? "Ocultar" : "Mostrar"}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                
                <CollapsibleContent>
                  <p className="text-sm text-muted-foreground mt-1">
                    {course.videos.length} vídeos
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {course.videos.map((video) => (
                  <div 
                    key={video.id}
                    onClick={() => setActiveVideoId(video.id)} 
                    className={`flex gap-3 rounded-md transition-colors cursor-pointer p-2 ${
                      activeVideoId === video.id ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="relative w-24 h-16 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title} 
                        className="w-full h-full object-cover"
                      />
                      {activeVideoId === video.id && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium text-sm truncate">{video.title}</h3>
                        <Badge 
                          variant={video.completed ? "default" : "outline"}
                          className="text-[10px] h-5 whitespace-nowrap"
                        >
                          {video.completed ? "Completo" : "Não Iniciado"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {video.description}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {video.duration}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default VideoPlayer;
