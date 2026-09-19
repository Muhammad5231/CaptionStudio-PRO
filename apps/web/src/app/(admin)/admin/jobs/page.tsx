'use client';

import React, { useState, useEffect } from 'react';
import { StatusBadge, Button } from '@captionstudio/ui';
import { RotateCw, Loader2 } from 'lucide-react';
import { api } from '@/lib/api-client';

interface JobRow {
  id: string;
  type: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'PENDING';
  progress: number;
  stage: string | null;
  errorMessage: string | null;
  outputUrl: string | null;
  projectId: string;
  projectName: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const url = filter === 'ALL' ? '/admin/jobs' : `/admin/jobs?status=${filter}`;
      const res = await api.get<{ success: boolean; data: JobRow[] }>(url);
      if (res.data) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Background Job Monitor</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            Real-time export and transcription tasks from the database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchJobs}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

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
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-red-600" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-500 dark:text-zinc-400">
            No background jobs found.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 font-semibold text-slate-600 dark:text-zinc-400">
              <tr>
                <th className="p-3.5 pl-4">Job ID</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Project</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Progress</th>
                <th className="p-3.5 text-right pr-4">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-mono text-[11px]">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 pl-4 font-bold text-slate-900 dark:text-zinc-100">{j.id}</td>
                  <td className="p-3.5 text-[#635BFF] font-semibold">{j.type}</td>
                  <td className="p-3.5 font-sans">{j.projectName}</td>
                  <td className="p-3.5 font-sans text-slate-500">{j.userEmail}</td>
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
                  <td className="p-3.5 text-right pr-4 font-sans text-slate-400">
                    {new Date(j.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
