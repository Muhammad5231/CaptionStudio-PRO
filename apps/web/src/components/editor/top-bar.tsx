'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Sparkles,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Smartphone,
  Tv,
  Square,
  RectangleVertical,
} from 'lucide-react';
import { Button } from '@captionstudio/ui';
import { useEditorStore, AspectRatio } from '@/stores/editor-store';

interface TopBarProps {
  onOpenTranscribe: () => void;
  onOpenExport: () => void;
}

export function EditorTopBar({ onOpenTranscribe, onOpenExport }: TopBarProps) {
  const {
    projectName,
    aspectRatio,
    setAspectRatio,
    undo,
    redo,
    canUndo,
    canRedo,
    autosaveStatus,
    errorMessage,
    versionNumber,
  } = useEditorStore();

  const aspectRatios: Array<{ id: AspectRatio; label: string; icon: React.ReactNode }> = [
    { id: '9:16', label: '9:16', icon: <Smartphone className="h-3.5 w-3.5" /> },
    { id: '16:9', label: '16:9', icon: <Tv className="h-3.5 w-3.5" /> },
    { id: '1:1', label: '1:1', icon: <Square className="h-3.5 w-3.5" /> },
    { id: '4:5', label: '4:5', icon: <RectangleVertical className="h-3.5 w-3.5" /> },
  ];

  return (
    <header className="h-14 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 flex items-center justify-between shrink-0 select-none">
      {/* Left section: Nav & Project info */}
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
          title="Back to Projects"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-zinc-50 truncate max-w-[200px]">
            {projectName || 'Untitled Project'}
          </span>
          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
            v{versionNumber}
          </span>
        </div>

        {/* Autosave badge */}
        <div className="flex items-center gap-1.5 text-[11px] font-medium ml-2">
          {autosaveStatus === 'saving' && (
            <span className="text-amber-500 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </span>
          )}
          {autosaveStatus === 'saved' && (
            <span className="text-emerald-500 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Saved
            </span>
          )}
          {autosaveStatus === 'unsaved' && (
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Unsaved changes
            </span>
          )}
          {autosaveStatus === 'error' && (
            <span className="text-red-500 flex items-center gap-1" title={errorMessage || 'Save error'}>
              <AlertCircle className="h-3 w-3" /> Save failed
            </span>
          )}
        </div>
      </div>

      {/* Center: Undo/Redo & Aspect Ratio */}
      <div className="flex items-center gap-4">
        {/* Undo / Redo */}
        <div className="flex items-center border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-slate-50/50 dark:bg-zinc-900/50">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 hover:bg-slate-200/50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600 dark:text-zinc-400"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <div className="h-3 w-px bg-slate-200 dark:bg-zinc-800" />
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 hover:bg-slate-200/50 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600 dark:text-zinc-400"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-800">
          {aspectRatios.map((ar) => (
            <button
              key={ar.id}
              onClick={() => setAspectRatio(ar.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all ${
                aspectRatio === ar.id
                  ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-50 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              {ar.icon}
              <span className="hidden sm:inline">{ar.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: AI Transcribe & Export */}
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={onOpenTranscribe} className="text-xs h-8 border-[#635BFF]/30 hover:border-[#635BFF]">
          <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[#635BFF]" />
          <span>AI Transcribe</span>
        </Button>

        <Button size="sm" onClick={onOpenExport} className="text-xs h-8 bg-[#635BFF] hover:bg-[#5248E5]">
          <Download className="h-3.5 w-3.5 mr-1.5" />
          <span>Export Video</span>
        </Button>
      </div>
    </header>
  );
}

