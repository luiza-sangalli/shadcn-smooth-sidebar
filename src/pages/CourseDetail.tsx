
import React from "react";
import { useParams } from "react-router-dom";
import { useCourseContent } from "@/hooks/useCourseContent";
import { usePurchaseCourse } from "@/hooks/usePurchaseCourse";
import { useAuth } from "@/contexts/AuthContext";
import { useCourseLevel } from "@/hooks/useCourseLevel";
import { CourseInfo } from "@/components/course/CourseInfo";
import { PurchaseSection } from "@/components/course/PurchaseSection";
import { CourseContent } from "@/components/course/CourseContent";
import { CourseImageCard } from "@/components/course/CourseImageCard";
import { CourseError } from "@/components/course/CourseError";
import { CourseLoadingSkeleton } from "@/components/course/CourseLoadingSkeleton";

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { course, loading, error } = useCourseContent(courseId);
  const { purchaseCourse, isLoading, preferenceId } = usePurchaseCourse();
  const { user } = useAuth();
  
  // Handling loading state
  if (loading) {
    return <CourseLoadingSkeleton />;
  }
  
  // Handling error or course not found
  if (error || !course) {
    return <CourseError />;
  }

  // Use mock data for now until we have proper enrollment detection
  const isEnrolled = false;
  const totalVideos = course.modules?.reduce((acc, module) => acc + module.videos.length, 0) || 0;
  const completedVideos = 0; // This will come from progress tracking
  const progress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
  
  // Get course level
  const courseLevel = useCourseLevel(Number(course.price));

  const handlePurchaseCourse = async () => {
    if (!user) {
      return;
    }

    await purchaseCourse(
      course.id,
      course.title,
      Number(course.price)
    );
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Course Info */}
        <div className="md:col-span-2 space-y-6">
          <CourseInfo 
            course={course}
            isEnrolled={isEnrolled}
            totalVideos={totalVideos}
            progress={progress}
            courseLevel={courseLevel}
          />

          <PurchaseSection 
            isEnrolled={isEnrolled}
            courseId={course.id}
            courseTitle={course.title}
            coursePrice={Number(course.price)}
            isLoading={isLoading}
            preferenceId={preferenceId}
            onPurchase={handlePurchaseCourse}
          />
        </div>

        {/* Course Image */}
        <div className="order-first md:order-last">
          <CourseImageCard course={course} />
        </div>
      </div>

      {/* Course Content */}
      <CourseContent course={course} />
    </div>
  );
};

export default CourseDetail;
