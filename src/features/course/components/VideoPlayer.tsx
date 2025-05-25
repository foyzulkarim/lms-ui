// src/features/course/components/VideoPlayer.tsx
import React, { useState, useEffect, useRef } from 'react';
import ReactHlsPlayer from 'react-hls-player';
import { apiRequest } from '@/lib/queryClient';

interface VideoPlayerProps {
  lessonId: string;
  thumbnailUrl?: string;
  autoPlay?: boolean;
  controls?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lessonId,
  thumbnailUrl,
  autoPlay = false,
  controls = true,
  width = '100%',
  height = 'auto',
  className = '',
}) => {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const playerRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // If autoPlay is true or user has clicked play, fetch the stream URL
    if (isPlaying) {
      fetchStreamUrl();
    }
  }, [isPlaying, lessonId]);

  const fetchStreamUrl = async () => {
    try {
      setLoading(true);
      
      // Get the API base URL from environment or use default
      const apiBaseUrl = import.meta.env.VITE_API_URL || '';
      
      // Construct the URL to the master playlist
      const masterPlaylistUrl = `${apiBaseUrl}/api/videos/${lessonId}/master.m3u8`;
      
      console.log('Fetching master playlist from:', masterPlaylistUrl);
      
      // Make the request to get the master playlist
      const response = await fetch(masterPlaylistUrl, {
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Accept': 'application/vnd.apple.mpegurl',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
      }
      
      // Set the stream URL directly to the master playlist URL
      // The HLS player will handle requesting the variant playlists and segments
      setStreamUrl(masterPlaylistUrl);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching video stream:', err);
      setError(`Failed to load video: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  };

  const handleThumbnailClick = () => {
    setIsPlaying(true);
  };

  // Show loading state
  if (loading && !streamUrl) {
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
          onClick={() => { setError(null); fetchStreamUrl(); }}
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
      {streamUrl && (
        <ReactHlsPlayer
          playerRef={playerRef}
          src={streamUrl}
          autoPlay={isPlaying}
          controls={controls}
          width={width}
          height={height}
          hlsConfig={{
            maxLoadingDelay: 4,
            minAutoBitrate: 0,
            lowLatencyMode: true,
            xhrSetup: (xhr: XMLHttpRequest) => {
              // Include credentials in all XHR requests made by hls.js
              xhr.withCredentials = true;
            }
          }}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
