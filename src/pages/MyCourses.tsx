
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ChevronDown, 
  BookOpen, 
  Clock, 
  Archive, 
  CheckCircle, 
  Grid, 
  List,
  SortAsc,
  SortDesc,
  CalendarDays
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Definição do tipo para os cursos
type Course = {
  id: number;
  title: string;
  description: string;
  image: string;
  progress: number;
  level: string;
  lastAccessed?: string;
  category: string;
  duration: string;
  isArchived: boolean;
  instructor: string;
  totalLessons: number;
  completedLessons: number;
};

// Mock de dados para cursos comprados
const mockPurchasedCourses: Course[] = [
  {
    id: 1,
    title: 'JavaScript Avançado',
    description: 'Domine os conceitos avançados de JavaScript',
    image: 'https://images.unsplash.com/photo-1552308995-2baac1ad5490?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    progress: 75,
    level: 'Avançado',
    lastAccessed: '2023-10-15',
    category: 'Programação',
    duration: '40 horas',
    isArchived: false,
    instructor: 'Ana Silva',
    totalLessons: 24,
    completedLessons: 18
  },
  {
    id: 2,
    title: 'Marketing Digital',
    description: 'Estratégias para divulgar sua marca online',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    progress: 30,
    level: 'Intermediário',
    lastAccessed: '2023-10-10',
    category: 'Marketing',
    duration: '30 horas',
    isArchived: false,
    instructor: 'Carlos Mendes',
    totalLessons: 18,
    completedLessons: 5
  },
  {
    id: 3,
    title: 'Python para Data Science',
    description: 'Análise de dados com Python e bibliotecas populares',
    image: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    progress: 50,
    level: 'Intermediário',
    lastAccessed: '2023-10-05',
    category: 'Data Science',
    duration: '45 horas',
    isArchived: true,
    instructor: 'Mariana Costa',
    totalLessons: 30,
    completedLessons: 15
  },
  {
    id: 4,
    title: 'Design UX/UI',
    description: 'Princípios fundamentais de design de interfaces',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    progress: 100,
    level: 'Iniciante',
    lastAccessed: '2023-09-28',
    category: 'Design',
    duration: '25 horas',
    isArchived: false,
    instructor: 'Roberto Alves',
    totalLessons: 15,
    completedLessons: 15
  },
  {
    id: 5,
    title: 'Desenvolvimento Mobile React Native',
    description: 'Crie aplicativos nativos para iOS e Android',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
    progress: 15,
    level: 'Avançado',
    lastAccessed: '2023-10-12',
    category: 'Programação',
    duration: '50 horas',
    isArchived: false,
    instructor: 'Juliana Teixeira',
    totalLessons: 40,
    completedLessons: 6
  }
];

