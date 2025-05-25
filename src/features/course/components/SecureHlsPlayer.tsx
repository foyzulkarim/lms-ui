import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface SecureHlsPlayerProps {
  lessonId: string;
  thumbnailUrl?: string;
  autoPlay?: boolean;
  controls?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
  onError?: (error: string) => void;
  onReady?: () => void;
}

const SecureHlsPlayer: React.FC<SecureHlsPlayerProps> = ({
  lessonId,
  thumbnailUrl,
  autoPlay = false,
  controls = true,
  width = '100%',
  height = 'auto',
  className = '',
  onError,
  onReady,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const hlsRef = useRef<Hls | null>(null);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;

  // Clean up HLS instance on component unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, []);

  // When lessonId changes or isPlaying becomes true, load the video
  useEffect(() => {
    if (isPlaying && videoRef.current) {
      loadVideo();
    }
  }, [isPlaying, lessonId]);

  const handleError = (message: string) => {
    setError(message);
    if (onError) onError(message);
  };

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Clean up previous HLS instance if it exists
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Check if video element is available
      if (!videoRef.current) {
        handleError('Video element not found');
        setLoading(false);
        return;
      }

      // Check if HLS.js is supported
      if (!Hls.isSupported()) {
        console.log('HLS is not supported in this browser. Trying native playback.');
        
        // Try native playback for Safari and iOS
        const apiBaseUrl = import.meta.env.VITE_API_URL || '';
        const streamUrl = `${apiBaseUrl}/api/videos/${lessonId}/master.m3u8`;
        
        videoRef.current.src = streamUrl;
        videoRef.current.addEventListener('loadedmetadata', () => {
          setLoading(false);
          if (onReady) onReady();
          
          if (autoPlay) {
            videoRef.current?.play().catch(e => {
              console.error('Error auto-playing video:', e);
              handleError('Failed to auto-play video. Please click play.');
            });
          }
        });
        
        videoRef.current.addEventListener('error', (e) => {
          const error = videoRef.current?.error;
          const errorMessage = error ? 
            `Video error: ${error.code} - ${error.message}` : 
            'Unknown video error occurred';
          
          console.error(errorMessage, e);
          handleError(errorMessage);
          setLoading(false);
        });
        
        return;
      }

      // Get the API base URL from environment variables
      const apiBaseUrl = import.meta.env.VITE_API_URL || '';
      const streamUrl = `${apiBaseUrl}/api/videos/${lessonId}/master.m3u8`;

      console.log(`Loading HLS stream from: ${streamUrl}`);

      // Create a new HLS instance with appropriate configuration
      const hls = new Hls({
        xhrSetup: (xhr, url) => {
          // Include credentials in all XHR requests
          xhr.withCredentials = true;
          
          // Log requests for debugging (remove in production)
          if (import.meta.env.DEV) {
            console.log('HLS.js requesting:', url);
          }
        },
        // Enable debug in development only
        debug: import.meta.env.DEV,
        // Tune these parameters for better performance if needed
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000, // 60MB
        maxBufferHole: 0.5,
        lowLatencyMode: false,
      });

      // Bind HLS to the video element
      hls.attachMedia(videoRef.current);

      // Handle HLS events
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('HLS.js attached to video element');
        hls.loadSource(streamUrl);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log(`HLS.js manifest parsed, found ${data.levels.length} quality levels`);
        
        setLoading(false);
        if (onReady) onReady();
        
        // Auto-play if specified
        if (autoPlay) {
          videoRef.current?.play().catch(e => {
            console.error('Error auto-playing video:', e);
            handleError('Failed to auto-play video. Please click play.');
          });
        }
      });

      // Handle errors
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS.js error:', data);
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (retryCountRef.current < maxRetries) {
                console.log(`Network error, trying to recover... (Attempt ${retryCountRef.current + 1}/${maxRetries})`);
                retryCountRef.current++;
                hls.startLoad();
              } else {
                hls.destroy();
                hlsRef.current = null;
                handleError(`Network error: ${data.details}. Please check your connection and try again.`);
                setLoading(false);
              }
              break;
              
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover...');
              hls.recoverMediaError();
              break;
              
            default:
              // Cannot recover
              hls.destroy();
              hlsRef.current = null;
              handleError(`Fatal error: ${data.details}`);
              setLoading(false);
              break;
          }
        } else {
          // Non-fatal error
          console.warn('Non-fatal HLS.js error:', data);
        }
      });

      // Store the HLS instance for cleanup
      hlsRef.current = hls;
      
      // Reset retry counter whenever we successfully load a new video
      retryCountRef.current = 0;
      
    } catch (err) {
      console.error('Error setting up HLS player:', err);
      handleError(`Failed to load video: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  };

  const handleThumbnailClick = () => {
    setIsPlaying(true);
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
          onClick={() => { 
            setError(null); 
            retryCountRef.current = 0;
            loadVideo(); 
          }}
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
        style={{ width, height }}
        className="rounded-md"
        playsInline // Important for iOS
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default SecureHlsPlayer; 
