
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Mock data for courses
const availableCourses = [
  {
    id: 1,
    title: 'Desenvolvimento Web Completo',
    description: 'Aprenda HTML, CSS, JavaScript, React, Node e mais!',
    price: 'R$ 199,90',
    level: 'Iniciante',
    duration: '40 horas',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 2,
    title: 'Python para Data Science',
    description: 'Domine Python, Pandas, NumPy e visualização de dados',
    price: 'R$ 249,90',
    level: 'Intermediário',
    duration: '35 horas',
    image: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 3,
    title: 'UX/UI Design',
    description: 'Crie interfaces incríveis e melhore a experiência do usuário',
    price: 'R$ 179,90',
    level: 'Todos os níveis',
    duration: '25 horas',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80'
  },
];

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Início</h1>
        <p className="text-muted-foreground">
          Olá, {user?.name}! Confira nossos novos cursos e continue seus estudos.
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
                  <Button className="w-full">Continuar Curso</Button>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableCourses.map((course) => (
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
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Duração:</span>
                  <span className="text-sm font-medium">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Preço:</span>
                  <span className="text-sm font-bold text-primary">{course.price}</span>
                </div>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button className="w-full">Comprar Curso</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
