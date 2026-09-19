'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@captionstudio/ui';
import { Users, DollarSign, Video, HardDrive, AlertTriangle, Activity, Loader2, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api-client';

interface OverviewMetrics {
  totalUsers: number;
  activeUsers: number;
  projectsCreated: number;
  jobsDispatched: number;
  storageUsedBytes: number;
  failedJobs24h: number;
  jobsBreakdown: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  billing: {
    status: string;
    note: string;
  };
}

interface QueueInfo {
  name: string;
  status: string;
  counts: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  };
}

interface QueuesData {
  redis: {
    isConnected: boolean;
    latencyMs?: number;
    status: string;
    memoryUsedHuman?: string;
    error?: string;
  };
  queues: QueueInfo[];
}

export default function AdminOverviewPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [queuesData, setQueuesData] = useState<QueuesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, queuesRes] = await Promise.all([
        api.get<{ success: boolean; data: { metrics: OverviewMetrics } }>('/admin/overview'),
        api.get<{ success: boolean; data: QueuesData }>('/admin/queues'),
      ]);

      if (overviewRes.data?.metrics) {
        setMetrics(overviewRes.data.metrics);
      }
      if (queuesRes.data) {
        setQueuesData(queuesRes.data);
      }
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatStorage = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`;
    }
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const kpis = [
    {
      label: 'Total Registered Users',
      value: metrics ? metrics.totalUsers.toLocaleString() : '—',
      subtext: metrics ? `${metrics.activeUsers} active` : 'Loading...',
      icon: Users,
    },
    {
      label: 'Projects Created',
      value: metrics ? metrics.projectsCreated.toLocaleString() : '—',
      subtext: 'Database total',
      icon: Video,
    },
    {
      label: 'Jobs Dispatched',
      value: metrics ? metrics.jobsDispatched.toLocaleString() : '—',
      subtext: metrics ? `${metrics.jobsBreakdown.completed} completed` : 'Loading...',
      icon: Activity,
    },
    {
      label: 'Cloud Storage Used',
      value: metrics ? formatStorage(metrics.storageUsedBytes) : '—',
      subtext: 'Project assets size',
      icon: HardDrive,
    },
    {
      label: 'Failed Jobs (24h)',
      value: metrics ? metrics.failedJobs24h.toString() : '—',
      subtext: metrics && metrics.failedJobs24h > 0 ? 'Requires inspection' : 'Healthy',
      icon: AlertTriangle,
      alert: metrics ? metrics.failedJobs24h > 0 : false,
    },
    {
      label: 'Subscription Billing',
      value: 'Phase 7',
      subtext: 'Stripe integration scheduled',
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
            Admin Analytics & Cluster Overview
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            Real-time platform throughput, database statistics, and worker queue health.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Real KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-zinc-50">
                  {isLoading ? '—' : kpi.value}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    kpi.alert ? 'text-red-500' : 'text-slate-500 dark:text-zinc-400'
                  }`}
                >
                  {kpi.subtext}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Real Queues & Redis Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BullMQ Queues */}
        <Card className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">BullMQ Background Task Queues</h2>
            <span className="text-xs text-slate-400">
              {queuesData?.queues.length ? `${queuesData.queues.length} Queues Configured` : 'Queue Monitor'}
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-red-600" />
            </div>
          ) : !queuesData?.redis.isConnected ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-1">
              <p className="font-semibold">Redis is currently unavailable</p>
              <p className="text-[11px]">
                {queuesData?.redis.error || 'Queue metrics cannot be retrieved without an active Redis instance.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-zinc-800">
              {queuesData.queues.map((q) => (
                <div key={q.name} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-zinc-100">{q.name}</span>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>Waiting: {q.counts.waiting}</span>
                      <span>•</span>
                      <span className="text-emerald-500 font-medium">Active: {q.counts.active}</span>
                      <span>•</span>
                      <span>Delayed: {q.counts.delayed}</span>
                      <span>•</span>
                      <span className={q.counts.failed > 0 ? 'text-red-500 font-semibold' : ''}>
                        Failed: {q.counts.failed}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex self-start sm:self-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      q.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-500'
                    }`}
                  >
                    {q.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Infrastructure Diagnostics */}
        <Card className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Cluster Diagnostics</h2>
            <span
              className={`text-[10px] rounded-full px-2 py-0.5 font-bold uppercase ${
                queuesData?.redis.isConnected
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-red-500/10 text-red-500'
              }`}
            >
              {queuesData?.redis.isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
              <span className="text-slate-500">Redis Service</span>
              <span className="font-mono font-semibold">
                {queuesData?.redis.isConnected ? 'Healthy' : 'Disconnected'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
              <span className="text-slate-500">Redis Latency</span>
              <span className="font-mono font-semibold">
                {queuesData?.redis.latencyMs !== undefined ? `${queuesData.redis.latencyMs}ms` : '—'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-zinc-800/60">
              <span className="text-slate-500">Redis Memory Used</span>
              <span className="font-mono font-semibold">
                {queuesData?.redis.memoryUsedHuman || '—'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Jobs in Pipeline</span>
              <span className="font-mono font-semibold">
                {metrics
                  ? metrics.jobsBreakdown.pending + metrics.jobsBreakdown.processing
                  : '—'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
