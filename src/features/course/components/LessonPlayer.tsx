// src/features/course/components/LessonPlayer.tsx
import React from 'react';
import HlsPlayer from './HlsPlayer';

interface LessonPlayerProps {
  lessonId: string;
  title: string;
  thumbnailUrl?: string;
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({ lessonId, title }) => {
  // Super simple component using iframe-based player
  console.log("LessonPlayer rendering with lessonId:", lessonId);
  
  if (!lessonId) {
    return <div className="text-red-500 p-4">Error: Missing video ID</div>;
  }
  
  return (
    <HlsPlayer 
          lessonId={lessonId} 
        />
  );
};

export default LessonPlayer;
