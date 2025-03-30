
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, FileVideo, Clock, BookOpen } from "lucide-react";

// Mock data - in a real app, this would come from an API
const coursesData = {
  1: {
    id: 1,
    title: "Desenvolvimento Web Completo",
    description:
      "Curso completo de desenvolvimento web, abordando HTML, CSS, JavaScript, React, Node e mais. Aprenda a criar sites responsivos e aplicações web modernas do zero ao avançado.",
    longDescription:
      "Este curso abrangente de desenvolvimento web foi projetado para levar você do básico ao avançado na criação de sites e aplicações web. Você aprenderá HTML5 semântico, CSS3 com flexbox e grid, JavaScript moderno (ES6+), React para frontend, Node.js para backend, e como integrar APIs e bancos de dados. Ao final do curso, você terá construído vários projetos reais para o seu portfólio.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    price: "R$ 199,90",
    progress: 0,
    level: "Iniciante",
    duration: "40 horas",
    videos: [
      {
        id: 1,
        title: "Introdução ao Desenvolvimento Web",
        description: "Visão geral das tecnologias web modernas",
        duration: "15:30",
        thumbnail:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
      {
        id: 2,
        title: "HTML5 Fundamentos",
        description: "Estrutura semântica e boas práticas",
        duration: "28:45",
        thumbnail:
          "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
      {
        id: 3,
        title: "CSS3 Essencial",
        description: "Estilização moderna e responsiva",
        duration: "32:10",
        thumbnail:
          "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
      {
        id: 4,
        title: "JavaScript Básico",
        description: "Fundamentos da linguagem e manipulação do DOM",
        duration: "45:20",
        thumbnail:
          "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
      {
        id: 5,
        title: "Trabalhando com APIs",
        description: "Consumindo e criando APIs RESTful",
        duration: "38:15",
        thumbnail:
          "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
    ],
  },
  2: {
    id: 2,
    title: "Python para Data Science",
    description:
      "Domine Python, Pandas, NumPy e visualização de dados para análise de dados e machine learning.",
    longDescription:
      "Este curso completo de Python para Data Science vai te ensinar desde o básico da linguagem Python até as bibliotecas mais importantes para análise de dados como Pandas, NumPy, Matplotlib e Scikit-learn. Você aprenderá a manipular, limpar e visualizar dados, além de construir modelos de machine learning para resolver problemas reais.",
    image:
      "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    price: "R$ 249,90",
    progress: 0,
    level: "Intermediário",
    duration: "35 horas",
    videos: [
      {
        id: 1,
        title: "Introdução ao Python",
        description: "Visão geral da linguagem e ambiente de desenvolvimento",
        duration: "22:45",
        thumbnail:
          "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
      {
        id: 2,
        title: "NumPy Fundamentos",
        description: "Arrays e operações matemáticas eficientes",
        duration: "33:20",
        thumbnail:
          "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
      {
        id: 3,
        title: "Pandas Essencial",
        description: "Manipulação e análise de dados tabulares",
        duration: "40:15",
        thumbnail:
          "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
    ],
  },
  // For enrolled courses, let's add one with progress
  4: {
    id: 4,
    title: "JavaScript Avançado",
    description: "Domine os conceitos avançados de JavaScript para desenvolvimento web moderno.",
    longDescription:
      "Este curso aprofundado de JavaScript aborda os conceitos mais avançados da linguagem, incluindo promises, async/await, módulos ES6, programação funcional, padrões de design e as mais recentes APIs do navegador. Você aprenderá a construir aplicações web modernas, eficientes e de alta performance.",
    image:
      "https://images.unsplash.com/photo-1552308995-2baac1ad5490?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    price: "R$ 179,90",
    progress: 75,
    level: "Avançado",
    duration: "28 horas",
    videos: [
      {
        id: 1,
        title: "ES6+ e Recursos Modernos",
        description: "Novos recursos da linguagem JavaScript",
        duration: "28:15",
        thumbnail:
          "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: true,
      },
      {
        id: 2,
        title: "Promises e Async/Await",
        description: "Programação assíncrona moderna",
        duration: "35:40",
        thumbnail:
          "https://images.unsplash.com/photo-1552308995-2baac1ad5490?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: true,
      },
      {
        id: 3,
        title: "Padrões de Design em JavaScript",
        description: "Soluções elegantes para problemas comuns",
        duration: "42:30",
        thumbnail:
          "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: true,
      },
      {
        id: 4,
        title: "APIs Web Modernas",
        description: "Fetch, WebSockets, IndexedDB e mais",
        duration: "38:15",
        thumbnail:
          "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
        completed: false,
      },
    ],
  },
};

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  
  // In a real app, we would fetch the course data from an API
  const course = coursesData[Number(courseId) as keyof typeof coursesData];
  
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

  const isEnrolled = course.progress > 0;
  const totalVideos = course.videos.length;
  const completedVideos = course.videos.filter(video => video.completed).length;
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Course Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-muted-foreground">{course.longDescription}</p>
          </div>

          <div className="flex flex-wrap gap-4 items-center">
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileVideo className="h-3 w-3" />
              {totalVideos} vídeos
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {course.duration}
            </Badge>
            <Badge variant="outline">{course.level}</Badge>
          </div>

          {isEnrolled && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso do curso</span>
                <span>{course.progress}%</span>
              </div>
              <Progress value={course.progress} />
            </div>
          )}

          <div>
            {isEnrolled ? (
              <Button className="w-full md:w-auto">
                <Play className="mr-2 h-4 w-4" />
                Continuar Assistindo
              </Button>
            ) : (
              <Button className="w-full md:w-auto">
                <BookOpen className="mr-2 h-4 w-4" />
                Comprar Curso por {course.price}
              </Button>
            )}
          </div>
        </div>

        {/* Course Image */}
        <div className="order-first md:order-last">
          <div className="rounded-lg overflow-hidden">
            <img 
              src={course.image} 
              alt={course.title} 
              className="w-full h-auto object-cover aspect-video"
            />
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Conteúdo do Curso</h2>
        <div className="space-y-4">
          {course.videos.map((video, index) => (
            <Card key={video.id} className="overflow-hidden">
              <CardContent className="p-0">
                <Link to={`/course/${course.id}/video/${video.id}`} className="flex flex-col md:flex-row hover:bg-muted/50 transition-colors">
                  <div className="h-32 md:w-48 md:min-w-48 relative">
                    <img 
                      src={video.thumbnail} 
                      alt={video.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant={video.completed ? "default" : "outline"}>
                        {video.completed ? "Completo" : "Não Iniciado"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium text-lg">
                        {index + 1}. {video.title}
                      </h3>
                      <p className="text-muted-foreground">{video.description}</p>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {video.duration}
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
