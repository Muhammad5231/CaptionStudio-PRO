'use client';

import React from 'react';
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
} from 'lucide-react';
import { Card, Button, StatusBadge, UsageMeter, PageHeader } from '@captionstudio/ui';
import { ProjectStatus } from '@captionstudio/types';

export default function DashboardHomePage() {
  const recentProjects = [
    {
      id: 'proj-1',
      name: 'The 3 Keys to Bootstrapping a SaaS to $100K MRR',
      status: ProjectStatus.READY,
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&h=300&fit=crop',
      duration: '58.4s',
      template: 'Hormozi Emerald',
      updatedAt: '2 hours ago',
    },
    {
      id: 'proj-2',
      name: 'AI Automation Masterclass Ep. 04 — Agentic Workflows',
      status: ProjectStatus.EXPORTED,
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&h=300&fit=crop',
      duration: '7m 00s',
      template: 'Nordic Clean',
      updatedAt: 'Yesterday',
    },
    {
      id: 'proj-3',
      name: 'Quick Teaser: Product Hunt Launch Day Announcement',
      status: ProjectStatus.DRAFT,
      thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&h=300&fit=crop',
      duration: '15.0s',
      template: 'Beast Kinetic',
      updatedAt: '3 days ago',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#111113] border border-slate-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-50">Welcome back, Alex</h1>
            <span className="rounded-full bg-[#635BFF]/10 text-[#635BFF] px-2.5 py-0.5 text-[11px] font-bold uppercase">
              Pro Studio Plan
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            You have 467.5 transcription minutes remaining in this monthly billing period.
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
          href="/projects?new=video"
          className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] hover:border-[#635BFF]/60 hover:shadow-md transition-all group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#635BFF]/10 text-[#635BFF] mb-3 group-hover:scale-105 transition-transform">
            <Video className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Upload Video</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Auto-transcribe speech and generate animated captions.</p>
        </Link>

        <Link
          href="/projects?new=subtitle"
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
          <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">Browse 50+ Templates</h3>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentProjects.map((proj) => (
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

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-zinc-100 line-clamp-1 group-hover:text-[#635BFF] transition-colors">
                      {proj.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Style: {proj.template}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{proj.updatedAt}</span>
                    <Link
                      href={`/projects?edit=${proj.id}`}
                      className="font-semibold text-[#635BFF] hover:underline"
                    >
                      Open Editor
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quota Meters & Active Plan */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                Monthly Usage Quota
              </span>
              <Link href="/usage" className="text-xs text-[#635BFF] font-semibold hover:underline">
                Details
              </Link>
            </div>

            <UsageMeter
              label="AI Transcription"
              current={32.5}
              max={500}
              unit="mins"
            />

            <UsageMeter
              label="Studio Rendering"
              current={28.0}
              max={500}
              unit="mins"
            />

            <UsageMeter
              label="Cloud Media Storage"
              current={4.8}
              max={100}
              unit="GB"
            />

            <UsageMeter
              label="Monthly Exports"
              current={14}
              max={300}
              unit="videos"
            />
          </Card>

          {/* Quick Support Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#635BFF]/10 via-transparent to-transparent border border-[#635BFF]/20 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#635BFF] uppercase tracking-wider">
              <Sparkles className="h-4 w-4" />
              <span>Need help editing?</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Check out our 2-minute walkthrough on word-level styling and viral TikTok animation curves.
            </p>
            <Link
              href="/resources"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#635BFF] hover:underline"
            >
              <span>Watch tutorial</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

