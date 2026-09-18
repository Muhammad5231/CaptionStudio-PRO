'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Video,
  FileText,
  Clock,
  Layers,
  Upload,
  Sparkles,
  Trash2,
  Copy,
  Archive,
  Edit2,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button, StatusBadge, Card, Modal, Input } from '@captionstudio/ui';
import { api, ApiError } from '@/lib/api-client';
import { UploadModal } from '@/components/upload/upload-modal';

interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  status: string;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  fps: number | null;
  createdAt: string;
  updatedAt: string;
  assets: Array<{
    id: string;
    type: 'VIDEO' | 'SUBTITLE';
    url: string;
    mimeType: string;
    sizeBytes: number;
    durationSeconds: number | null;
    width: number | null;
    height: number | null;
    fps: number | null;
    createdAt: string;
  }>;
  versions: Array<{
    id: string;
    versionNumber: number;
    captionPayload: { lines?: Array<{ id: string; text: string; startTime: number; endTime: number }> } | unknown;
    changelog: string | null;
    createdAt: string;
  }>;
  recentJobs: Array<{
    id: string;
    type: string;
    status: string;
    progress: number;
    stage: string | null;
    errorMessage: string | null;
  }>;
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Rename modal state
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // Real-time SSE progress state
  const [liveProgress, setLiveProgress] = useState<number | null>(null);
  const [liveStage, setLiveStage] = useState<string | null>(null);

  const fetchProject = async () => {
    try {
      setError(null);
      const res = await api.get<{ success: boolean; data: ProjectDetail }>(`/projects/${projectId}`);
      setProject(res.data);
      setRenameValue(res.data.name);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Project could not be found or access is denied.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  // Connect SSE if project is processing
  useEffect(() => {
    if (!project || project.status !== 'PROCESSING') return;

    const activeJob = project.recentJobs.find((j) => j.status === 'PROCESSING' || j.status === 'PENDING');
    if (!activeJob) return;

    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/jobs/${activeJob.id}/events`,
      { withCredentials: true }
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.progress !== undefined) setLiveProgress(data.progress);
        if (data.stage) setLiveStage(data.stage);

        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          eventSource.close();
          fetchProject();
        }
      } catch {
        // Ignore JSON error
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [project?.status]);

  const handleRename = async () => {
    if (!renameValue.trim()) return;
    setIsRenaming(true);
    try {
      await api.patch(`/projects/${projectId}`, { name: renameValue.trim() });
      setIsRenameOpen(false);
      fetchProject();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to rename project');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await api.post<{ success: boolean; data: { id: string } }>(`/projects/${projectId}/duplicate`);
      router.push(`/projects/${res.data.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to duplicate project');
    }
  };

  const handleArchive = async () => {
    try {
      await api.post(`/projects/${projectId}/archive`);
      fetchProject();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to archive project');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      router.push('/projects');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#635BFF]" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-zinc-50">Project Not Accessible</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400">{error || 'Unable to access project.'}</p>
        <Link href="/projects" className="inline-flex items-center gap-2 text-xs font-semibold text-[#635BFF]">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>
      </div>
    );
  }

  const videoAsset = project.assets.find((a) => a.type === 'VIDEO');
  const subtitleAsset = project.assets.find((a) => a.type === 'SUBTITLE');
  const latestVersion = project.versions[0];
  const captionsPayload = latestVersion?.captionPayload as { lines?: Array<{ id: string; text: string; startTime: number; endTime: number }> } | undefined;
  const captionLines = captionsPayload?.lines || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6">
        <div className="space-y-1">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 mb-2 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Projects</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          {project.description && (
            <p className="text-xs text-slate-500 dark:text-zinc-400">{project.description}</p>
          )}
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(true)}>
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            <span>Upload Media</span>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsRenameOpen(true)}>
            <Edit2 className="h-3.5 w-3.5 mr-1.5" />
            <span>Rename</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            <span>Duplicate</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleArchive}>
            <Archive className="h-3.5 w-3.5 mr-1.5" />
            <span>{project.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:bg-red-500/10">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Real-time processing banner if active */}
      {project.status === 'PROCESSING' && (
        <div className="p-4 rounded-xl border border-[#635BFF]/30 bg-[#635BFF]/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#635BFF]" />
              {liveStage || 'Processing media analysis in worker...'}
            </span>
            <span className="font-bold text-[#635BFF]">{liveProgress ?? 40}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#635BFF] h-full rounded-full transition-all duration-300"
              style={{ width: `${liveProgress ?? 40}%` }}
            />
          </div>
        </div>
      )}

      {/* Media & Subtitles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Video Player / Asset View */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden bg-black/90">
            {videoAsset ? (
              <div className="aspect-video w-full flex items-center justify-center bg-black">
                <video
                  src={videoAsset.url}
                  controls
                  className="max-h-[500px] w-full rounded-lg"
                />
              </div>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center p-8 text-center space-y-3 bg-slate-900 text-white">
                <Video className="h-12 w-12 text-slate-500" />
                <div>
                  <p className="text-sm font-semibold">No video uploaded yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload an MP4, MOV, or WEBM video to preview and synchronize captions.
                  </p>
                </div>
                <Button size="sm" onClick={() => setIsUploadModalOpen(true)}>
                  <Upload className="h-4 w-4 mr-1.5" />
                  Upload Video
                </Button>
              </div>
            )}
          </Card>

          {/* Subtitle Lines Preview */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#635BFF]" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Subtitle Track ({captionLines.length} lines)
                </h2>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                {latestVersion ? `Version ${latestVersion.versionNumber}` : 'No captions track'}
              </span>
            </div>

            {captionLines.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 divide-y divide-slate-100 dark:divide-zinc-800">
                {captionLines.map((line, idx) => (
                  <div key={line.id || idx} className="pt-2 flex items-start gap-4 text-xs">
                    <span className="font-mono text-[10px] text-slate-400 shrink-0 w-24">
                      {line.startTime.toFixed(1)}s &rarr; {line.endTime.toFixed(1)}s
                    </span>
                    <p className="text-slate-800 dark:text-zinc-200 font-medium">{line.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 dark:text-zinc-400 space-y-2">
                <p>No subtitle file imported yet for this project.</p>
                <Button variant="outline" size="sm" onClick={() => setIsUploadModalOpen(true)}>
                  Import Subtitles (.SRT, .VTT)
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Metadata Sidebar */}
        <div className="space-y-6">
          <Card className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Media Specifications
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400">Duration</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {project.durationSeconds ? `${project.durationSeconds.toFixed(1)}s` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400">Resolution</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {project.width && project.height ? `${project.width}x${project.height}` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400">Frame Rate</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {project.fps ? `${project.fps} FPS` : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-slate-500 dark:text-zinc-400">Created</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-zinc-400">Last Modified</span>
                <span className="font-semibold text-slate-800 dark:text-zinc-200">
                  {new Date(project.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
              Project Assets
            </h3>
            {project.assets.length > 0 ? (
              <div className="space-y-2">
                {project.assets.map((a) => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded-lg border border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {a.type === 'VIDEO' ? <Video className="h-4 w-4 text-[#635BFF]" /> : <FileText className="h-4 w-4 text-emerald-500" />}
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-zinc-200">{a.type}</p>
                        <p className="text-[10px] text-slate-400">{(a.sizeBytes / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No assets uploaded yet.</p>
            )}
          </Card>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        projectId={project.id}
        projectName={project.name}
        onSuccess={fetchProject}
      />

      {/* Rename Modal */}
      <Modal
        isOpen={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        title="Rename Project"
      >
        <div className="space-y-4">
          <Input
            label="Project Name"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>
              Cancel
            </Button>
            <Button isLoading={isRenaming} onClick={handleRename}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

