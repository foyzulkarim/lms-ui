// src/features/course/components/HlsVideoPlayer.tsx
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface HlsVideoPlayerProps {
  videoId: string;
  thumbnailUrl?: string;
  autoPlay?: boolean;
  controls?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const HlsVideoPlayer: React.FC<HlsVideoPlayerProps> = ({
  videoId,
  thumbnailUrl,
  autoPlay = false,
  controls = true,
  width = '100%',
  height = 'auto',
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    // Clean up previous HLS instance if it exists
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying && videoRef.current) {
      loadVideo();
    }
  }, [isPlaying, videoId]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if HLS.js is supported
      if (!Hls.isSupported()) {
        console.log('HLS is not supported in this browser. Trying native playback.');
        // Try native playback
        if (videoRef.current) {
          const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
          const streamUrl = `${apiBaseUrl}/api/videos/${videoId}/master.m3u8`;
          
          videoRef.current.src = streamUrl;
          videoRef.current.addEventListener('loadedmetadata', () => {
            setLoading(false);
            if (autoPlay) {
              videoRef.current?.play().catch(e => {
                console.error('Error auto-playing video:', e);
                setError('Failed to auto-play video. Please click play.');
              });
            }
          });
          
          videoRef.current.addEventListener('error', () => {
            setError('Failed to load video with native playback');
            setLoading(false);
          });
          
          return;
        }
        
        setError('HLS is not supported in your browser');
        setLoading(false);
        return;
      }

      // Get the API base URL from environment or use default
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const streamUrl = `${apiBaseUrl}/api/videos/${videoId}/master.m3u8`;

      console.log('Loading HLS stream from:', streamUrl);

      // Create a new HLS instance
      const hls = new Hls({
        xhrSetup: (xhr, url) => {
          // Include credentials for all requests
          xhr.withCredentials = true;
          
          // Log requests for debugging
          console.log('HLS.js requesting:', url);
        },
        debug: true,
      });

      // Bind HLS to the video element
      hls.attachMedia(videoRef.current!);

      // Handle HLS events
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        console.log('HLS.js attached to video element');
        hls.loadSource(streamUrl);
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('HLS.js manifest parsed, found ' + data.levels.length + ' quality levels');
        if (autoPlay) {
          videoRef.current?.play().catch(e => {
            console.error('Error auto-playing video:', e);
            setError('Failed to auto-play video. Please click play.');
          });
        }
        setLoading(false);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS.js error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              // Cannot recover
              hls.destroy();
              setError(`Fatal error: ${data.details}`);
              setLoading(false);
              break;
          }
        }
      });

      // Store the HLS instance for cleanup
      hlsRef.current = hls;
    } catch (err) {
      console.error('Error setting up HLS player:', err);
      setError(`Failed to load video: ${err instanceof Error ? err.message : String(err)}`);
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
    <div className={`video-player-container ${className}`}>
      <video
        ref={videoRef}
        controls={controls}
        style={{ width, height }}
        className="rounded-md"
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default HlsVideoPlayer;
