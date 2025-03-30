
import { Database } from "@/integrations/supabase/types";

// Define type aliases based on the auto-generated Supabase types
export type CourseRow = Database['public']['Tables']['courses']['Row'];
export type ModuleRow = Database['public']['Tables']['modules']['Row'];
export type VideoRow = Database['public']['Tables']['videos']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type EnrollmentRow = Database['public']['Tables']['enrollments']['Row'];
export type ProgressRow = Database['public']['Tables']['progress']['Row'];

// Define enhanced types with additional frontend-specific properties
export interface Course extends CourseRow {
  // Add any additional frontend-specific properties
}

export interface Module extends ModuleRow {
  // Add any additional frontend-specific properties
}

export interface Video extends VideoRow {
  // Add any additional frontend-specific properties
  is_published?: boolean; // Frontend computed property based on published_at
}

export interface Profile extends ProfileRow {
  // Add any additional frontend-specific properties
  email?: string;
  socialName?: string;
  whatsapp?: string;
  documentType?: 'cpf' | 'cnpj';
  documentNumber?: string;
  companyName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Enrollment extends EnrollmentRow {
  // Add any additional frontend-specific properties
}

export interface Progress extends ProgressRow {
  // Add any additional frontend-specific properties
}

// Course with modules and videos
export interface CourseWithContent extends Course {
  modules?: ModuleWithVideos[];
}

export interface ModuleWithVideos extends Module {
  videos?: Video[];
}

// New interfaces for enrolled courses
export interface CourseWithProgress extends Course {
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessed?: string;
}

export interface CourseWithEnrollment extends CourseWithProgress {
  enrollment: Enrollment;
  isArchived: boolean;
}
