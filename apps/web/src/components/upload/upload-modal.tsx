'use client';

import React, { useState, useRef } from 'react';
import { Modal, Button } from '@captionstudio/ui';
import { UploadCloud, FileVideo, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName?: string;
  onSuccess?: () => void;
}

export function UploadModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  onSuccess,
}: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStage, setUploadStage] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [stageMessage, setStageMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const ext = file.name.toLowerCase().split('.').pop();
    const validExts = ['mp4', 'mov', 'webm', 'mkv', 'srt', 'vtt', 'ass', 'ssa'];

    if (!validExts.includes(ext || '')) {
      setErrorMessage('Unsupported file format. Please upload MP4, MOV, WEBM, MKV, SRT, VTT, or ASS.');
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setErrorMessage('File exceeds the maximum limit of 500MB.');
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
  };

  const startUpload = async () => {
    if (!selectedFile) return;

    setUploadStage('uploading');
    setProgress(0);
    setStageMessage('Requesting secure upload authorization...');
    setErrorMessage(null);

    try {
      // 1. Request upload authorization
      const authRes = await api.post<{
        success: boolean;
        data: {
          uploadUrl: string;
          storageKey: string;
          assetType: 'VIDEO' | 'SUBTITLE';
        };
      }>('/uploads/authorize', {
        projectId,
        fileName: selectedFile.name,
        fileSizeBytes: selectedFile.size,
        mimeType: selectedFile.type || 'application/octet-stream',
      });

      const { uploadUrl, storageKey, assetType } = authRes.data;

      // 2. Direct streaming upload with byte progress
      setStageMessage('Uploading to studio storage...');
      await api.uploadFile(uploadUrl, selectedFile, (pct) => {
        setProgress(pct);
        setStageMessage(`Uploading ${selectedFile.name} (${pct}%)...`);
      });

      // 3. Complete upload notification
      setUploadStage('processing');
      setStageMessage('Verifying storage object & initializing processing...');

      const completeRes = await api.post<{
        success: boolean;
        data: {
          asset: { id: string; url: string };
          job?: { id: string; status: string; stage: string };
          version?: { id: string; captionsCount: number };
        };
        message: string;
      }>('/uploads/complete', {
        projectId,
        storageKey,
        fileName: selectedFile.name,
        fileSizeBytes: selectedFile.size,
        mimeType: selectedFile.type || 'application/octet-stream',
        assetType,
      });

      // 4. If VIDEO and job created, subscribe to real-time SSE updates
      if (assetType === 'VIDEO' && completeRes.data.job?.id) {
        const jobId = completeRes.data.job.id;
        setStageMessage('Analyzing media streams with FFprobe...');

        const eventSource = new EventSource(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/jobs/${jobId}/events`,
          { withCredentials: true }
        );

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.stage) setStageMessage(data.stage);
            if (data.progress !== undefined) setProgress(data.progress);

            if (data.status === 'COMPLETED') {
              eventSource.close();
              setUploadStage('success');
              setStageMessage('Media analysis complete! Project is ready.');
              if (onSuccess) onSuccess();
            } else if (data.status === 'FAILED') {
              eventSource.close();
              setUploadStage('error');
              setErrorMessage(data.errorMessage || 'Media processing encountered an error.');
            }
          } catch {
            // Ignore parse errors
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          // Fallback to success if SSE closes normally
          setUploadStage('success');
          setStageMessage('Upload and analysis concluded.');
          if (onSuccess) onSuccess();
        };
      } else {
        // Subtitle upload concluded immediately
        setUploadStage('success');
        setStageMessage(completeRes.message || 'Subtitles imported successfully.');
        if (onSuccess) onSuccess();
      }
    } catch (err: unknown) {
      setUploadStage('error');
      const message = err instanceof Error ? err.message : 'An error occurred during upload. Please try again.';
      setErrorMessage(message);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadStage('idle');
    setProgress(0);
    setStageMessage('');
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (uploadStage !== 'uploading' && uploadStage !== 'processing') {
          handleReset();
          onClose();
        }
      }}
      title="Upload Media or Subtitles"
      description={projectName ? `Project: ${projectName}` : 'Upload video files or existing subtitle files to your project.'}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {uploadStage === 'idle' && !selectedFile && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-xl hover:border-[#635BFF] dark:hover:border-[#635BFF] transition-all cursor-pointer bg-slate-50 dark:bg-zinc-900/50"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,.mov,.webm,.mkv,.srt,.vtt,.ass,.ssa"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#635BFF]/10 text-[#635BFF] mb-3">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
              Click to browse or drag and drop files here
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 text-center">
              Video: MP4, MOV, WEBM, MKV (up to 500MB)
              <br />
              Subtitles: SRT, WebVTT, ASS, SSA
            </p>
          </div>
        )}

        {uploadStage === 'idle' && selectedFile && (
          <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#635BFF]/10 text-[#635BFF]">
                {selectedFile.name.endsWith('.srt') || selectedFile.name.endsWith('.vtt') ? (
                  <FileText className="h-5 w-5" />
                ) : (
                  <FileVideo className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate max-w-[260px]">
                  {selectedFile.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {(uploadStage === 'uploading' || uploadStage === 'processing') && (
          <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#635BFF]" />
                {stageMessage}
              </span>
              <span className="font-bold text-[#635BFF]">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#635BFF] h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {uploadStage === 'success' && (
          <div className="p-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              Upload and processing completed!
            </p>
            <p className="text-xs text-slate-600 dark:text-zinc-300">{stageMessage}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          {uploadStage === 'success' ? (
            <Button
              onClick={() => {
                handleReset();
                onClose();
              }}
            >
              Done
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                disabled={uploadStage === 'uploading' || uploadStage === 'processing'}
                onClick={() => {
                  handleReset();
                  onClose();
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={!selectedFile || uploadStage === 'uploading' || uploadStage === 'processing'}
                isLoading={uploadStage === 'uploading' || uploadStage === 'processing'}
                onClick={startUpload}
              >
                Start Upload
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

