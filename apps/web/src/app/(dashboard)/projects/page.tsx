'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { Button, StatusBadge, Modal, Input, EmptyState } from '@captionstudio/ui';
import { ProjectStatus } from '@captionstudio/types';

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  thumbnailUrl: string;
  duration: string;
  fps: number;
  resolution: string;
  updatedAt: string;
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-1',
    name: 'The 3 Keys to Bootstrapping a SaaS to $100K MRR',
    description: 'Vertical 9:16 talking-head reel with Hormozi kinetic green subtitles.',
    status: ProjectStatus.READY,
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop',
    duration: '58.4s',
    fps: 30,
    resolution: '1080x1920',
    updatedAt: '2 hours ago',
  },
  {
    id: 'proj-2',
    name: 'AI Automation Masterclass Ep. 04 — Agentic Workflows',
    description: 'Long-form YouTube video with chapterized subtitles and keyword highlights.',
    status: ProjectStatus.EXPORTED,
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&h=300&fit=crop',
    duration: '7m 00s',
    fps: 60,
    resolution: '1920x1080',
    updatedAt: 'Yesterday',
  },
  {
    id: 'proj-3',
    name: 'Quick Teaser: Product Hunt Launch Day Announcement',
    description: 'Punchy 15s teaser with Beast Kinetic typography.',
    status: ProjectStatus.DRAFT,
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&h=300&fit=crop',
    duration: '15.0s',
    fps: 30,
    resolution: '1080x1920',
    updatedAt: '3 days ago',
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [creationMode, setCreationMode] = useState<'video' | 'subtitle' | 'blank'>('video');
  const [projectName, setProjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateProject = () => {
    if (!projectName.trim()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const newProj: ProjectItem = {
        id: `proj-${Date.now()}`,
        name: projectName,
        description: 'Newly created project',
        status: ProjectStatus.DRAFT,
        thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=500&h=300&fit=crop',
        duration: '0.0s',
        fps: 30,
        resolution: '1080x1920',
        updatedAt: 'Just now',
      };
      setProjects([newProj, ...projects]);
      setIsSubmitting(false);
      setIsNewProjectModalOpen(false);
      setProjectName('');
    }, 600);
  };

  const handleDelete = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const handleDuplicate = (proj: ProjectItem) => {
    const copy: ProjectItem = {
      ...proj,
      id: `proj-${Date.now()}`,
      name: `${proj.name} (Copy)`,
      updatedAt: 'Just now',
    };
    setProjects([copy, ...projects]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Projects</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            Manage your video subtitle workspaces and active export renders.
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
          >
            <option value="ALL">All Statuses</option>
            <option value={ProjectStatus.DRAFT}>Draft</option>
            <option value={ProjectStatus.READY}>Ready</option>
            <option value={ProjectStatus.EXPORTED}>Exported</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-slate-500 transition-colors ${
              viewMode === 'grid' ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100' : ''
            }`}
            title="Grid View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-slate-500 transition-colors ${
              viewMode === 'list' ? 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100' : ''
            }`}
            title="List View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Projects Display */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={<Video className="h-6 w-6" />}
          title="No projects found"
          description="You haven't created any projects matching your search criteria."
          action={
            <Button
              size="sm"
              onClick={() => setIsNewProjectModalOpen(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create New Project
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="group rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] overflow-hidden shadow-sm hover:border-[#635BFF]/50 transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                <img
                  src={proj.thumbnailUrl}
                  alt={proj.name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5">
                  <StatusBadge status={proj.status} />
                </div>
                <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-mono text-white">
                  {proj.duration}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100 line-clamp-1 group-hover:text-[#635BFF] transition-colors">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px]">{proj.updatedAt}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(proj)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(proj.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      className="ml-1 text-xs font-semibold text-[#635BFF] hover:underline"
                    >
                      Open
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 font-semibold text-slate-600 dark:text-zinc-400">
              <tr>
                <th className="p-3.5 pl-4">Project</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Resolution</th>
                <th className="p-3.5">Updated</th>
                <th className="p-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300">
              {filteredProjects.map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 pl-4 font-semibold text-slate-900 dark:text-zinc-100">
                    {proj.name}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={proj.status} />
                  </td>
                  <td className="p-3.5 font-mono text-[11px]">{proj.duration}</td>
                  <td className="p-3.5 font-mono text-[11px]">{proj.resolution}</td>
                  <td className="p-3.5 text-slate-400">{proj.updatedAt}</td>
                  <td className="p-3.5 text-right pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDuplicate(proj)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                        title="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(proj.id)}
                        className="text-slate-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Project Modal */}
      <Modal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        title="Create New Project"
        description="Choose how you'd like to start your subtitle workspace."
      >
        <div className="space-y-5">
          {/* Method Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900">
            <button
              onClick={() => setCreationMode('video')}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg text-xs font-semibold transition-all ${
                creationMode === 'video'
                  ? 'bg-white dark:bg-[#111113] text-[#635BFF] shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              <Video className="h-4 w-4" />
              <span>Upload Video</span>
            </button>
            <button
              onClick={() => setCreationMode('subtitle')}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg text-xs font-semibold transition-all ${
                creationMode === 'subtitle'
                  ? 'bg-white dark:bg-[#111113] text-[#635BFF] shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Upload Subtitle</span>
            </button>
            <button
              onClick={() => setCreationMode('blank')}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg text-xs font-semibold transition-all ${
                creationMode === 'blank'
                  ? 'bg-white dark:bg-[#111113] text-[#635BFF] shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>Start Blank</span>
            </button>
          </div>

          <Input
            label="Project Name"
            placeholder="e.g. 5 Growth Hacks for B2B SaaS"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />

          {/* Upload Dropzone Preview */}
          {creationMode !== 'blank' && (
            <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-zinc-800 p-6 text-center bg-slate-50 dark:bg-zinc-900/30">
              <Upload className="mx-auto h-8 w-8 text-slate-400 dark:text-zinc-500 mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                {creationMode === 'video'
                  ? 'Drop video file here (MP4, MOV, up to 500MB)'
                  : 'Drop subtitle file here (SRT, VTT, ASS, SSA, JSON)'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">or click to browse from device</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewProjectModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateProject}
              isLoading={isSubmitting}
              disabled={!projectName.trim()}
            >
              Initialize Workspace
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

