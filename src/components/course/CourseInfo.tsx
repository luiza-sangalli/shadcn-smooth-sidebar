
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileVideo, Clock } from "lucide-react";
import { CourseWithContent } from "@/types";

interface CourseInfoProps {
  course: CourseWithContent;
  isEnrolled: boolean;
  totalVideos: number;
  progress: number;
  courseLevel: string;
}

export const CourseInfo: React.FC<CourseInfoProps> = ({
  course,
  isEnrolled,
  totalVideos,
  progress,
  courseLevel,
}) => {
  return (
    <div className="space-y-6">
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
        <Badge variant="outline">{courseLevel}</Badge>
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
    </div>
  );
};
