import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  lessonId?: string;
}

const HlsPlayer: React.FC<HlsPlayerProps> = ({ lessonId = '68285091fb9f0dd6940c9db3' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hls, setHls] = useState<Hls | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [levels, setLevels] = useState<Array<{ height: number; width: number; bitrate: number }>>([]);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const controlsHideTimeout = useRef<NodeJS.Timeout | null>(null);

  // Refs for state values to be used in setTimeout callbacks
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const isHoveringRef = useRef(isHovering);
  useEffect(() => { isHoveringRef.current = isHovering; }, [isHovering]);

  const showVolumeSliderRef = useRef(showVolumeSlider);
  useEffect(() => { showVolumeSliderRef.current = showVolumeSlider; }, [showVolumeSlider]);

  // Function to make controls visible and cancel any pending auto-hide timer.
  const ensureControlsVisibleAndCancelAutoHide = useCallback(() => {
    setIsControlsVisible(true);
    if (controlsHideTimeout.current) {
      clearTimeout(controlsHideTimeout.current);
      controlsHideTimeout.current = null;
    }
  }, []);

  // Function to start (or restart) the auto-hide timer for controls.
  const startAutoHideControlsTimer = useCallback(() => {
    if (controlsHideTimeout.current) { // Clear existing timer
      clearTimeout(controlsHideTimeout.current);
    }
    controlsHideTimeout.current = setTimeout(() => {
      // Only hide if video is playing, user is not hovering, and volume slider isn't active.
      if (isPlayingRef.current && !isHoveringRef.current && !showVolumeSliderRef.current) {
        setIsControlsVisible(false);
      }
    }, 3000); // Hide after 3 seconds
  }, []); // Refs are stable, so no dependencies needed for useCallback itself.

  // Effect to manage control visibility based on player state and interactions.

  // Effect to manage control visibility based on player state and interactions.
  useEffect(() => {
    if (!isPlaying || isHovering || showVolumeSlider) {
      ensureControlsVisibleAndCancelAutoHide();
    } else if (isPlaying) {
      startAutoHideControlsTimer();
    }
  }, [isPlaying, isHovering, showVolumeSlider, ensureControlsVisibleAndCancelAutoHide, startAutoHideControlsTimer]);

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (!Hls.isSupported()) {
      console.error('HLS is not supported in this browser');
      setErrorMessage('HLS is not supported in this browser');
      setIsLoading(false);
      return;
    }

    const hlsConfig = {
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      liveSyncDuration: 3,
      enableWorker: true,
      startLevel: -1,
      abrEwmaDefaultEstimate: 1000000,
      abrBandWidthFactor: 0.95,
      abrBandWidthUpFactor: 0.7,
      maxBufferHole: 0.5,
      lowLatencyMode: false,
      backBufferLength: 30
    };

    const hlsInstance = new Hls(hlsConfig);
    setHls(hlsInstance);

    const manifestUrl = `http://localhost:4000/api/hls/stream/${lessonId}`;

    hlsInstance.loadSource(manifestUrl);
    hlsInstance.attachMedia(video);

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      console.log('Manifest parsed, video ready to play');
      console.log('Available quality levels:', hlsInstance.levels);
      setLevels(hlsInstance.levels);
      setCurrentLevel(hlsInstance.currentLevel);
      setIsReady(true);
      setIsLoading(false);
      setErrorMessage(null);
    });

    hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      setCurrentLevel(data.level);
      setIsLoading(false); // Stop loading indicator when level switches
    });

    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS error', event, data);
      setErrorMessage(`HLS Error: ${data.details}`);
      setIsLoading(false);
    });

    return () => {
      hlsInstance.destroy();
      setHls(null);
    };
  }, [lessonId]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);

    const handlePlay = () => {
      setIsPlaying(true);
      // Main useEffect will handle control visibility logic.
    };

    const handlePause = () => {
      setIsPlaying(false);
      // Main useEffect will handle control visibility logic.
    };

    const handleVideoVolumeChange = () => { // Renamed to avoid conflict
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleLoadStart = () => setIsLoading(true);

    const handleCanPlay = () => {
      setIsLoading(false);
      // Main useEffect and interaction handlers will manage control visibility.
      
      // Capture the first frame as poster
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Set the poster directly on the video element
          video.poster = canvas.toDataURL('image/jpeg', 0.95);
          console.log('First frame captured as poster');
        }
      } catch (err) {
        console.error('Error capturing first frame:', err);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVideoVolumeChange);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);

    // Set initial volume
    video.volume = volume;
    video.muted = isMuted;

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVideoVolumeChange);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [volume, isMuted]); // Dependencies updated

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play().catch(error => console.error("Error attempting to play video:", error));
    } else {
      video.pause();
    }
    // isPlaying state will be updated by video events ('play', 'pause'), 
    // which in turn triggers the main useEffect for control visibility.
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || !isReady) return;

    const seekTime = (parseFloat(event.target.value) / 100) * duration;
    video.currentTime = seekTime;
    ensureControlsVisibleAndCancelAutoHide();
    if (isPlayingRef.current) {
      startAutoHideControlsTimer();
    }
  };

  const handleVolumeSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => { // Renamed to avoid conflict
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(event.target.value);
    video.volume = newVolume;
    // The video's 'volumechange' event will update the 'volume' and 'isMuted' states.
    ensureControlsVisibleAndCancelAutoHide(); // Keep controls visible while interacting
    // Timer will be restarted by onMouseUp on the slider or by main useEffect if mouse leaves volume area
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    // The video's 'volumechange' event will update 'isMuted' state.
    ensureControlsVisibleAndCancelAutoHide();
    if (isPlayingRef.current) {
      startAutoHideControlsTimer();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Request fullscreen mode
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
          })
          .catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
      }
    } else {
      // Exit fullscreen mode
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => {
            setIsFullscreen(false);
          })
          .catch(err => {
            console.error(`Error attempting to exit fullscreen: ${err.message}`);
          });
      }
    }

    ensureControlsVisibleAndCancelAutoHide();
    if (isPlayingRef.current) {
      startAutoHideControlsTimer();
    }
  };

  // Listen for fullscreen change events from browser
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleQualityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const level = parseInt(event.target.value, 10);
    if (hls && isReady) {
      setIsLoading(true); // Show loading indicator while quality switches
      hls.currentLevel = level;
      // setCurrentLevel(level); // HLS LEVEL_SWITCHED event will update this state
    }
    ensureControlsVisibleAndCancelAutoHide();
    if (isPlayingRef.current) {
      startAutoHideControlsTimer();
    }
  };

  const formatBitrate = (bitrate: number) => {
    return `${(bitrate / 1000000).toFixed(1)}M`;
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 && !isNaN(duration) && !isNaN(currentTime) ? (currentTime / duration) * 100 : 0;

  const sliderStyles = `
    .progress-bar::-webkit-slider-thumb {
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #8B5CF6;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
      transition: all 0.2s ease;
    }
    
    .progress-bar::-webkit-slider-thumb:hover {
      transform: scale(1.2);
      box-shadow: 0 6px 12px rgba(139, 92, 246, 0.6);
    }
    
    .volume-slider::-webkit-slider-thumb {
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #8B5CF6;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(139, 92, 246, 0.4);
    }
    
    .progress-bar::-moz-range-thumb,
    .volume-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #8B5CF6;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      <div
        ref={containerRef}
        className={`relative rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ease-out backdrop-blur-xl border border-white/10 ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full'
          }`}
        onMouseEnter={() => {
          isHoveringRef.current = true;
          setIsHovering(true);
        }}
        onMouseLeave={() => {
          isHoveringRef.current = false;
          setIsHovering(false);
          // If volume slider is meant to hide when mouse leaves container entirely
          if (showVolumeSlider) {
            showVolumeSliderRef.current = false;
            setShowVolumeSlider(false);
          }
        }}
        onMouseMove={() => {
          if (!isControlsVisible) {
            ensureControlsVisibleAndCancelAutoHide();
          }
          if (isPlayingRef.current) {
            startAutoHideControlsTimer();
          }
        }}
      >
        {/* Video Container */}
        <div className="relative w-full aspect-video bg-gradient-to-br from-gray-900 to-black">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`
            }}></div>
          </div>

          {/* Video Element */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover cursor-pointer"
            onClick={(e) => {
              if (!isReady) return; // Don't do anything if video not ready
              // Always toggle play/pause when clicking on the video
              togglePlayPause();
              // Ensure controls are visible
              ensureControlsVisibleAndCancelAutoHide();
              // If video is playing, start auto-hide timer
              if (isPlayingRef.current) {
                startAutoHideControlsTimer();
              }
            }}
            onTouchStart={() => { // For mobile
              if (!isReady) return;
              // We only show controls on touch start, actual play/pause will be handled on touch end (click)
              ensureControlsVisibleAndCancelAutoHide();
              if (isPlayingRef.current) {
                startAutoHideControlsTimer();
              }
            }}
            autoPlay={false} // Disabled autoplay so user must click play
            poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjMTExODI3Ii8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjIyNSIgcj0iNDAiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSIzODUiIHk9IjIxMCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik08IDV2MTRsMTEtN3oiLz4KPC9zdmc+Cjwvc3ZnPgo="
          >
            Your browser does not support the video tag.
          </video>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="flex flex-col items-center space-y-4 bg-black/40 p-6 rounded-xl backdrop-blur-md border border-white/10 shadow-2xl">
                <div className="relative flex items-center justify-center">
                  {/* Pulse animation behind the spinner */}
                  <div className="absolute w-16 h-16 bg-purple-500/20 rounded-full animate-pulse"></div>
                  
                  {/* Main spinner with gradient */}
                  <svg className="w-12 h-12" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#6366F1" />
                      </linearGradient>
                    </defs>
                    <circle 
                      cx="25" 
                      cy="25" 
                      r="20" 
                      fill="none" 
                      strokeWidth="4"
                      stroke="url(#spinner-gradient)"
                      strokeLinecap="round"
                      strokeDasharray="90, 150" 
                      strokeDashoffset="0"
                      className="animate-[spin_1.2s_linear_infinite]"
                    />
                  </svg>
                </div>
                <p className="text-white text-sm font-medium tracking-wide">
                  {isReady ? 'Switching quality...' : 'Loading video...'}
                </p>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {errorMessage && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
              <div className="flex flex-col items-center space-y-4 max-w-md px-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                    {/* Using a generic error icon as the original path was for a checkmark */}
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-white text-lg font-semibold mb-2">Video Error</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{errorMessage}</p>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Center Play Button */}
          {!isPlaying && isReady && (
            <div
              className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer group"
              onClick={togglePlayPause} // Click anywhere on this overlay to play
            >
              <div className="relative">
                {/* Removed outer glow and animations, keeping only the main button */}
                <button
                  className="relative p-5 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-all duration-200 transform group-hover:scale-110"
                  aria-label="Play video"
                >
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute inset-0"> {/* This div helps manage pointer-events based on isControlsVisible for elements below */}
            {/* Top Bar - Only visible when controls are shown */}
            <div className={`absolute top-0 left-0 right-0 p-6 transition-all duration-300 ${isControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
              }`}>
              <div className="bg-gradient-to-b from-black/70 to-transparent p-4 -m-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Assuming it might be a live stream, or replace as needed */}
                    {/* <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> */}
                    <span className="text-white text-sm font-medium drop-shadow-lg"></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-medium border border-white/30 shadow-lg">
                      {currentLevel === -1 || !levels[currentLevel] ? 'AUTO' : `${levels[currentLevel]?.height}P`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar - Always visible (conditionally styled) */}
            <div className={`absolute left-0 right-0 transition-all duration-300 ${isControlsVisible ? 'bottom-24' : 'bottom-2'
              }`}>
              <div className="px-6">
                <div className="relative group">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressPercentage}
                    onChange={handleSeek}
                    onMouseDown={() => { // Keep controls visible while dragging progress bar
                      ensureControlsVisibleAndCancelAutoHide();
                    }}
                    onMouseUp={() => { // Restart timer after dragging if playing
                      if (isPlayingRef.current) startAutoHideControlsTimer();
                    }}
                    disabled={!isReady || isLoading}
                    className={`w-full rounded-full appearance-none cursor-pointer progress-bar transition-all duration-200 ${isControlsVisible ? 'h-1.5 bg-white/30' : 'h-1 bg-white/20 hover:h-1.5' // Slightly thicker when controls visible
                      }`}
                    style={{
                      background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${progressPercentage}%, rgba(255,255,255,${isControlsVisible ? '0.3' : '0.2'}) ${progressPercentage}%, rgba(255,255,255,${isControlsVisible ? '0.3' : '0.2'}) 100%)`
                    }}
                    aria-label="Video progress"
                  />
                  {/* Time tooltip (shown on group hover for progress bar) */}
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-3 py-1 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/20"
                    style={{ left: `${progressPercentage}%` }} // Basic positioning attempt
                  >
                    {formatTime(currentTime)}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Controls - Only visible when controls are shown */}
            <div className={`absolute bottom-0 left-0 right-0 p-6 transition-all duration-300 ${isControlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
              }`}>
              <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent p-6 -m-6 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  {/* Left Controls */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={togglePlayPause}
                      disabled={!isReady}
                      className="p-3 text-white hover:text-purple-400 transition-all duration-200 hover:bg-white/20 rounded-full shadow-lg backdrop-blur-sm border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    <div className="text-white text-sm font-medium tabular-nums drop-shadow-lg bg-black/40 px-3 py-1 rounded-md backdrop-blur-sm border border-white/20">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center space-x-3">
                    {/* Volume */}
                    <div
                      className="relative group"
                      onMouseEnter={() => {
                        showVolumeSliderRef.current = true;
                        setShowVolumeSlider(true); // Main useEffect will keep controls visible
                      }}
                      onMouseLeave={() => {
                        showVolumeSliderRef.current = false;
                        setShowVolumeSlider(false); // Main useEffect may start hide timer
                      }}
                    >
                      <button
                        onClick={toggleMute}
                        disabled={!isReady}
                        className="p-3 text-white hover:text-purple-400 transition-all duration-200 hover:bg-white/20 rounded-full shadow-lg backdrop-blur-sm border border-white/10 disabled:opacity-50"
                        aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
                      >
                        {isMuted || volume === 0 ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.1 15.48 20.5 13.88 20.5 12c0-4.37-2.93-8.05-7-9v2.02c3.22.85 5.5 3.86 5.5 6.98zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-9.27L10.27 6.73zM12 4.81v.75l-2.02-2.02L12 2.81z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        )}
                      </button>

                      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 transition-all duration-200 ${showVolumeSlider ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                        }`}>
                        <div className="bg-black/90 backdrop-blur-md rounded-lg p-4 border border-white/30 shadow-xl">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeSliderChange}
                            onMouseDown={() => ensureControlsVisibleAndCancelAutoHide()}
                            onMouseUp={() => { if (isPlayingRef.current) startAutoHideControlsTimer() }}
                            disabled={!isReady}
                            className="w-20 h-1 bg-white/30 rounded appearance-none cursor-pointer volume-slider"
                            style={{
                              background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%, rgba(255,255,255,0.3) 100%)`
                            }}
                            aria-label="Volume"
                          />
                        </div>
                      </div>
                    </div>

                    {levels.length > 1 && (
                      <div className="relative">
                        <select
                          value={currentLevel}
                          onChange={handleQualityChange}
                          disabled={!isReady || isLoading}
                          className="appearance-none bg-black/60 backdrop-blur-md border border-white/30 text-white py-2 px-4 pr-10 rounded-lg text-sm hover:bg-black/70 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg disabled:opacity-50"
                          aria-label="Select video quality"
                        >
                          <option value="-1" className="bg-gray-800">Auto</option>
                          {levels.map((level, index) => (
                            <option key={index} value={index} className="bg-gray-800">
                              {level.height}p • {formatBitrate(level.bitrate)}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                          <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={toggleFullscreen}
                      disabled={!isReady}
                      className="p-3 text-white hover:text-purple-400 transition-all duration-200 hover:bg-white/20 rounded-full shadow-lg backdrop-blur-sm border border-white/10 disabled:opacity-50"
                      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                      {isFullscreen ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HlsPlayer;