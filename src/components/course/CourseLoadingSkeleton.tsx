
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const CourseLoadingSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-24 w-full" />
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="order-first md:order-last">
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
      <div className="mt-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};
