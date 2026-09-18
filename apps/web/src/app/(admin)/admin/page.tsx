'use client';

import React from 'react';
import { Card } from '@captionstudio/ui';
import { Users, DollarSign, Video, HardDrive, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function AdminOverviewPage() {
  const metrics = [
    { label: 'Total Users', value: '14,820', change: '+12.4%', icon: Users, isPositive: true },
    { label: 'Active Monthly Subscribers', value: '3,410', change: '+8.1%', icon: TrendingUp, isPositive: true },
    { label: 'Current MRR', value: '$112,450', change: '+14.2%', icon: DollarSign, isPositive: true },
    { label: 'Videos Processed', value: '142,100', change: '+22.5%', icon: Video, isPositive: true },
    { label: 'Cloud Storage Used', value: '4.2 TB', change: '+6.3%', icon: HardDrive, isPositive: true },
    { label: 'Failed Jobs (24h)', value: '3', change: '-50.0%', icon: AlertTriangle, isPositive: true },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Admin Analytics & Cluster Overview</h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          Real-time platform throughput, subscription revenue, and worker pipeline health.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">{m.label}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-zinc-50">{m.value}</span>
                <span className="text-xs font-semibold text-emerald-500">{m.change}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Simulated Chart & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Daily Video Processing Volume (Past 14 Days)</h2>
            <span className="text-[11px] text-slate-400">Avg. 9,800 mins/day</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2">
            {[45, 60, 52, 78, 65, 85, 92, 70, 84, 96, 110, 105, 125, 138].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div
                  className="w-full bg-[#635BFF] rounded-t transition-all group-hover:bg-[#5248E6]"
                  style={{ height: `${(val / 140) * 160}px` }}
                />
                <span className="text-[9px] text-slate-400">{idx + 1}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">Live Worker Status</h2>
            <span className="text-[10px] rounded-full bg-emerald-500/10 text-emerald-500 px-2 py-0.5 font-bold uppercase">Healthy</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">transcription-queue</span>
              <span className="font-mono font-semibold">2 active • 0 waiting</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">render-burn-queue</span>
              <span className="font-mono font-semibold">1 active • 3 waiting</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">thumbnail-queue</span>
              <span className="font-mono font-semibold">idle • 0 waiting</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Redis Memory Used</span>
              <span className="font-mono font-semibold">48.2 MB / 1 GB</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

