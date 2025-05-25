// src/components/VideoPlayer.tsx
import React, { useState, useEffect } from 'react';
import ReactHlsPlayer from 'react-hls-player';
import { apiRequest } from '@/lib/queryClient';

interface VideoPlayerProps {
  videoId: string;
  useProxy?: boolean; // Flag to choose between signed URLs or proxy approach
  thumbnailUrl?: string; // URL for the video thumbnail
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  useProxy = true, // Default to using the proxy to avoid CORS issues
  thumbnailUrl
}) => {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playerRef = React.useRef<HTMLVideoElement>(null);

  // Get API base URL from environment variable
  const getApiBaseUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const handleThumbnailClick = async () => {
    setIsPlaying(true);
    setLoading(true);
    await fetchStreamUrl();
  };

  const fetchStreamUrl = async () => {
    try {
      // Use the new improved video streaming endpoint
      const endpoint = `/api/videos/${videoId}/master.m3u8`;

      console.log('Fetching video stream from endpoint:', endpoint);

      // Get the API base URL from environment or use default
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const fullUrl = `${apiBaseUrl}${endpoint}`;
      
      // Make a direct fetch request to get the m3u8 content
      const response = await fetch(fullUrl, {
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Accept': 'application/vnd.apple.mpegurl',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
      }

      // For debugging
      console.log('Response headers:', [...response.headers.entries()]);

      // Get the text data from the response
      const m3u8Content = await response.text();
      console.log('M3U8 content:', m3u8Content.substring(0, 200) + '...');

      // Create blob with the content
      const blob = new Blob([m3u8Content], { type: 'application/vnd.apple.mpegurl' });
      const url = URL.createObjectURL(blob);

      console.log('Created blob URL for HLS manifest');
      setStreamUrl(url);
      setLoading(false);
    } catch (err) {
      setError(`Failed to load video stream: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
      console.error('Error fetching video stream:', err);
    }
  };

  // Clean up blob URL when component unmounts
  useEffect(() => {
    return () => {
      if (streamUrl) {
        URL.revokeObjectURL(streamUrl);
      }
    };
  }, [streamUrl]);

  if (loading) {
    return <div className="flex justify-center items-center p-8">Loading video...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  // Show thumbnail with play button until user clicks to play
  if (!isPlaying) {
    return (
      <div
        className="video-thumbnail-container relative cursor-pointer"
        onClick={handleThumbnailClick}
      >
        <img
          src={thumbnailUrl || `https://img.youtube.com/vi/placeholder/0.jpg`}
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

  return (
    <div className="video-player-container">
      {streamUrl && (
        <ReactHlsPlayer
          playerRef={playerRef}
          src={streamUrl}
          autoPlay={true}
          controls={true}
          width="100%"
          height="auto"
          hlsConfig={{
            maxLoadingDelay: 4,
            minAutoBitrate: 0,
            lowLatencyMode: true,
            debug: true, // Enable debug logs to help troubleshoot
            xhrSetup: (xhr: XMLHttpRequest, url: string) => {
              // Include credentials for all requests
              xhr.withCredentials = true;
              
              // Add custom headers if needed
              xhr.setRequestHeader('Accept', 'application/vnd.apple.mpegurl');
              
              // Log the URL being requested (for debugging)
              console.log('HLS.js requesting:', url);
            }            
          }}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
