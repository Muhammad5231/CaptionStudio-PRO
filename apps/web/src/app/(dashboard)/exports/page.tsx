'use client';

import React from 'react';
import Link from 'next/link';
import { Download, ExternalLink, HardDrive, AlertCircle } from 'lucide-react';
import { StatusBadge, Button, EmptyState } from '@captionstudio/ui';

interface ExportItem {
  id: string;
  projectName: string;
  thumbnailUrl: string;
  format: string;
  resolution: string;
  fps: number;
  sizeMb: number;
  duration: string;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED' | 'QUEUED';
  createdAt: string;
}

const EXPORTS_DATA: ExportItem[] = [
  {
    id: 'exp-1',
    projectName: 'The 3 Keys to Bootstrapping a SaaS to $100K MRR',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop',
    format: 'MP4 (H.264)',
    resolution: '1080x1920',
    fps: 60,
    sizeMb: 48.2,
    duration: '58.4s',
    status: 'COMPLETED',
    createdAt: '10 mins ago',
  },
  {
    id: 'exp-2',
    projectName: 'AI Automation Masterclass Ep. 04 — Agentic Workflows',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=200&fit=crop',
    format: 'MP4 (H.264)',
    resolution: '1920x1080',
    fps: 60,
    sizeMb: 320.5,
    duration: '7m 00s',
    status: 'COMPLETED',
    createdAt: 'Yesterday',
  },
  {
    id: 'exp-3',
    projectName: 'Quick Teaser: Product Hunt Launch Day',
    thumbnailUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=200&fit=crop',
    format: 'MP4 (H.264)',
    resolution: '1080x1920',
    fps: 30,
    sizeMb: 12.0,
    duration: '15.0s',
    status: 'PROCESSING',
    createdAt: 'Just now',
  },
];

export default function ExportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Exports Hub</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            Download finished video renders with burned subtitles and track background encoding tasks.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 font-semibold text-slate-600 dark:text-zinc-400">
            <tr>
              <th className="p-3.5 pl-4">Export Video</th>
              <th className="p-3.5">Format</th>
              <th className="p-3.5">Resolution</th>
              <th className="p-3.5">FPS</th>
              <th className="p-3.5">Size</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Date</th>
              <th className="p-3.5 text-right pr-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300">
            {EXPORTS_DATA.map((exp) => (
              <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                <td className="p-3.5 pl-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={exp.thumbnailUrl}
                      alt={exp.projectName}
                      className="h-9 w-14 rounded-lg object-cover bg-slate-900"
                    />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-zinc-100 line-clamp-1">
                        {exp.projectName}
                      </p>
                      <p className="text-[11px] text-slate-400">{exp.duration}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3.5 font-mono text-[11px]">{exp.format}</td>
                <td className="p-3.5 font-mono text-[11px]">{exp.resolution}</td>
                <td className="p-3.5 font-mono text-[11px]">{exp.fps} FPS</td>
                <td className="p-3.5 font-mono text-[11px]">{exp.sizeMb} MB</td>
                <td className="p-3.5">
                  <StatusBadge status={exp.status} />
                </td>
                <td className="p-3.5 text-slate-400">{exp.createdAt}</td>
                <td className="p-3.5 text-right pr-4">
                  {exp.status === 'COMPLETED' ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-8 px-3"
                      leftIcon={<Download className="h-3.5 w-3.5 text-[#635BFF]" />}
                      onClick={() => alert('Downloading MP4 video file...')}
                    >
                      Download
                    </Button>
                  ) : exp.status === 'PROCESSING' ? (
                    <span className="text-xs text-[#635BFF] font-semibold animate-pulse">
                      Encoding (65%)...
                    </span>
                  ) : (
                    <span className="text-xs text-red-500 font-semibold">Failed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

