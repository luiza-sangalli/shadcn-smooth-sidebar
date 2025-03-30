
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
import { useEnrolledCourses, EnrolledCourse } from '@/hooks/useEnrolledCourses';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const MyCourses: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'title' | 'progress' | 'lastAccessed'>('lastAccessed');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredCourses, setFilteredCourses] = useState<EnrolledCourse[]>([]);
  const coursesPerPage = 8;

  // Load courses from the backend via the custom hook
  const { enrolledCourses, loading, error } = useEnrolledCourses(showArchived);

  // Filter, sort, and paginate courses
  useEffect(() => {
    let result = [...enrolledCourses];
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        course => 
          course.title.toLowerCase().includes(query) || 
          (course.description && course.description.toLowerCase().includes(query)) ||
          course.instructor.toLowerCase().includes(query)
      );
    }
    
    // Filter by level (currently level is not in the database schema, would need to be added)
    if (levelFilter) {
      result = result.filter(course => {
        // This is a placeholder - in real implementation, level would be a property of the course
        const courseLevel = getLevelFromCourse(course);
        return courseLevel === levelFilter;
      });
    }
    
    // Filter by category (currently category is not in the database schema, would need to be added)
    if (categoryFilter) {
      result = result.filter(course => {
        // This is a placeholder - in real implementation, category would be a property of the course
        const courseCategory = getCategoryFromCourse(course);
        return courseCategory === categoryFilter;
      });
    }
    
    // Sort results
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
        // By date of last access
        const dateA = a.lastAccessed ? new Date(a.lastAccessed) : new Date(0);
        const dateB = b.lastAccessed ? new Date(b.lastAccessed) : new Date(0);
        return sortDirection === 'asc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
    });
    
    setFilteredCourses(result);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [enrolledCourses, searchQuery, levelFilter, categoryFilter, sortBy, sortDirection]);

  // Helper function to get a level for a course (placeholder)
  const getLevelFromCourse = (course: EnrolledCourse): string => {
    // In a real implementation, this would read the level property
    // For now, we'll derive a fake level based on the course properties
    const progress = course.progress || 0;
    if (progress < 30) return 'Iniciante';
    if (progress < 70) return 'Intermediário';
    return 'Avançado';
  };

  // Helper function to get a category for a course (placeholder)
  const getCategoryFromCourse = (course: EnrolledCourse): string => {
    // In a real implementation, this would read the category property
    // For now, we'll derive a fake category based on the course title
    const title = course.title.toLowerCase();
    if (title.includes('javascript') || title.includes('react') || title.includes('program')) return 'Programação';
    if (title.includes('marketing') || title.includes('negócio')) return 'Marketing';
    if (title.includes('design') || title.includes('ui') || title.includes('ux')) return 'Design';
    if (title.includes('data') || title.includes('análise') || title.includes('python')) return 'Data Science';
    return 'Outros';
  };

  // Get unique categories and levels for filters
  const uniqueCategories = Array.from(new Set(enrolledCourses.map(getCategoryFromCourse)));
  const uniqueLevels = Array.from(new Set(enrolledCourses.map(getLevelFromCourse)));

  // Paginate the results
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  // Handle archive toggle
  const handleToggleArchive = (courseId: string) => {
    // In a real implementation, this would update the database
    // For now, we'll just show a toast message
    const course = enrolledCourses.find(c => c.id === courseId);
    if (course) {
      toast({
        title: showArchived ? "Curso restaurado" : "Curso arquivado",
        description: `${course.title} foi ${showArchived ? "restaurado" : "movido para arquivados"}.`,
        duration: 3000,
      });
    }
  };

  // Access course content
  const handleAccessCourse = (courseId: string) => {
    // Navigate to course detail page
    toast({
      title: "Acessando curso",
      description: "Você será redirecionado para o conteúdo do curso.",
      duration: 2000,
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setLevelFilter(null);
    setCategoryFilter(null);
    setSortBy('lastAccessed');
    setSortDirection('desc');
    setCurrentPage(1);
  };

  // Render progress indicator
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

  // Render loading skeletons
  const renderSkeletons = () => (
    <div className={viewMode === 'grid' 
      ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
      : ""
    }>
      {Array(4).fill(0).map((_, index) => (
        viewMode === 'grid' ? (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-video w-full">
              <Skeleton className="h-full w-full" />
            </div>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-2 w-full mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ) : (
          <div key={index} className="border rounded-md p-4 mb-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-16 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        )
      ))}
    </div>
  );

  // Render courses as grid cards
  const renderCoursesGrid = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {currentCourses.map((course) => (
        <Card key={course.id} className="overflow-hidden flex flex-col h-full">
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={course.thumbnail_url || "https://images.unsplash.com/photo-1552308995-2baac1ad5490?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"} 
              alt={course.title} 
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <Badge variant="outline">{getLevelFromCourse(course)}</Badge>
            </div>
            <CardDescription className="line-clamp-2">{course.description || "Sem descrição disponível"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-grow">
            {renderProgress(course.progress)}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {/* Duration would need to be calculated from video durations */}
                Aprox. {Math.round(course.totalLessons * 10)} min
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
              asChild
            >
              <Link to={`/course/${course.id}`}>
                {course.progress === 100 ? 'Revisar' : 'Continuar'}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleToggleArchive(course.id)}
              title={showArchived ? "Restaurar curso" : "Arquivar curso"}
            >
              <Archive className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  // Render courses as table list
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
                      src={course.thumbnail_url || "https://images.unsplash.com/photo-1552308995-2baac1ad5490?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80"} 
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold">{course.title}</div>
                    <div className="text-xs text-muted-foreground">{getLevelFromCourse(course)}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="w-32">{renderProgress(course.progress)}</div>
              </TableCell>
              <TableCell>{course.instructor}</TableCell>
              <TableCell>{getCategoryFromCourse(course)}</TableCell>
              <TableCell>{course.lastAccessed || "Não acessado"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link to={`/course/${course.id}`}>
                      {course.progress === 100 ? 'Revisar' : 'Continuar'}
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleToggleArchive(course.id)}
                    title={showArchived ? "Restaurar curso" : "Arquivar curso"}
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

  // Render message when no courses found
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
        {loading ? (
          renderSkeletons()
        ) : filteredCourses.length > 0 ? (
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