const MyCourses: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'title' | 'progress' | 'lastAccessed'>('lastAccessed');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 8;

  // Carregar cursos do mock
  useEffect(() => {
    setCourses(mockPurchasedCourses);
  }, []);

  // Filtrar, ordenar e paginar cursos
  useEffect(() => {
    let result = [...courses];

    // Filtrar por estado arquivado
    result = result.filter(course => course.isArchived === showArchived);
    
    // Filtrar por nível
    if (levelFilter) {
      result = result.filter(course => course.level === levelFilter);
    }
    
    // Filtrar por categoria
    if (categoryFilter) {
      result = result.filter(course => course.category === categoryFilter);
    }
    
    // Filtrar por termo de busca
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        course => 
          course.title.toLowerCase().includes(query) || 
          course.description.toLowerCase().includes(query) ||
          course.instructor.toLowerCase().includes(query)
      );
    }
    
    // Ordenar resultados
    result.sort((a, b) => {
      if (sortBy === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortBy === 'progress') {
        return sortDirection === 'asc'
          ? a.progress - b.progress
          : b.progress - a.progress;
      } else {
        // Por data de último acesso
        const dateA = a.lastAccessed ? new Date(a.lastAccessed) : new Date(0);
        const dateB = b.lastAccessed ? new Date(b.lastAccessed) : new Date(0);
        return sortDirection === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
    });
    
    setFilteredCourses(result);
  }, [courses, searchQuery, showArchived, levelFilter, categoryFilter, sortBy, sortDirection]);

  // Obter as categorias e níveis únicos para os filtros
  const uniqueCategories = Array.from(new Set(courses.map(course => course.category)));
  const uniqueLevels = Array.from(new Set(courses.map(course => course.level)));

  // Paginar os resultados
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  // Manipular arquivamento do curso
  const handleToggleArchive = (courseId: number) => {
    setCourses(courses.map(course => 
      course.id === courseId 
        ? { ...course, isArchived: !course.isArchived } 
        : course
    ));
    
    const course = courses.find(c => c.id === courseId);
    if (course) {
      toast({
        title: course.isArchived ? "Curso restaurado" : "Curso arquivado",
        description: `${course.title} foi ${course.isArchived ? "restaurado" : "movido para arquivados"}.`,
        duration: 3000,
      });
    }
  };

  // Acessar conteúdo do curso
  const handleAccessCourse = (courseId: number) => {
    // Simulação de acesso ao curso
    toast({
      title: "Acessando curso",
      description: "Você será redirecionado para o conteúdo do curso.",
      duration: 2000,
    });
  };

  // Limpar todos os filtros
  const handleClearFilters = () => {
    setSearchQuery('');
    setLevelFilter(null);
    setCategoryFilter(null);
    setSortBy('lastAccessed');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  // Renderizar indicador de progresso
  const renderProgress = (progress: number) => (
    <div className="relative pt-1">
      <div className="w-full bg-secondary h-2 rounded-full">
        <div 
          className={`h-2 rounded-full ${
            progress === 100 ? 'bg-green-500' : 'bg-primary'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-right mt-1 text-muted-foreground">{progress}% completo</p>
    </div>
  );

  // Renderizar cursos como cards grid
  const renderCoursesGrid = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {currentCourses.map((course) => (
        <Card key={course.id} className="overflow-hidden flex flex-col h-full">
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
            <CardDescription className="line-clamp-2">{course.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow">
            {renderProgress(course.progress)}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {course.duration}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {course.completedLessons}/{course.totalLessons} aulas
              </span>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={() => handleAccessCourse(course.id)}
            >
              {course.progress === 100 ? 'Revisar' : 'Continuar'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleToggleArchive(course.id)}
              title={course.isArchived ? "Restaurar curso" : "Arquivar curso"}
            >
              <Archive className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  // Renderizar cursos como tabela
  const renderCoursesList = () => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Curso</TableHead>
            <TableHead>Progresso</TableHead>
            <TableHead>Instrutor</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Último acesso</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentCourses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-16 rounded overflow-hidden">
                    <img 
                      src={course.image} 
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">{course.title}</div>
                    <div className="text-xs text-muted-foreground">{course.level}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="w-32">{renderProgress(course.progress)}</div>
              </TableCell>
              <TableCell>{course.instructor}</TableCell>
              <TableCell>{course.category}</TableCell>
              <TableCell>{course.lastAccessed || "Não acessado"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAccessCourse(course.id)}
                  >
                    {course.progress === 100 ? 'Revisar' : 'Continuar'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleArchive(course.id)}
                    title={course.isArchived ? "Restaurar curso" : "Arquivar curso"}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Renderizar mensagem de nenhum curso encontrado
  const renderNoCourses = () => (
    <Card className="p-6 text-center space-y-4">
      <div className="flex justify-center">
        <BookOpen className="h-16 w-16 text-muted-foreground" />
      </div>
      <CardTitle>Nenhum curso encontrado</CardTitle>
      {searchQuery || levelFilter || categoryFilter ? (
        <>
          <CardDescription>
            Não encontramos cursos com os filtros aplicados.
          </CardDescription>
          <Button onClick={handleClearFilters}>Limpar filtros</Button>
        </>
      ) : showArchived ? (
        <CardDescription>
          Você não possui cursos arquivados.
        </CardDescription>
      ) : (
        <>
          <CardDescription>
            Você ainda não está inscrito em nenhum curso. Explore nosso catálogo para encontrar o curso perfeito para você.
          </CardDescription>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Explorar cursos disponíveis
          </Button>
        </>
      )}
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meus Cursos</h1>
        <p className="text-muted-foreground">
          Acesse seus cursos, continue seus estudos ou filtre por áreas de interesse.
        </p>
      </div>

      {/* Barra de ferramentas: busca, filtros e visualização */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Buscar cursos..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Alternador de visualização arquivados */}
          <Button 
            variant={showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
            className="gap-1.5"
          >
            <Archive className="h-4 w-4" />
            {showArchived ? "Arquivados" : "Ativos"}
          </Button>
          
          {/* Filtro por nível */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="h-4 w-4" />
                Nível
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLevelFilter(null)}>
                Todos os níveis
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {uniqueLevels.map(level => (
                <DropdownMenuItem 
                  key={level} 
                  onClick={() => setLevelFilter(level)}
                >
                  {level}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Filtro por categoria */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <SlidersHorizontal className="h-4 w-4" />
                Categoria
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setCategoryFilter(null)}>
                Todas as categorias
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {uniqueCategories.map(category => (
                <DropdownMenuItem 
                  key={category} 
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Ordenação */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                {sortDirection === 'asc' 
                  ? <SortAsc className="h-4 w-4" /> 
                  : <SortDesc className="h-4 w-4" />
                }
                Ordenar
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {setSortBy('title'); setSortDirection('asc');}}
                className="flex justify-between"
              >
                Nome (A-Z)
                {sortBy === 'title' && sortDirection === 'asc' && <CheckCircle className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {setSortBy('title'); setSortDirection('desc');}}
                className="flex justify-between"
              >
                Nome (Z-A)
                {sortBy === 'title' && sortDirection === 'desc' && <CheckCircle className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {setSortBy('progress'); setSortDirection('asc');}}
                className="flex justify-between"
              >
                Progresso (menor primeiro)
                {sortBy === 'progress' && sortDirection === 'asc' && <CheckCircle className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {setSortBy('progress'); setSortDirection('desc');}}
                className="flex justify-between"
              >
                Progresso (maior primeiro)
                {sortBy === 'progress' && sortDirection === 'desc' && <CheckCircle className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {setSortBy('lastAccessed'); setSortDirection('desc');}}
                className="flex justify-between"
              >
                Recentes primeiro
                {sortBy === 'lastAccessed' && sortDirection === 'desc' && <CheckCircle className="h-4 w-4" />}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {setSortBy('lastAccessed'); setSortDirection('asc');}}
                className="flex justify-between"
              >
                Antigos primeiro
                {sortBy === 'lastAccessed' && sortDirection === 'asc' && <CheckCircle className="h-4 w-4" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Alternar visualização */}
          <div className="flex rounded-md border">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="icon" 
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="icon" 
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Exibir filtros ativos */}
      {(searchQuery || levelFilter || categoryFilter) && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtros ativos:</span>
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Busca: {searchQuery}
                <button onClick={() => setSearchQuery('')} className="ml-1">×</button>
              </Badge>
            )}
            {levelFilter && (
              <Badge variant="secondary" className="gap-1">
                Nível: {levelFilter}
                <button onClick={() => setLevelFilter(null)} className="ml-1">×</button>
              </Badge>
            )}
            {categoryFilter && (
              <Badge variant="secondary" className="gap-1">
                Categoria: {categoryFilter}
                <button onClick={() => setCategoryFilter(null)} className="ml-1">×</button>
              </Badge>
            )}
            {(searchQuery || levelFilter || categoryFilter) && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-6 px-2">
                Limpar todos
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Lista de cursos */}
      <div className="space-y-6">
        {filteredCourses.length > 0 ? (
          <>
            {viewMode === 'grid' ? renderCoursesGrid() : renderCoursesList()}
            
            {/* Paginação */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        isActive={currentPage === index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          renderNoCourses()
        )}
      </div>
    </div>
  );
};

export default MyCourses;
