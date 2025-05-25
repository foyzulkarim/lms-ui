import React, { useState } from 'react';

interface SimpleHlsPlayerProps {
  lessonId: string;
  thumbnailUrl?: string;
}

const SimpleHlsPlayer: React.FC<SimpleHlsPlayerProps> = ({ lessonId, thumbnailUrl }) => {
  const [showVideo, setShowVideo] = useState(false);

  console.log('SimpleHlsPlayer lessonId', lessonId);

  const startVideo = () => {
    console.log('Starting video...');
    setShowVideo(true);
  };

  if (!showVideo) {
    return (
      <div 
        onClick={startVideo}
        style={{ 
          position: 'relative',
          cursor: 'pointer',
          width: '100%',
          backgroundColor: '#000',
          borderRadius: '0.375rem',
          overflow: 'hidden'
        }}
      >
        <img 
          src={thumbnailUrl || 'https://via.placeholder.com/640x360?text=Click+to+Play'}
          alt="Video thumbnail"
          style={{ width: '100%', height: 'auto' }}
        />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z"></path>
          </svg>
        </div>
      </div>
    );
  }

  // Direct iframe approach for simplicity
  return (
    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '0.375rem' }}>
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
        allow="autoplay; encrypted-media"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default SimpleHlsPlayer;
