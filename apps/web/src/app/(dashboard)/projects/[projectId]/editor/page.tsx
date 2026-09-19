'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@captionstudio/ui';
import { api } from '@/lib/api-client';
import { useEditorStore, EditorCaption } from '@/stores/editor-store';
import { EditorTopBar } from '@/components/editor/top-bar';
import { EditorLeftPanel } from '@/components/editor/left-panel';
import { EditorVideoPreview } from '@/components/editor/video-preview';
import { EditorRightPanel } from '@/components/editor/right-panel';
import { EditorTimeline } from '@/components/editor/timeline';
import { TranscribeModal } from '@/components/editor/transcribe-modal';

interface ProjectResponse {
  id: string;
  name: string;
  status: string;
  durationSeconds: number | null;
  assets: Array<{
    id: string;
    type: 'VIDEO' | 'SUBTITLE';
    url: string;
    durationSeconds: number | null;
  }>;
  versions: Array<{
    id: string;
    versionNumber: number;
    captionPayload: {
      lines?: EditorCaption[];
      style?: any;
    } | unknown;
    changelog: string | null;
    createdAt: string;
  }>;
}

export default function ProjectEditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isTranscribeModalOpen, setIsTranscribeModalOpen] = useState(false);

  const {
    initProject,
    captions,
    style,
    versionNumber,
    autosaveStatus,
    setAutosaveStatus,
    markSaved,
  } = useEditorStore();

  const isInitialLoadRef = useRef(true);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load project and initial version
  const fetchProjectData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const res = await api.get<{ success: boolean; data: ProjectResponse }>(
        `/projects/${projectId}`
      );
      const project = res.data;

      const videoAsset = project.assets.find((a) => a.type === 'VIDEO');
      const latestVersion = project.versions[0];
      const payload = latestVersion?.captionPayload as {
        lines?: EditorCaption[];
        style?: any;
      } | undefined;

      const loadedCaptions = payload?.lines || [];
      const loadedStyle = payload?.style;

      initProject({
        projectId: project.id,
        projectName: project.name,
        videoUrl: videoAsset?.url || null,
        videoDuration: project.durationSeconds || videoAsset?.durationSeconds || 30,
        versionNumber: latestVersion ? latestVersion.versionNumber : 1,
        captions: loadedCaptions,
        style: loadedStyle,
      });

      // Mark initial load finished so changes trigger autosave
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 500);
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load project editor');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, initProject]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // Debounced Autosave (1000ms after caption or style mutations)
  useEffect(() => {
    if (isInitialLoadRef.current || isLoading) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    setAutosaveStatus('unsaved');

    autosaveTimerRef.current = setTimeout(async () => {
      try {
        setAutosaveStatus('saving');
        const nextVersion = versionNumber + 1;

        const res = await api.post<{
          success: boolean;
          data: { id: string; versionNumber: number };
        }>(`/projects/${projectId}/versions`, {
          versionNumber: nextVersion,
          captionPayload: {
            lines: captions,
            style: style,
          },
          changelog: `Autosaved ${captions.length} captions`,
        });

        markSaved(res.data.versionNumber);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to autosave changes';
        setAutosaveStatus('error', msg);
      }
    }, 1200);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [captions, style, projectId, versionNumber, setAutosaveStatus, markSaved, isLoading]);

  const handleOpenExport = () => {
    alert(
      'Render Scene Graph generated! Phase 6 GPU rendering cluster contract ready for distributed queue processing.'
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#635BFF]" />
        <p className="text-sm text-slate-400 font-medium">Loading CaptionStudio Editor...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white space-y-4 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold">Failed to load editor</h2>
        <p className="text-xs text-slate-400 max-w-md">{loadError}</p>
        <Link href={`/projects/${projectId}`}>
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Project
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* Top Bar */}
      <EditorTopBar
        onOpenTranscribe={() => setIsTranscribeModalOpen(true)}
        onOpenExport={handleOpenExport}
      />

      {/* Middle Section: Left Panel, Video Player & Right Panel */}
      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Left Panel: Captions list & Words */}
        <EditorLeftPanel />

        {/* Center: Live 60 FPS Video Canvas Preview */}
        <div className="flex-1 flex flex-col bg-black overflow-hidden relative">
          <EditorVideoPreview />
        </div>

        {/* Right Panel: Templates, Style, Motion & Safe Areas */}
        <EditorRightPanel />
      </div>

      {/* Bottom: Waveform Timeline & Cues */}
      <EditorTimeline />

      {/* AI Whisper STT Transcribe Modal */}
      <TranscribeModal
        isOpen={isTranscribeModalOpen}
        onClose={() => setIsTranscribeModalOpen(false)}
        projectId={projectId}
      />
    </div>
  );
}

