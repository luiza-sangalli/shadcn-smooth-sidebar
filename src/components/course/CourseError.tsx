
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const CourseError: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Curso não encontrado</h1>
      <p className="mb-4">O curso que você está procurando não existe ou foi removido.</p>
      <Button asChild>
        <Link to="/dashboard">Voltar para cursos disponíveis</Link>
      </Button>
    </div>
  );
};
