import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  lessonId: string;
  thumbnailUrl?: string;
}

const BasicVideoPlayer: React.FC<VideoPlayerProps> = ({ lessonId, thumbnailUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Component mounted - load the video immediately
  useEffect(() => {
    const loadVideo = async () => {
      if (!videoRef.current) return;
      
      // Just use a hardcoded URL
      const apiUrl = 'http://localhost:4000';
      const videoUrl = `${apiUrl}/api/videos/${lessonId}/master.m3u8`;
      console.log('Loading video from:', videoUrl);
      
      // First, do a direct fetch to verify we can access the master playlist
      try {
        const response = await fetch(videoUrl, {
          // Don't send credentials to avoid CORS issues
          credentials: 'omit'
        });
        
        if (response.ok) {
          const text = await response.text();
          console.log('Successfully fetched master playlist:', text.slice(0, 100) + '...');
        } else {
          console.error('Error fetching master playlist:', response.status, response.statusText);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
      
      // If HLS.js is supported, use it
      if (Hls.isSupported()) {
        const hls = new Hls({
          // IMPORTANT: Don't use credentials since we're getting CORS errors
          xhrSetup: (xhr) => {
            // Set withCredentials to false to avoid CORS issues
            xhr.withCredentials = false;
          }
        });
        
        hls.loadSource(videoUrl);
        hls.attachMedia(videoRef.current);
        
        console.log('HLS player initialized');
        
        // Add more detailed event listeners to debug loading process
        hls.on(Hls.Events.MANIFEST_LOADED, (event, data) => {
          console.log('Manifest loaded:', data);
        });
        
        hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
          console.log('Level loaded:', data);
        });
        
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log('Media attached successfully');
        });
        
        // Enhanced error handling
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
          console.error('Error details:', {
            type: data.type,
            details: data.details,
            fatal: data.fatal,
            url: data.url,
            response: data.response
          });
          
          if (data.fatal) {
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              console.log('Network error, trying to recover');
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              console.log('Media error, trying to recover');
              hls.recoverMediaError();
            }
          }
        });
      } 
      // For Safari
      else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = videoUrl;
      }
    };
    
    // Load immediately
    console.log('Component mounted, loading video for lesson:', lessonId);
    loadVideo();
    
    // Cleanup
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
      }
    };
  }, [lessonId]);

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        controls
        style={{ width: '100%', height: 'auto', minHeight: '300px' }}
        poster={thumbnailUrl || undefined}
        playsInline
      />
    </div>
  );
};

export default BasicVideoPlayer;