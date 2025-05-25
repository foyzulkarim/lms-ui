import React, { useEffect, useRef, useState } from 'react';

interface DirectVideoPlayerProps {
  lessonId: string;
  thumbnailUrl?: string;
}

const DirectVideoPlayer: React.FC<DirectVideoPlayerProps> = ({ lessonId, thumbnailUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initial state showing the thumbnail with play button
  if (!isPlaying) {
    return (
      <div
        className="video-thumbnail-container relative cursor-pointer"
        onClick={() => setIsPlaying(true)}
        style={{ width: '100%', position: 'relative' }}
      >
        <img
          src={thumbnailUrl || `https://via.placeholder.com/640x360?text=Video`}
          alt="Video thumbnail"
          style={{ width: '100%', height: 'auto' }}
        />
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
        >
          <div style={{ 
            backgroundColor: 'rgba(0,0,0,0.6)', 
            borderRadius: '50%', 
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="white"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }
  
  // If we have an error, show the error message
  if (error) {
    return (
      <div style={{ color: 'red', padding: '1rem' }}>
        <p>Error loading video: {error}</p>
        <button 
          onClick={() => setError(null)}
          style={{ 
            marginTop: '0.5rem', 
            padding: '0.5rem 1rem', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            borderRadius: '0.25rem' 
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Direct iframe approach - using R2 SAS token directly
  // This will load the HTML5 video player from your backend
  return (
    <div style={{ width: '100%', height: 0, paddingBottom: '56.25%', position: 'relative' }}>
      <iframe 
        src={`http://localhost:4000/debug/${lessonId}`}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          border: 'none' 
        }}
        allowFullScreen
      />
    </div>
  );
};

export default DirectVideoPlayer;