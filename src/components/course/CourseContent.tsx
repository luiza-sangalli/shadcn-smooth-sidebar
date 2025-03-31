
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { CourseWithContent } from "@/types";

interface CourseContentProps {
  course: CourseWithContent;
}

export const CourseContent: React.FC<CourseContentProps> = ({ course }) => {
  return (
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
  );
};
