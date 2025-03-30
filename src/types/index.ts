
import { Database } from "@/integrations/supabase/types";

// Define type aliases based on the auto-generated Supabase types
export type CourseRow = Database['public']['Tables']['courses']['Row'];
export type ModuleRow = Database['public']['Tables']['modules']['Row'];
export type VideoRow = Database['public']['Tables']['videos']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type EnrollmentRow = Database['public']['Tables']['enrollments']['Row'];
export type ProgressRow = Database['public']['Tables']['progress']['Row'];
export type UserRoleRow = {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
};

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

// The Profile interface must properly extend ProfileRow
// The problem is that ProfileRow fields are required, but we marked them as optional in Profile
export interface Profile {
  // Include all fields from ProfileRow
  id: string;
  created_at: string;
  updated_at: string;
  name: string | null;
  avatar_url: string | null;
  
  // Database fields that are nullable in ProfileRow
  address: string | null;
  city: string | null;
  state: string | null;
  whatsapp: string | null;
  document_type: string | null;
  document_number: string | null;
  social_name: string | null;
  company_name: string | null;
  zip_code: string | null;
  
  // Additional frontend properties
  email?: string;
  documentType?: 'cpf' | 'cnpj';
  documentNumber?: string;
  socialName?: string;
  companyName?: string;
  zipCode?: string;
}

export interface Enrollment extends EnrollmentRow {
  // Add any additional frontend-specific properties
}

export interface Progress extends ProgressRow {
  // Add any additional frontend-specific properties
}

export interface UserRole extends UserRoleRow {
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
