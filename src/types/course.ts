
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  duration_minutes: number;
  difficulty_level: string;
  learning_objectives: string[];
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
  lessons_count?: number;
  enrollment_count?: number;
  rating?: number;
  price?: number;
  is_free?: boolean;
  tags?: string[];
  prerequisites?: string[];
  what_you_will_learn?: string[];
  course_material?: string[];
  certificate_available?: boolean;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  content: string;
  lesson_order: number;
  duration_minutes?: number;
  lesson_type?: 'video' | 'text' | 'quiz' | 'exercise';
  video_url?: string;
  materials?: string[];
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress_percentage: number;
  completed: boolean;
  last_accessed: string;
  created_at: string;
  updated_at: string;
  courses?: Course;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_duration_hours: number;
  courses: Course[];
  created_at: string;
  updated_at: string;
}

export const COURSE_CATEGORIES = [
  'Marketing Digital',
  'Intelligence Artificielle',
  'Business & Entrepreneuriat',
  'Administration & Gestion',
  'Communication',
  'Leadership',
  'Productivity Tools',
  'Data Analysis'
] as const;

export const DIFFICULTY_LEVELS = [
  'beginner',
  'intermediate', 
  'advanced'
] as const;

export type CourseCategory = typeof COURSE_CATEGORIES[number];
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];
