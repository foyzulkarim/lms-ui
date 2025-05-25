import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface SimpleVideoPlayerProps {
  lessonId: string;
  thumbnailUrl?: string;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
  onError?: (error: string) => void;
}

const SimpleVideoPlayer: React.FC<SimpleVideoPlayerProps> = ({
  lessonId,
  thumbnailUrl,
  autoPlay = false,
  controls = true,
  className = '',
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const hlsRef = useRef<Hls | null>(null);

  // Clean up HLS instance on component unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  // Adding debug logging
  useEffect(() => {
    console.log("SimpleVideoPlayer props:", { lessonId, autoPlay, isPlaying });
    
    // Debug environment variables
    const env = {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      DEV: import.meta.env.DEV,
      MODE: import.meta.env.MODE,
      BASE_URL: import.meta.env.BASE_URL,
    };
    console.log("Environment variables:", env);
  }, [lessonId, autoPlay, isPlaying]);

  useEffect(() => {
    // If video is playing or set to autoplay, load the video
    if ((isPlaying || autoPlay) && videoRef.current) {
      loadVideo();
    }
  }, [isPlaying, autoPlay, lessonId]);

  const loadVideo = async () => {
    if (!lessonId) {
      const errorMsg = 'No lesson ID provided';
      console.error(errorMsg);
      setError(errorMsg);
      if (onError) onError(errorMsg);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Clean up previous HLS instance if it exists
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (!videoRef.current) {
        const errorMsg = 'Video element not found';
        setError(errorMsg);
        if (onError) onError(errorMsg);
        setLoading(false);
        return;
      }

      // Use localhost:4000 directly since environment variables aren't working
      const apiBaseUrl = 'http://localhost:4000';
      
      // Build the URL to the master playlist
      const masterPlaylistUrl = `${apiBaseUrl}/api/videos/${lessonId}/master.m3u8`;
      console.log(`Using direct API URL: ${masterPlaylistUrl}`);
      
      console.log('Loading video from:', masterPlaylistUrl);

      // Check if HLS.js is supported
      if (Hls.isSupported()) {
        const hls = new Hls({
          xhrSetup: (xhr) => {
            // Include credentials in all XHR requests made by hls.js
            xhr.withCredentials = true;
          },
          maxLoadingDelay: 4,
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
        });
        
        hls.attachMedia(videoRef.current);
        
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          console.log('HLS media attached');
          hls.loadSource(masterPlaylistUrl);
        });
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed');
          setLoading(false);
          
          if (autoPlay) {
            videoRef.current?.play().catch(e => {
              console.error('Error auto-playing video:', e);
            });
          }
        });
        
        // Handle errors
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // Try to recover network error
                console.log('Fatal network error encountered, trying to recover');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Fatal media error encountered, trying to recover');
                hls.recoverMediaError();
                break;
              default:
                // Cannot recover
                setError(`Fatal error: ${data.details}`);
                setLoading(false);
                hls.destroy();
                break;
            }
          }
        });
        
        hlsRef.current = hls;
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // For Safari on iOS - use native HLS support
        console.log('Using native HLS support');
        videoRef.current.src = masterPlaylistUrl;
        
        videoRef.current.addEventListener('loadedmetadata', () => {
          setLoading(false);
          
          if (autoPlay) {
            videoRef.current?.play().catch(e => {
              console.error('Error auto-playing video:', e);
            });
          }
        });
        
        videoRef.current.addEventListener('error', () => {
          const err = videoRef.current?.error;
          setError(`Video error: ${err?.message || 'Unknown error'}`);
          setLoading(false);
        });
      } else {
        setError('HLS is not supported in this browser');
        setLoading(false);
      }
    } catch (err) {
      const errorMsg = `Failed to load video: ${err instanceof Error ? err.message : String(err)}`;
      console.error('Error loading video:', err);
      setError(errorMsg);
      if (onError) onError(errorMsg);
      setLoading(false);
    }
  };

  const handleThumbnailClick = () => {
    console.log("Thumbnail clicked, loading video directly");
    setIsPlaying(true);
    
    // Call loadVideo directly instead of waiting for useEffect
    // This ensures more immediate response to user interaction
    setTimeout(() => {
      if (videoRef.current) {
        loadVideo();
      }
    }, 0);
  };

  // Show loading state
  if (loading && !isPlaying) {
    return (
      <div className={`flex justify-center items-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`text-red-500 p-4 ${className}`}>
        <p>Error: {error}</p>
        <button 
          onClick={() => { setError(null); loadVideo(); }}
          className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show thumbnail with play button until user clicks to play
  if (!isPlaying && !autoPlay) {
    return (
      <div
        className={`relative cursor-pointer ${className}`}
        onClick={handleThumbnailClick}
      >
        <img
          src={thumbnailUrl || `https://via.placeholder.com/640x360?text=Video+Thumbnail`}
          alt="Video thumbnail"
          className="w-full h-auto rounded-md"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-60 rounded-full p-4">
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

  // Show video player
  return (
    <div className={`video-player-container relative ${className}`}>
      <video
        ref={videoRef}
        controls={controls}
        className="w-full h-auto rounded-md"
        playsInline // Important for iOS
        style={{ minHeight: '240px' }} // Ensure there's visible height
      />
      {loading && isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default SimpleVideoPlayer;