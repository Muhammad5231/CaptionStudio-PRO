'use client';

import React, { useState } from 'react';
import { StatusBadge, Button } from '@captionstudio/ui';
import { RotateCw, XCircle, Play } from 'lucide-react';

interface JobRow {
  id: string;
  type: string;
  user: string;
  project: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PENDING';
  progress: number;
  duration: string;
  started: string;
}

const INITIAL_JOBS: JobRow[] = [
  { id: 'job-941', type: 'EXPORT_BURN', user: 'marcus@brodymedia.com', project: 'SaaS Walkthrough Ep 1', status: 'PROCESSING', progress: 68, duration: '45s', started: '45s ago' },
  { id: 'job-940', type: 'TRANSCRIPTION', user: 'sophia@creatorhub.io', project: 'Interview with Founder', status: 'COMPLETED', progress: 100, duration: '12s', started: '2m ago' },
  { id: 'job-939', type: 'EXPORT_BURN', user: 'elena@filmcraft.net', project: 'Cinematic Reel Cut 2', status: 'FAILED', progress: 14, duration: '8s', started: '10m ago' },
  { id: 'job-938', type: 'THUMBNAIL', user: 'alex.creator@captionstudio.io', project: 'Product Hunt Teaser', status: 'COMPLETED', progress: 100, duration: '2s', started: '15m ago' },
];

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobRow[]>(INITIAL_JOBS);
  const [filter, setFilter] = useState('ALL');

  const filtered = jobs.filter((j) => filter === 'ALL' || j.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Background Job Monitor</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            Real-time BullMQ task monitoring across transcription, thumbnailing, and FFmpeg video encoding queues.
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="ALL">All States</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 font-semibold text-slate-600 dark:text-zinc-400">
            <tr>
              <th className="p-3.5 pl-4">Job ID</th>
              <th className="p-3.5">Type</th>
              <th className="p-3.5">User</th>
              <th className="p-3.5">Project</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Progress</th>
              <th className="p-3.5">Duration</th>
              <th className="p-3.5 text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-mono text-[11px]">
            {filtered.map((j) => (
              <tr key={j.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                <td className="p-3.5 pl-4 font-bold text-slate-900 dark:text-zinc-100">{j.id}</td>
                <td className="p-3.5 text-[#635BFF] font-semibold">{j.type}</td>
                <td className="p-3.5 font-sans">{j.user}</td>
                <td className="p-3.5 font-sans">{j.project}</td>
                <td className="p-3.5">
                  <StatusBadge status={j.status} />
                </td>
                <td className="p-3.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-[#635BFF]"
                        style={{ width: `${j.progress}%` }}
                      />
                    </div>
                    <span>{j.progress}%</span>
                  </div>
                </td>
                <td className="p-3.5 text-slate-400">{j.duration}</td>
                <td className="p-3.5 text-right pr-4 font-sans">
                  {j.status === 'FAILED' ? (
                    <button
                      onClick={() => alert(`Retrying job ${j.id}...`)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#635BFF] hover:underline"
                    >
                      <RotateCw className="h-3 w-3" />
                      <span>Retry</span>
                    </button>
                  ) : j.status === 'PROCESSING' ? (
                    <button
                      onClick={() => alert(`Cancelling job ${j.id}...`)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:underline"
                    >
                      <XCircle className="h-3 w-3" />
                      <span>Cancel</span>
                    </button>
                  ) : (
                    <span className="text-slate-400">—</span>
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

