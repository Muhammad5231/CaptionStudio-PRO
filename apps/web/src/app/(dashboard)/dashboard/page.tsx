'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Upload,
  Layers,
  ArrowRight,
  Sparkles,
  Video,
  Clock,
  HardDrive,
  Download,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Card, Button, StatusBadge, UsageMeter, PageHeader, EmptyState } from '@captionstudio/ui';
import { ProjectStatus } from '@captionstudio/types';
import { api } from '@/lib/api-client';
import { useAuth } from '@/context/auth-context';

interface ProjectItem {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  updatedAt: string;
}

interface UsageData {
  planTier: string;
  transcriptionMinutesTotal: number;
  transcriptionMinutesUsed: number;
  storageBytesTotal: number;
  storageBytesUsed: number;
  exportsTotal: number;
  exportsUsed: number;
  projectsCount: number;
}

export default function DashboardHomePage() {
  const { user, workspace } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [projRes, usageRes] = await Promise.all([
          api.get<{ success: boolean; data: { items: ProjectItem[] } }>('/projects?pageSize=4'),
          api.get<{ success: boolean; data: UsageData }>('/usage'),
        ]);

        setProjects(projRes.data.items || []);
        setUsage(usageRes.data);
      } catch {
        // Fallback gracefully
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const remainingMins = usage
    ? Math.max(0, usage.transcriptionMinutesTotal - usage.transcriptionMinutesUsed).toFixed(1)
    : '500';

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-50">
              Welcome back{user?.name ? `, ${user.name}` : ''}
            </h1>
            <span className="rounded-full bg-[#635BFF]/10 text-[#635BFF] px-2.5 py-0.5 text-[11px] font-bold uppercase">
              {usage?.planTier || 'Pro'} Plan
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            {workspace ? `Active workspace: ${workspace.name} • ` : ''}
            You have {remainingMins} transcription minutes available.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/projects?new=true">
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Create Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/projects?new=true"
          className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] hover:border-[#635BFF]/60 hover:shadow-md transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#635BFF]/10 text-[#635BFF] mb-3 group-hover:scale-105 transition-transform">
            <Video className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Upload Video</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Auto-transcribe speech and generate animated captions.</p>
        </Link>

        <Link
          href="/projects?new=true"
          className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] hover:border-amber-500/60 hover:shadow-md transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-3 group-hover:scale-105 transition-transform">
            <Upload className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Upload Subtitle File</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Import existing SRT, VTT, or ASS files to restyle.</p>
        </Link>

        <Link
          href="/templates"
          className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] hover:border-emerald-500/60 hover:shadow-md transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-3 group-hover:scale-105 transition-transform">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Browse Templates</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Explore trending styles, fonts, and animation presets.</p>
        </Link>
      </div>

      {/* Main Split: Projects & Usage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Projects */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Recent Projects</h2>
            <Link
              href="/projects"
              className="text-xs font-semibold text-[#635BFF] hover:underline flex items-center gap-1"
            >
              <span>View all projects</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-[#635BFF]" />
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={<Video className="h-8 w-8 text-slate-400" />}
              title="No projects yet"
              description="Get started by creating a project and uploading your video or subtitle file."
              action={
                <Link href="/projects?new=true">
                  <Button size="sm">Create First Project</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="group rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] overflow-hidden shadow-sm hover:border-[#635BFF]/50 transition-all flex flex-col justify-between"
                >
                  <Link href={`/projects/${proj.id}`} className="relative aspect-video w-full bg-slate-900 overflow-hidden block">
                    {proj.thumbnailUrl ? (
                      <img
                        src={proj.thumbnailUrl}
                        alt={proj.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-900 text-slate-500">
                        <Video className="h-8 w-8 opacity-40" />
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5">
                      <StatusBadge status={proj.status} />
                    </div>
                    {proj.durationSeconds ? (
                      <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-mono text-white backdrop-blur-sm">
                        {proj.durationSeconds.toFixed(1)}s
                      </span>
                    ) : null}
                  </Link>

                  <div className="p-4 space-y-2">
                    <Link
                      href={`/projects/${proj.id}`}
                      className="text-sm font-bold text-slate-900 dark:text-zinc-100 hover:text-[#635BFF] line-clamp-1 transition-colors"
                    >
                      {proj.name}
                    </Link>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{new Date(proj.updatedAt).toLocaleDateString()}</span>
                      <Link href={`/projects/${proj.id}`} className="text-[#635BFF] font-semibold hover:underline">
                        Open Project
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Usage Breakdown */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Monthly Usage</h2>
          <Card className="space-y-5">
            <UsageMeter
              label="Transcription Minutes"
              current={usage ? Math.round(usage.transcriptionMinutesUsed) : 0}
              max={usage?.transcriptionMinutesTotal || 500}
              unit="min"
            />
            <UsageMeter
              label="Cloud Storage"
              current={usage ? Number((usage.storageBytesUsed / (1024 * 1024 * 1024)).toFixed(1)) : 0}
              max={100}
              unit="GB"
            />
            <UsageMeter
              label="Exports Completed"
              current={usage?.exportsUsed || 0}
              max={usage?.exportsTotal || 300}
              unit="exports"
            />
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
              <Link href="/settings/billing" className="text-xs font-semibold text-[#635BFF] hover:underline flex items-center justify-between">
                <span>Manage Subscription</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
