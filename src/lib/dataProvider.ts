import { api, fetcher } from './api';
import { CATEGORIES } from './constants';

// Data provider that uses the real API for all data operations
console.log('🌐 Using real API for all data operations');

// Implement all data methods using the real API
export const dataProvider = {
  // Categories
  getCategories: async () => {
    return CATEGORIES;
  },

  // Courses
  getCourses: async (params?: { limit?: number; search?: string; categoryId?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId.toString());
    
    const queryString = queryParams.toString();
    return fetcher(`/api/courses${queryString ? `?${queryString}` : ''}`);
  },

  getInProgressCourses: async (params?: { limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    return fetcher(`/api/courses/in-progress${queryString ? `?${queryString}` : ''}`);
  },

  hasInProgressCourses: async () => {
    const courses = await fetcher<any[]>('/api/courses/in-progress?limit=1');
    return courses.length > 0;
  },

  getCourseById: async (id: number) => {
    return fetcher(`/api/courses/${id}`);
  },

  getCourseModules: async (courseId: number) => {
    return fetcher(`/api/courses/${courseId}/modules`);
  },

  getCourseLessons: async (courseId: number) => {
    return fetcher(`/api/courses/${courseId}/lessons`);
  },

  getCourseStudents: async (courseId: number) => {
    return fetcher(`/api/courses/${courseId}/students`);
  },

  // Modules
  getModuleById: async (id: number) => {
    return fetcher(`/api/modules/${id}`);
  },

  // Lessons
  getLessonById: async (id: number) => {
    return fetcher(`/api/lessons/${id}`);
  },

  getQuizQuestions: async (lessonId: number) => {
    return fetcher(`/api/lessons/${lessonId}/quiz-questions`);
  },

  getNotes: async (lessonId: number) => {
    return fetcher(`/api/lessons/${lessonId}/notes`);
  },

  // Auth
  checkAuth: async () => {
    return api.checkAuth();
  },

  // CRUD operations
  createCourse: async (courseData: any) => {
    return fetcher('/api/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  },

  updateCourse: async (id: number, data: any) => {
    return fetcher(`/api/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteCourse: async (id: number) => {
    return fetcher(`/api/courses/${id}`, {
      method: 'DELETE'
    });
  },

  createModule: async (moduleData: any) => {
    return fetcher('/api/modules', {
      method: 'POST',
      body: JSON.stringify(moduleData)
    });
  },

  updateModule: async (id: number, data: any) => {
    return fetcher(`/api/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteModule: async (id: number) => {
    return fetcher(`/api/modules/${id}`, {
      method: 'DELETE'
    });
  },

  createLesson: async (lessonData: any) => {
    return fetcher('/api/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData)
    });
  },

  updateLesson: async (id: number, data: any) => {
    return fetcher(`/api/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  deleteLesson: async (id: number) => {
    return fetcher(`/api/lessons/${id}`, {
      method: 'DELETE'
    });
  }
}; 
