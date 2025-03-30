
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const VideoPlayer: React.FC = () => {
  const { courseId, videoId } = useParams<{ courseId: string; videoId: string }>();

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <Button variant="outline" asChild className="mb-6">
        <Link to={`/course/${courseId}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o curso
        </Link>
      </Button>
      
      <div className="aspect-video bg-black mb-6 rounded-lg flex items-center justify-center text-white">
        <p>Vídeo {videoId} do curso {courseId}</p>
        <p className="text-muted-foreground">(Player de vídeo seria implementado aqui)</p>
      </div>
      
      <h1 className="text-2xl font-bold mb-4">Título do Vídeo</h1>
      <p className="text-muted-foreground">
        Descrição detalhada do vídeo aqui. Em uma implementação real, 
        estes dados seriam carregados dinamicamente de uma API.
      </p>
    </div>
  );
};

export default VideoPlayer;
