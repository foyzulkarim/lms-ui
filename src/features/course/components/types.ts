export interface Lesson {
  id: number;
  title: string;
  videoUrl: string;
  content: string;
  order: number;
  duration: string;
}

export interface Module {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Category {
  id: string;
  name: string;
}

export interface LessonFormData {
  title: string;
  videoUrl?: string;
  content?: string;
  duration?: string;
}

export interface EditingLesson {
  id?: number;
  moduleId: number;
  title: string;
  videoUrl?: string;
  content?: string;
  duration?: string;
  order: number;
} 
