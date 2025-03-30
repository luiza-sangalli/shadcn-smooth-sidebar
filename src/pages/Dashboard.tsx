
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCourses } from '@/hooks/useCourses';
import { Course } from '@/types';

// Mock data for enrolled courses - this will be replaced with real data later
const enrolledCourses = [
  {
    id: 4,
    title: 'JavaScript Avançado',
    description: 'Domine os conceitos avançados de JavaScript',
    progress: 75,
    level: 'Avançado',
    image: 'https://images.unsplash.com/photo-1552308995-2baac1ad5490?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 5,
    title: 'Marketing Digital',
    description: 'Estratégias para divulgar sua marca online',
    progress: 30,
    level: 'Intermediário',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { courses, loading, error } = useCourses();

  // Helper function to determine course level based on price or other factors
  const getCourseLevel = (course: Course): string => {
    const price = Number(course.price);
    if (price <= 100) return 'Iniciante';
    if (price <= 200) return 'Intermediário';
    return 'Avançado';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Início</h1>
        <p className="text-muted-foreground">
          Olá, {user?.name || user?.email?.split('@')[0] || 'Usuário'}! Confira nossos novos cursos e continue seus estudos.
        </p>
      </div>
      
      {/* Enrolled Courses */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Continue Aprendendo</h2>
        {enrolledCourses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden flex flex-col">
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-secondary h-2 rounded-full">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-right mt-1 text-muted-foreground">{course.progress}% completo</p>
                </CardContent>
                <CardFooter className="mt-auto">
                  <Button asChild className="w-full">
                    <Link to={`/course/${course.id}`}>Continuar Curso</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Você ainda não está inscrito em nenhum curso.</p>
            <Button className="mt-4">Explorar Cursos</Button>
          </Card>
        )}
      </div>
      
      {/* Available Courses */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Cursos Disponíveis</h2>
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Erro ao carregar cursos. Tente novamente mais tarde.</p>
          </Card>
        ) : courses.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Nenhum curso disponível no momento.</p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden flex flex-col">
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={course.thumbnail_url || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant="outline">{getCourseLevel(course)}</Badge>
                  </div>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Instrutor:</span>
                    <span className="text-sm font-medium">{course.instructor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Preço:</span>
                    <span className="text-sm font-bold text-primary">R$ {Number(course.price).toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter className="mt-auto grid grid-cols-2 gap-4">
                  <Button variant="outline" asChild>
                    <Link to={`/course/${course.id}`}>Saber Mais</Link>
                  </Button>
                  <Button asChild>
                    <Link to={`/course/${course.id}`}>Comprar Curso</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
