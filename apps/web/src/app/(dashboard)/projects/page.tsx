'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  MoreVertical,
  Upload,
  Video,
  FileText,
  Trash2,
  Copy,
  Edit2,
  Archive,
  ExternalLink,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button, StatusBadge, Modal, Input, EmptyState } from '@captionstudio/ui';
import { ProjectStatus } from '@captionstudio/types';
import { api, ApiError } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';
import { UploadModal } from '@/components/upload/upload-modal';

interface ProjectItem {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  fps: number | null;
  width: number | null;
  height: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const { workspace } = useAuth();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // New Project Modal State
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Upload Modal State
  const [uploadTargetProject, setUploadTargetProject] = useState<{ id: string; name: string } | null>(null);

  // Rename Modal State
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: '12',
        ...(searchQuery ? { search: searchQuery } : {}),
        ...(statusFilter !== 'ALL' ? { status: statusFilter } : {}),
      });

      const res = await api.get<{
        success: boolean;
        data: {
          items: ProjectItem[];
          pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
          };
        };
      }>(`/projects?${queryParams.toString()}`);

      setProjects(res.data.items || []);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch {
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Check URL query for new=true
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('new') === 'true') {
        setIsNewProjectModalOpen(true);
      }
    }
  }, []);

  const handleCreateProject = async () => {
    if (!projectName.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await api.post<{
        success: boolean;
        data: { id: string };
      }>('/projects', {
        name: projectName.trim(),
        description: projectDescription.trim() || undefined,
        workspaceId: workspace?.id,
      });

      setIsNewProjectModalOpen(false);
      setProjectName('');
      setProjectDescription('');
      fetchProjects();
      router.push(`/projects/${res.data.id}`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await api.post(`/projects/${id}/duplicate`);
      fetchProjects();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to duplicate project');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await api.post(`/projects/${id}/archive`);
      fetchProjects();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to archive project');
    }
  };

  const handleRename = async () => {
    if (!renameTarget || !renameValue.trim()) return;
    setIsRenaming(true);
    try {
      await api.patch(`/projects/${renameTarget.id}`, { name: renameValue.trim() });
      setRenameTarget(null);
      fetchProjects();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to rename project');
    } finally {
      setIsRenaming(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Projects</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            {workspace ? `Workspace: ${workspace.name}` : 'Manage your video subtitle workspaces and active export renders.'}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsNewProjectModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          New Project
        </Button>
      </div>

      {/* Filter and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
          <Input
            placeholder="Search projects by name..."
            leftElement={<Search className="h-4 w-4 text-slate-400" />}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/60 p-1 rounded-lg text-xs font-medium">
            {['ALL', 'DRAFT', 'READY', 'PROCESSING', 'EXPORTED'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-md transition-all ${
                  statusFilter === status
                    ? 'bg-white dark:bg-[#18181B] text-slate-900 dark:text-zinc-50 shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                }`}
              >
                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 dark:border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects List/Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[#635BFF]" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<Video className="h-10 w-10 text-slate-400" />}
          title={searchQuery || statusFilter !== 'ALL' ? 'No matching projects found' : 'No projects created yet'}
          description={
            searchQuery || statusFilter !== 'ALL'
              ? 'Try changing your search keywords or clearing your status filter.'
              : 'Create your first caption project by uploading a video or importing a subtitle file.'
          }
          action={
            <Button
              size="sm"
              onClick={() => setIsNewProjectModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create First Project
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-zinc-700 transition-all"
            >
              {/* Thumbnail / Header */}
              <Link href={`/projects/${p.id}`} className="relative aspect-video w-full bg-slate-900 block overflow-hidden">
                {p.thumbnailUrl ? (
                  <img
                    src={p.thumbnailUrl}
                    alt={p.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-slate-900 text-slate-500">
                    <Video className="h-10 w-10 opacity-40" />
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5">
                  <StatusBadge status={p.status} />
                </div>
                {p.durationSeconds ? (
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-mono text-white backdrop-blur-sm">
                    {p.durationSeconds.toFixed(1)}s
                  </span>
                ) : null}
              </Link>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <Link
                    href={`/projects/${p.id}`}
                    className="text-sm font-bold text-slate-900 dark:text-zinc-100 hover:text-[#635BFF] line-clamp-1 transition-colors"
                  >
                    {p.name}
                  </Link>
                  {p.description && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUploadTargetProject({ id: p.id, name: p.name })}
                      className="p-1 text-slate-400 hover:text-[#635BFF] transition-colors"
                      title="Upload Media"
                    >
                      <Upload className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setRenameTarget({ id: p.id, name: p.name });
                        setRenameValue(p.name);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(p.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Mode */
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-zinc-800">
          {projects.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-12 w-20 rounded-lg bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center text-slate-500">
                  {p.thumbnailUrl ? (
                    <img src={p.thumbnailUrl} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <Video className="h-5 w-5 opacity-50" />
                  )}
                </div>
                <div>
                  <Link href={`/projects/${p.id}`} className="text-sm font-bold text-slate-900 dark:text-zinc-100 hover:text-[#635BFF]">
                    {p.name}
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Updated {new Date(p.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <StatusBadge status={p.status} />
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setUploadTargetProject({ id: p.id, name: p.name })}>
                    <Upload className="h-3.5 w-3.5 mr-1" /> Upload
                  </Button>
                  <Link href={`/projects/${p.id}`}>
                    <Button size="sm">Open</Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-6">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="flex items-center px-3 text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        title="Create New Project"
        description="Set up your project workspace to upload media and generate professional captions."
      >
        <div className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Hormozi Style Reel #04"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181B] p-2.5 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
              rows={3}
              placeholder="Add project notes or client references..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsNewProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button isLoading={isSubmitting} disabled={!projectName.trim()} onClick={handleCreateProject}>
              Create Project
            </Button>
          </div>
        </div>
      </Modal>

      {/* Quick Upload Modal */}
      {uploadTargetProject && (
        <UploadModal
          isOpen={Boolean(uploadTargetProject)}
          onClose={() => setUploadTargetProject(null)}
          projectId={uploadTargetProject.id}
          projectName={uploadTargetProject.name}
          onSuccess={fetchProjects}
        />
      )}

      {/* Rename Modal */}
      {renameTarget && (
        <Modal
          isOpen={Boolean(renameTarget)}
          onClose={() => setRenameTarget(null)}
          title="Rename Project"
        >
          <div className="space-y-4">
            <Input
              label="Project Name"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRenameTarget(null)}>
                Cancel
              </Button>
              <Button isLoading={isRenaming} onClick={handleRename}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
