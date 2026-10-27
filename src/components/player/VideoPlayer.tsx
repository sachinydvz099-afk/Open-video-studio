import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatDuration } from '../../utils/formatters';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  prompt?: string;
  isSimulated?: boolean;
  aspectRatio?: string;
  onReuseSettings?: () => void;
  className?: string;
  autoPlay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  prompt,
  isSimulated = true,
  aspectRatio = '16:9',
  onReuseSettings,
  className = '',
  autoPlay = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  const controlsTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(video.duration || 5);
      if (autoPlay) {
        video.play().catch(() => {});
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (!isLooping) setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [autoPlay, isLooping]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
      setIsMuted(vol === 0);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleDownload = () => {
    if (!src) return;
    const a = document.createElement('a');
    a.href = src;
    a.download = `open-video-studio-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={`relative group bg-black rounded-2xl overflow-hidden border border-studio-border shadow-2xl flex flex-col justify-center items-center ${className}`}
    >
      {/* Aspect Ratio Box Wrapper */}
      <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          loop={isLooping}
          muted={isMuted}
          playsInline
          className="max-h-[580px] w-full object-contain cursor-pointer"
          onClick={togglePlay}
        />

        {/* Big Center Play Icon (Shown when paused) */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            aria-label="Play video"
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-amber-500/90 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-amber-500/40 hover:scale-110 transition-all cursor-pointer z-20"
          >
            <Play className="w-8 h-8 fill-current ml-1" />
          </button>
        )}

        {/* Top Floating Badge Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-2 pointer-events-auto">
            {isSimulated ? (
              <Badge variant="amber" size="md">
                Demo Simulation
              </Badge>
            ) : (
              <Badge variant="emerald" size="md">
                AI Inference Result
              </Badge>
            )}
            <Badge variant="outline" size="sm">
              {aspectRatio}
            </Badge>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {prompt && (
              <button
                onClick={copyPrompt}
                title="Copy Generation Prompt"
                className="p-2 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-slate-200 border border-white/10 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Prompt'}</span>
              </button>
            )}
            {onReuseSettings && (
              <button
                onClick={onReuseSettings}
                title="Reuse Prompt & Settings in Studio"
                className="p-2 rounded-lg bg-black/60 hover:bg-black/80 backdrop-blur-md text-amber-400 border border-amber-500/30 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reuse Settings</span>
              </button>
            )}
            <button
              onClick={handleDownload}
              title="Download Video File"
              className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>

        {/* Video Scrubber & Bottom Controls Bar */}
        <div
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 pt-8 transition-opacity duration-200 z-20 ${
            showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Timeline Range Bar */}
          <div className="relative flex items-center group/scrubber mb-3">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.05}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 hover:bg-white/30 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
              aria-label="Video scrubber"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            {/* Left Controls: Play, Time */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = 0;
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <span className="font-mono text-slate-400">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </span>

              {/* Volume */}
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  aria-label="Volume slider"
                />
              </div>
            </div>

            {/* Right Controls: Loop, Speed, Fullscreen */}
            <div className="flex items-center gap-2">
              {/* Loop Toggle */}
              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                  isLooping ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white'
                }`}
                title="Loop playback"
              >
                LOOP
              </button>

              {/* Speed Selector */}
              <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/10">
                {[0.5, 1, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                      playbackRate === s
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                title="Toggle fullscreen"
                aria-label="Toggle fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {title && (
        <div className="w-full p-4 bg-studio-card border-t border-studio-border">
          <h4 className="text-sm font-semibold text-slate-100 truncate">{title}</h4>
          {prompt && <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{prompt}</p>}
        </div>
      )}
    </div>
  );
};
