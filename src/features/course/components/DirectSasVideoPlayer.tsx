import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface DirectSasVideoPlayerProps {
  lessonId: string;
  thumbnailUrl?: string;
  apiBaseUrl?: string;
}

const DirectSasVideoPlayer: React.FC<DirectSasVideoPlayerProps> = ({ 
  lessonId, 
  thumbnailUrl,
  apiBaseUrl = 'http://localhost:4000'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Function to load the video
  const loadVideo = () => {
    console.log('DirectSasVideoPlayer loadVideo', {lessonId, videoRef: videoRef.current});
    if (!videoRef.current) {
      console.error('Video element reference is null');
      setError('Failed to initialize video player');
      return;
    }
    
    console.log('DirectSasVideoPlayer lessonId', lessonId);

    setLoading(true);
    setError(null);
    
    try {
      // Using a proxy endpoint that will generate SAS tokens for the master playlist and all segments
      // The API should process the m3u8 file and replace all segment URLs with signed URLs
      const masterPlaylistUrl = `${apiBaseUrl}/api/direct-video/${lessonId}/master`;
      
      console.log('Loading R2 video from:', masterPlaylistUrl);
      
      // Clean up any existing HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      // Check if HLS.js is supported
      if (Hls.isSupported()) {
        // Create new HLS instance
        const hls = new Hls({
          xhrSetup: (xhr) => {
            // Enable CORS for R2 requests
            xhr.withCredentials = false;
          },
          // Use default segment loader to handle signed URLs
          // This ensures each segment request goes through our API proxy
          maxBufferLength: 30,
          debug: process.env.NODE_ENV === 'development'
        });
        
        hlsRef.current = hls;
        
        // Setup HLS.js
        hls.loadSource(masterPlaylistUrl);
        hls.attachMedia(videoRef.current);
        
        // Event listeners
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest parsed successfully');
          setLoading(false);
          videoRef.current?.play().catch(e => {
            console.warn('Autoplay prevented:', e);
          });
        });
        
        // Error handling
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
          
          // Only show fatal errors to the user
          if (data.fatal) {
            setError(`Video playback error: ${data.details}`);
            setLoading(false);
          }
        });
      } 
      // For Safari
      else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = masterPlaylistUrl;
        videoRef.current.addEventListener('loadedmetadata', () => {
          setLoading(false);
          videoRef.current?.play().catch(e => {
            console.warn('Autoplay prevented:', e);
          });
        });
        
        videoRef.current.addEventListener('error', () => {
          setError('Error loading video');
          setLoading(false);
        });
      } 
      else {
        setError('Your browser does not support HLS video playback');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error setting up video:', err);
      setError(`Failed to load video: ${err}`);
      setLoading(false);
    }
  };
  
  // Handle thumbnail click - load the video and set isPlaying state
  const handleThumbnailClick = () => {
    console.log('Thumbnail clicked, loading video');
    setIsPlaying(true);
    loadVideo(); // Load the video immediately when clicked
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      }
    };
  }, []);
  
  return (
    <div className="video-player-container relative">
      {/* Always render the video element but keep it hidden when not playing */}
      <video
        ref={videoRef}
        controls
        className={`w-full h-auto rounded-md ${isPlaying && !loading && !error ? 'block' : 'hidden'}`}
        style={{ minHeight: '240px', backgroundColor: '#000' }}
        playsInline
      />
      
      {/* Show thumbnail when not playing */}
      {!isPlaying && (
        <div 
          className="video-thumbnail-container relative cursor-pointer" 
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
      )}
      
      {/* Show loading state */}
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-70 rounded-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}
      
      {/* Show error state */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          <p>{error}</p>
          <button 
            onClick={() => { 
              setError(null); 
              setIsPlaying(false);
            }}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default DirectSasVideoPlayer;

