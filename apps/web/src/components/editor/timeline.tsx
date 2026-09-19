'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ZoomIn,
  ZoomOut,
  Plus,
  Scissors,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useEditorStore } from '@/stores/editor-store';

export function EditorTimeline() {
  const {
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    videoDuration,
    videoUrl,
    zoom,
    setZoom,
    scrollLeft,
    setScrollLeft,
    captions,
    selectedCaptionId,
    selectCaption,
    updateCaptionTiming,
    splitCaption,
    addCaptionAtPlayhead,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
  } = useEditorStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const [audioPeaks, setAudioPeaks] = useState<number[] | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Dragging state for cue blocks and handles
  const [dragState, setDragState] = useState<{
    type: 'move' | 'resize-left' | 'resize-right';
    captionId: string;
    startX: number;
    initialStart: number;
    initialEnd: number;
  } | null>(null);

  // Dragging state for playhead
  const [isScrubbing, setIsScrubbing] = useState(false);

  // Total timeline width in pixels
  const totalTimelineWidth = Math.max(800, (videoDuration || 10) * zoom);

  // Web Audio API: Extract real audio peaks from videoUrl
  useEffect(() => {
    if (!videoUrl) return;

    let isMounted = true;
    setIsLoadingAudio(true);

    const extractWaveform = async () => {
      try {
        const response = await fetch(videoUrl);
        const arrayBuffer = await response.arrayBuffer();

        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx();
        const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

        if (!isMounted) return;

        // Sample raw audio buffer into 1000 normalized peak segments
        const rawData = decodedBuffer.getChannelData(0);
        const sampleCount = 800;
        const blockSize = Math.floor(rawData.length / sampleCount);
        const peaks: number[] = [];

        for (let i = 0; i < sampleCount; i++) {
          const start = i * blockSize;
          let maxVal = 0;
          for (let j = 0; j < blockSize; j += 4) {
            const val = Math.abs(rawData[start + j] || 0);
            if (val > maxVal) maxVal = val;
          }
          peaks.push(maxVal);
        }

        // Normalize peaks 0 to 1
        const maxPeak = Math.max(...peaks, 0.01);
        const normalized = peaks.map((p) => Math.min(1, p / maxPeak));

        if (isMounted) {
          setAudioPeaks(normalized);
          setIsLoadingAudio(false);
        }
      } catch {
        // Fallback: If CORS or video format prohibits Web Audio decoding, peak array is null
        if (isMounted) {
          setAudioPeaks(null);
          setIsLoadingAudio(false);
        }
      }
    };

    extractWaveform();

    return () => {
      isMounted = false;
    };
  }, [videoUrl]);

  // Draw waveform to canvas
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = totalTimelineWidth;
    const height = canvas.height;
    canvas.width = width;

    ctx.clearRect(0, 0, width, height);

    if (audioPeaks && audioPeaks.length > 0) {
      const barWidth = 3;
      const barGap = 1.5;
      const totalBars = Math.floor(width / (barWidth + barGap));
      const step = audioPeaks.length / totalBars;

      const playheadX = currentTime * zoom;

      for (let i = 0; i < totalBars; i++) {
        const peakIdx = Math.min(Math.floor(i * step), audioPeaks.length - 1);
        const peakVal = audioPeaks[peakIdx] || 0.1;
        const barHeight = Math.max(3, peakVal * (height - 8));
        const x = i * (barWidth + barGap);
        const y = (height - barHeight) / 2;

        if (x < playheadX) {
          ctx.fillStyle = '#635BFF'; // Played color
        } else {
          ctx.fillStyle = '#3b3b42'; // Unplayed / dark slate
        }

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 1.5);
        ctx.fill();
      }
    } else {
      // Gentle subtle placeholder waveform lines
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    }
  }, [audioPeaks, totalTimelineWidth, currentTime, zoom]);

  // Time format helper (00:00.0)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // Convert client X to timeline seconds
  const clientXToTime = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return 0;
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left + containerRef.current.scrollLeft;
      const calculated = Math.max(0, clickX / zoom);
      return Math.min(videoDuration || 60, calculated);
    },
    [zoom, videoDuration]
  );

  // Playhead scrubber drag handling
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing) {
        const time = clientXToTime(e.clientX);
        setCurrentTime(time);
      }

      if (dragState) {
        const deltaPx = e.clientX - dragState.startX;
        const deltaTime = deltaPx / zoom;

        if (dragState.type === 'move') {
          const duration = dragState.initialEnd - dragState.initialStart;
          let newStart = Math.max(0, dragState.initialStart + deltaTime);
          let newEnd = newStart + duration;

          if (videoDuration && newEnd > videoDuration) {
            newEnd = videoDuration;
            newStart = Math.max(0, newEnd - duration);
          }

          updateCaptionTiming(dragState.captionId, newStart, newEnd);
        } else if (dragState.type === 'resize-left') {
          const minDuration = 0.2;
          const newStart = Math.max(
            0,
            Math.min(dragState.initialEnd - minDuration, dragState.initialStart + deltaTime)
          );
          updateCaptionTiming(dragState.captionId, newStart, dragState.initialEnd);
        } else if (dragState.type === 'resize-right') {
          const minDuration = 0.2;
          const maxEnd = videoDuration || 600;
          const newEnd = Math.min(
            maxEnd,
            Math.max(dragState.initialStart + minDuration, dragState.initialEnd + deltaTime)
          );
          updateCaptionTiming(dragState.captionId, dragState.initialStart, newEnd);
        }
      }
    };

    const handleMouseUp = () => {
      if (isScrubbing) setIsScrubbing(false);
      if (dragState) setDragState(null);
    };

    if (isScrubbing || dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, dragState, clientXToTime, setCurrentTime, zoom, videoDuration, updateCaptionTiming]);

  // Sync scrollLeft
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollLeft(containerRef.current.scrollLeft);
    }
  };

  // Keyboard shortcut listener for spacebar play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setCurrentTime(Math.max(0, currentTime - 0.1));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setCurrentTime(Math.min(videoDuration || 60, currentTime + 0.1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, setIsPlaying, currentTime, setCurrentTime, videoDuration]);

  // Generate ruler tick marks
  const renderRulerTicks = () => {
    const ticks = [];
    const stepSeconds = zoom < 40 ? 2 : zoom > 100 ? 0.5 : 1;
    const totalSeconds = Math.ceil(videoDuration || 30);

    for (let sec = 0; sec <= totalSeconds; sec += stepSeconds) {
      const leftPx = sec * zoom;
      const isMajor = sec % 5 === 0;

      ticks.push(
        <div
          key={sec}
          className="absolute top-0 flex flex-col items-center pointer-events-none"
          style={{ left: `${leftPx}px` }}
        >
          <div
            className={`w-[1px] ${
              isMajor ? 'h-3 bg-slate-400 dark:bg-zinc-500' : 'h-1.5 bg-slate-300 dark:bg-zinc-700'
            }`}
          />
          <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500 mt-0.5 select-none">
            {formatTime(sec)}
          </span>
        </div>
      );
    }
    return ticks;
  };

  return (
    <div className="h-64 border-t border-slate-200 dark:border-zinc-800 bg-slate-900 dark:bg-zinc-950 flex flex-col shrink-0 select-none text-white">
      {/* Top Controls Toolbar */}
      <div className="h-10 border-b border-slate-800 dark:border-zinc-800/80 px-4 flex items-center justify-between bg-slate-950/60 text-xs">
        {/* Playback controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTime(0)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Jump to Start"
          >
            <SkipBack className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-full bg-[#635BFF] hover:bg-[#5349e0] text-white shadow-sm transition-all"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
          </button>

          <button
            onClick={() => setCurrentTime(videoDuration || 0)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Jump to End"
          >
            <SkipForward className="h-3.5 w-3.5" />
          </button>

          {/* Timecode readouts */}
          <div className="font-mono text-xs font-semibold ml-3 text-slate-300 flex items-center gap-1">
            <span className="text-white">{formatTime(currentTime)}</span>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{formatTime(videoDuration || 0)}</span>
          </div>
        </div>

        {/* Caption Quick Edits */}
        <div className="flex items-center gap-2">
          <button
            onClick={addCaptionAtPlayhead}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium transition-colors"
            title="Add Caption at Playhead"
          >
            <Plus className="h-3 w-3" />
            <span>Add Block</span>
          </button>

          {selectedCaptionId && (
            <button
              onClick={() => splitCaption(selectedCaptionId, currentTime)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-medium transition-colors"
              title="Split selected caption at playhead"
            >
              <Scissors className="h-3 w-3" />
              <span>Split at Playhead</span>
            </button>
          )}
        </div>

        {/* Zoom & Audio Controls */}
        <div className="flex items-center gap-3">
          {/* Mute toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-400 hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5 text-red-400" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>

          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
            <button
              onClick={() => setZoom(Math.max(20, zoom - 15))}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="font-mono text-[10px] text-slate-400 w-9 text-center">
              {zoom}px/s
            </span>
            <button
              onClick={() => setZoom(Math.min(250, zoom + 15))}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Timeline Track Scroll Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-x-auto overflow-y-hidden relative select-none scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
        onClick={(e) => {
          // If not clicking a caption block or resize handle, seek to time
          const target = e.target as HTMLElement;
          if (!target.closest('.caption-block')) {
            setCurrentTime(clientXToTime(e.clientX));
          }
        }}
      >
        <div
          className="h-full relative min-w-full"
          style={{ width: `${totalTimelineWidth + 100}px` }}
        >
          {/* Time Ruler (32px) */}
          <div
            className="h-8 border-b border-slate-800 bg-slate-950/40 relative cursor-pointer"
            onMouseDown={(e) => {
              setIsScrubbing(true);
              setCurrentTime(clientXToTime(e.clientX));
            }}
          >
            {renderRulerTicks()}
          </div>

          {/* Audio Waveform Canvas Track (48px) */}
          <div className="h-12 border-b border-slate-800/80 relative flex items-center bg-black/20">
            <canvas
              ref={waveformCanvasRef}
              height={48}
              className="w-full h-full pointer-events-none"
            />
            {isLoadingAudio && (
              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-500 bg-black/30 backdrop-blur-sm">
                Extracting audio waveform...
              </div>
            )}
          </div>

          {/* Captions Block Track (80px) */}
          <div className="h-20 relative p-1.5 bg-slate-950/30">
            {captions.map((cap) => {
              const left = cap.startTime * zoom;
              const width = Math.max(16, (cap.endTime - cap.startTime) * zoom);
              const isSelected = cap.id === selectedCaptionId;

              return (
                <div
                  key={cap.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectCaption(cap.id);
                  }}
                  onMouseDown={(e) => {
                    const target = e.target as HTMLElement;
                    if (!target.classList.contains('resize-handle')) {
                      setDragState({
                        type: 'move',
                        captionId: cap.id,
                        startX: e.clientX,
                        initialStart: cap.startTime,
                        initialEnd: cap.endTime,
                      });
                    }
                  }}
                  className={`caption-block absolute top-2 h-14 rounded-lg px-2 flex flex-col justify-between cursor-move transition-shadow ${
                    isSelected
                      ? 'bg-[#635BFF] text-white ring-2 ring-white/60 shadow-lg shadow-[#635BFF]/30 z-10'
                      : 'bg-[#2B2B36] hover:bg-[#343442] text-slate-200 border border-slate-700/60 z-0'
                  }`}
                  style={{
                    left: `${left}px`,
                    width: `${width}px`,
                  }}
                >
                  {/* Left Resize Handle */}
                  <div
                    className="resize-handle absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/40 rounded-l-lg"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDragState({
                        type: 'resize-left',
                        captionId: cap.id,
                        startX: e.clientX,
                        initialStart: cap.startTime,
                        initialEnd: cap.endTime,
                      });
                    }}
                  />

                  {/* Caption Text Snippet */}
                  <div className="text-[11px] font-medium truncate pt-1 pointer-events-none select-none">
                    {cap.text || '(empty)'}
                  </div>

                  {/* Timing duration tag */}
                  <div className="text-[9px] font-mono opacity-70 pb-1 pointer-events-none flex justify-between">
                    <span>{cap.startTime.toFixed(1)}s</span>
                    <span>{(cap.endTime - cap.startTime).toFixed(1)}s</span>
                  </div>

                  {/* Right Resize Handle */}
                  <div
                    className="resize-handle absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/40 rounded-r-lg"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDragState({
                        type: 'resize-right',
                        captionId: cap.id,
                        startX: e.clientX,
                        initialStart: cap.startTime,
                        initialEnd: cap.endTime,
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Synchronized Playhead Cursor Line */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-30 pointer-events-none shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            style={{ left: `${currentTime * zoom}px` }}
          >
            {/* Playhead pointer tip */}
            <div
              className="absolute -top-0 -left-[5px] w-3 h-3 bg-red-500 rotate-45 pointer-events-auto cursor-ew-resize"
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsScrubbing(true);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

