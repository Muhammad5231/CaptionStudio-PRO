'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';
import { evaluateCaptionFrame, ComputedCaptionTransform } from '@captionstudio/captions';
import { SAFE_AREA_PRESETS } from '@captionstudio/captions';

export function VideoPreview() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const {
    videoUrl,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    playbackRate,
    setPlaybackRate,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    aspectRatio,
    showSafeAreas,
    setShowSafeAreas,
    captions,
    style,
  } = useEditorStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [frameTransform, setFrameTransform] = useState<ComputedCaptionTransform>({
    isVisible: false,
    opacity: 0,
    scale: 1,
    translateY: 0,
    words: [],
  });

  // Synchronize React state with HTML5 video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && video.paused) {
      video.play().catch(() => setIsPlaying(false));
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [isPlaying, setIsPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Math.abs(video.currentTime - currentTime) > 0.2) {
      video.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // 60 FPS requestAnimationFrame loop: computes active caption transforms without re-rendering parent tree
  useEffect(() => {
    let animId: number;

    const renderLoop = () => {
      const video = videoRef.current;
      const t = video ? video.currentTime : currentTime;

      // Find active caption
      const activeCaption = captions.find((c) => t >= c.startTime && t <= c.endTime);

      if (activeCaption) {
        const evaluated = evaluateCaptionFrame(
          {
            start: activeCaption.startTime,
            end: activeCaption.endTime,
            words: activeCaption.words.map((w) => ({
              id: w.id,
              start: w.startTime,
              end: w.endTime,
              text: w.text,
            })),
          },
          t,
          style
        );
        setFrameTransform(evaluated);
      } else {
        setFrameTransform((prev) => (prev.isVisible ? { ...prev, isVisible: false } : prev));
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [captions, style, currentTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleTogglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  const handleStepFrame = (frames: number) => {
    if (!videoRef.current) return;
    const fps = 30;
    const newTime = Math.max(0, videoRef.current.currentTime + frames * (1 / fps));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const safeAreaPreset = SAFE_AREA_PRESETS[aspectRatio] || SAFE_AREA_PRESETS['9:16'];

  // Aspect ratio container classes
  const aspectClass =
    aspectRatio === '9:16'
      ? 'aspect-[9/16] max-h-[580px]'
      : aspectRatio === '16:9'
      ? 'aspect-[16/9] max-w-[800px]'
      : aspectRatio === '1:1'
      ? 'aspect-square max-h-[540px]'
      : 'aspect-[4/5] max-h-[580px]';

  return (
    <main
      ref={containerRef}
      className="flex-1 bg-slate-900/90 dark:bg-black/95 flex flex-col items-center justify-between p-4 overflow-hidden select-none relative"
    >
      {/* Video Container */}
      <div className="flex-1 w-full flex items-center justify-center min-h-0 relative">
        <div className={`relative bg-black rounded-xl overflow-hidden shadow-2xl ${aspectClass} w-full flex items-center justify-center`}>
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              onClick={handleTogglePlay}
              className="w-full h-full object-contain cursor-pointer"
              playsInline
            />
          ) : (
            <div className="text-center p-6 text-slate-500 space-y-2">
              <p className="text-sm font-semibold">No media loaded</p>
              <p className="text-xs text-slate-600">Upload a video to preview caption overlays.</p>
            </div>
          )}

          {/* Safe Area Guides Overlay */}
          {showSafeAreas && (
            <div
              className="absolute inset-0 pointer-events-none border border-dashed border-red-500/30"
              style={{
                top: `${safeAreaPreset.topPercent}%`,
                bottom: `${safeAreaPreset.bottomPercent}%`,
                left: `${safeAreaPreset.leftPercent}%`,
                right: `${safeAreaPreset.rightPercent}%`,
              }}
            >
              <span className="absolute top-1 left-1.5 text-[9px] font-mono font-bold tracking-wider text-red-400/60 uppercase">
                Safe Area ({aspectRatio})
              </span>
            </div>
          )}

          {/* 60 FPS Synchronized Caption Overlay */}
          {frameTransform.isVisible && (
            <div
              className="absolute w-full px-6 pointer-events-none flex flex-col items-center transition-all duration-75"
              style={{
                top: style.position.anchor === 'top' ? `${style.position.y}%` : undefined,
                bottom: style.position.anchor === 'bottom' ? `${100 - style.position.y}%` : undefined,
                transform: `scale(${frameTransform.scale}) translateY(${frameTransform.translateY}px)`,
                opacity: frameTransform.opacity,
              }}
            >
              <div
                className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center font-bold"
                style={{
                  fontFamily: style.typography.fontFamily,
                  fontSize: `${style.typography.fontSize}px`,
                  fontWeight: style.typography.fontWeight,
                  textTransform: style.typography.textTransform,
                  color: style.fill.color,
                  WebkitTextStroke: style.stroke.enabled ? `${style.stroke.width}px ${style.stroke.color}` : undefined,
                  textShadow: style.shadow.enabled
                    ? `${style.shadow.offsetX}px ${style.shadow.offsetY}px ${style.shadow.blur}px ${style.shadow.color}`
                    : undefined,
                  backgroundColor: style.background.enabled ? style.background.color : undefined,
                  borderRadius: style.background.enabled ? `${style.background.radius}px` : undefined,
                  padding: style.background.enabled ? `${style.background.padding}px` : undefined,
                  maxWidth: `${style.layout.maxWidth}%`,
                }}
              >
                {frameTransform.words.map((w, wIdx) => (
                  <span
                    key={w.wordId || wIdx}
                    className="inline-block transition-transform duration-100"
                    style={{
                      color: w.color,
                      backgroundColor: w.backgroundColor,
                      transform: `scale(${w.scale}) translateY(${w.translateY}px)`,
                    }}
                  >
                    {captions.find((c) => c.words.some((cw) => cw.id === w.wordId))?.words.find((cw) => cw.id === w.wordId)?.text || ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Playback Control Bar */}
      <div className="w-full max-w-xl mt-3 flex items-center justify-between px-4 py-2 bg-slate-800/80 dark:bg-zinc-900/80 backdrop-blur rounded-xl border border-slate-700/50 text-white text-xs shrink-0">
        {/* Play / Step controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStepFrame(-1)}
            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white"
            title="Previous Frame (Left Arrow)"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            className="p-2 bg-[#635BFF] hover:bg-[#5248E5] rounded-full text-white transition-all shadow-md active:scale-95"
            title="Play / Pause (Space)"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>

          <button
            onClick={() => handleStepFrame(1)}
            className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white"
            title="Next Frame (Right Arrow)"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Time Display */}
          <span className="text-[11px] font-mono text-slate-300 ml-2">
            {currentTime.toFixed(2)}s
          </span>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          {/* Safe Area Guide Toggle */}
          <button
            onClick={() => setShowSafeAreas(!showSafeAreas)}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-[11px] font-medium ${
              showSafeAreas ? 'text-red-400 bg-red-500/10' : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle Safe Area Guides"
          >
            {showSafeAreas ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Guides</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-700/50 p-0.5 rounded">
            {[0.5, 1, 1.5, 2].map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                className={`px-1.5 py-0.5 rounded ${
                  playbackRate === rate ? 'bg-[#635BFF] text-white' : 'hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Volume */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </main>
  );
}

export { VideoPreview as EditorVideoPreview };
