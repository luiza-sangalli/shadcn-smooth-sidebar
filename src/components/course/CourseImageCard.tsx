
import React from "react";
import { CourseWithContent } from "@/types";

interface CourseImageCardProps {
  course: CourseWithContent;
}

export const CourseImageCard: React.FC<CourseImageCardProps> = ({ course }) => {
  return (
    <div className="rounded-lg overflow-hidden">
      <img 
        src={course.thumbnail_url || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"} 
        alt={course.title} 
        className="w-full h-auto object-cover aspect-video"
      />
    </div>
  );
};
