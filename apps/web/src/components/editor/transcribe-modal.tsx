'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Languages,
  X,
} from 'lucide-react';
import { Button, Modal } from '@captionstudio/ui';
import { api } from '@/lib/api-client';
import { useEditorStore, EditorCaption } from '@/stores/editor-store';

interface TranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

const LANGUAGES = [
  { code: 'auto', label: 'Auto-detect language' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish (Español)' },
  { code: 'fr', label: 'French (Français)' },
  { code: 'de', label: 'German (Deutsch)' },
  { code: 'it', label: 'Italian (Italiano)' },
  { code: 'pt', label: 'Portuguese (Português)' },
  { code: 'nl', label: 'Dutch (Nederlands)' },
  { code: 'ja', label: 'Japanese (日本語)' },
  { code: 'zh', label: 'Chinese (中文)' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'ar', label: 'Arabic (العربية)' },
  { code: 'ru', label: 'Russian (Русский)' },
  { code: 'ko', label: 'Korean (한국어)' },
  { code: 'pl', label: 'Polish (Polski)' },
  { code: 'tr', label: 'Turkish (Türkçe)' },
];

const MODELS = [
  { id: 'tiny', name: 'Tiny', desc: 'Ultra fast, best for quick drafts (39M parameters)' },
  { id: 'base', name: 'Base', desc: 'Balanced speed and standard accuracy (74M parameters)' },
  { id: 'small', name: 'Small', desc: 'High accuracy for podcasts & talking-head video (244M parameters)' },
  { id: 'medium', name: 'Medium', desc: 'Maximum precision & multilingual nuances (769M parameters)' },
];

export function TranscribeModal({ isOpen, onClose, projectId }: TranscribeModalProps) {
  const { initProject, projectName, videoUrl, videoDuration, style } = useEditorStore();

  const [language, setLanguage] = useState('auto');
  const [model, setModel] = useState('base');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  // SSE tracking state
  const [stage, setStage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // SSE EventSource connection
  useEffect(() => {
    if (!jobId || status === 'COMPLETED' || status === 'FAILED') return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const eventSource = new EventSource(`${apiUrl}/jobs/${jobId}/events`, {
      withCredentials: true,
    });

    eventSource.onmessage = async (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.progress !== undefined) setProgress(payload.progress);
        if (payload.stage) setStage(payload.stage);
        if (payload.status) setStatus(payload.status);

        if (payload.status === 'COMPLETED') {
          eventSource.close();
          // Fetch updated project versions to populate captions into editor store
          const res = await api.get<{
            success: boolean;
            data: {
              versions: Array<{
                versionNumber: number;
                captionPayload: { lines?: EditorCaption[] } | unknown;
              }>;
            };
          }>(`/projects/${projectId}`);

          const latestVersion = res.data.versions?.[0];
          const payloadData = latestVersion?.captionPayload as { lines?: EditorCaption[] } | undefined;
          if (payloadData?.lines && payloadData.lines.length > 0) {
            initProject({
              projectId,
              projectName,
              videoUrl,
              videoDuration,
              versionNumber: latestVersion.versionNumber,
              captions: payloadData.lines,
              style,
            });
          }
        } else if (payload.status === 'FAILED') {
          eventSource.close();
          setErrorMessage(payload.errorMessage || 'Transcription process failed');
        }
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      // Fallback polling if SSE fails
      const timer = setTimeout(async () => {
        try {
          const check = await api.get<{
            success: boolean;
            data: { status: string; progress: number; stage: string; errorMessage: string };
          }>(`/jobs/${jobId}`);
          if (check.data) {
            setProgress(check.data.progress);
            setStage(check.data.stage);
            setStatus(check.data.status as any);
            if (check.data.status === 'FAILED') {
              setErrorMessage(check.data.errorMessage || 'Transcription failed');
            }
          }
        } catch {
          // ignore
        }
      }, 2000);

      return () => clearTimeout(timer);
    };

    return () => {
      eventSource.close();
    };
  }, [jobId, status, projectId, projectName, videoUrl, videoDuration, style, initProject]);

  const handleStart = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setStatus('PROCESSING');
    setProgress(5);
    setStage('Submitting transcription request...');

    try {
      const res = await api.post<{
        success: boolean;
        data: { jobId: string; message: string };
      }>(`/projects/${projectId}/transcribe`, {
        language: language === 'auto' ? undefined : language,
        model,
        temperature: 0.0,
      });

      setJobId(res.data.jobId);
    } catch (err: unknown) {
      setStatus('FAILED');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to start transcription job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setJobId(null);
    setStatus('IDLE');
    setProgress(0);
    setStage(null);
    setErrorMessage(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (status !== 'PROCESSING') onClose();
      }}
      title="AI Transcription (Whisper Engine)"
    >
      <div className="space-y-6">
        {status === 'IDLE' ? (
          <>
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#635BFF]/10 border border-[#635BFF]/20 text-xs">
              <Sparkles className="h-5 w-5 text-[#635BFF] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-zinc-100">
                  Real Word-Level Speech Recognition
                </p>
                <p className="text-slate-600 dark:text-zinc-400 mt-0.5">
                  Whisper neural net generates millisecond-accurate word timestamps, allowing kinetic pop animations and word highlights.
                </p>
              </div>
            </div>

            {/* Language Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Languages className="h-4 w-4 text-slate-500" />
                Audio Spoken Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Architecture Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-slate-500" />
                Whisper AI Model
              </label>
              <div className="grid grid-cols-1 gap-2">
                {MODELS.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={`cursor-pointer p-3 rounded-xl border text-xs transition-all ${
                      model === m.id
                        ? 'border-[#635BFF] bg-[#635BFF]/5 ring-1 ring-[#635BFF]'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-zinc-100">
                      <span>{m.name}</span>
                      {m.id === 'small' && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-zinc-800">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                isLoading={isSubmitting}
                onClick={handleStart}
                leftIcon={<Sparkles className="h-4 w-4" />}
              >
                Transcribe Video
              </Button>
            </div>
          </>
        ) : status === 'PROCESSING' || status === 'PENDING' ? (
          /* Live SSE Progress State */
          <div className="py-8 text-center space-y-6">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full border-4 border-[#635BFF]/20 border-t-[#635BFF] animate-spin mx-auto" />
              <Sparkles className="h-6 w-6 text-[#635BFF] absolute inset-0 m-auto" />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {stage || 'Transcribing audio with Whisper AI...'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Generating synchronized word-level timestamps and speech boundaries.
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5 max-w-sm mx-auto">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-zinc-400">Progress</span>
                <span className="text-[#635BFF]">{progress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#635BFF] rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : status === 'COMPLETED' ? (
          /* Completed state */
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Transcription Complete!
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Your speech was successfully transcribed and synchronized into the timeline editor.
              </p>
            </div>
            <Button
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="mt-4"
            >
              Back to Studio Editor
            </Button>
          </div>
        ) : (
          /* Error state */
          <div className="py-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Transcription Failed
              </h3>
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                {errorMessage || 'An error occurred during audio extraction or speech recognition.'}
              </p>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleReset}>Try Again</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

