// src/features/course/components/LessonVideo.tsx
import React from 'react';
import VideoPlayer from './VideoPlayer';

interface LessonVideoProps {
  lessonId: string;
  title: string;
  thumbnailUrl?: string;
}

const LessonVideo: React.FC<LessonVideoProps> = ({ lessonId, title, thumbnailUrl }) => {
  return (
    <div className="lesson-video-container">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="video-wrapper rounded-lg overflow-hidden shadow-lg">
        <VideoPlayer 
          lessonId={lessonId} 
          thumbnailUrl={thumbnailUrl}
          className="w-full aspect-video"
        />
      </div>
    </div>
  );
};

export default LessonVideo;
