// src/pages/LessonPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LessonPlayer from '../features/course/components/LessonPlayer';
import { apiRequest } from '@/lib/queryClient';

interface LessonData {
  _id: string;
  title: string;
  videoUrl: string;
  content: string;
  duration: string;
}

const LessonPage: React.FC = () => {
  const { courseId, moduleId, lessonId } = useParams<{
    courseId: string;
    moduleId: string;
    lessonId: string;
  }>();
  
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch lesson: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setLesson(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching lesson:', err);
        setError('Failed to load lesson');
        setLoading(false);
      }
    };

    if (courseId && moduleId && lessonId) {
      fetchLesson();
    }
  }, [courseId, moduleId, lessonId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Lesson not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 gap-6">
        {/* Video Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <LessonPlayer 
            lessonId={lesson._id} 
            title={lesson.title} 
            thumbnailUrl={`https://via.placeholder.com/640x360?text=${encodeURIComponent(lesson.title)}`} 
          />
        </div>
        
        {/* Lesson Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Lesson Content</h3>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
