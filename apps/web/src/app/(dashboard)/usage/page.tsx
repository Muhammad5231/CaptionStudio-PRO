'use client';

import React from 'react';
import Link from 'next/link';
import { Card, UsageMeter, Button } from '@captionstudio/ui';
import { ArrowUpRight } from 'lucide-react';

export default function UsagePage() {
  const ledgerEntries = [
    {
      id: 'ledg-101',
      type: 'TRANSCRIPTION_MINUTES',
      amount: '- 0.97 mins',
      project: 'The 3 Keys to Bootstrapping a SaaS',
      jobId: 'job-stt-4891',
      date: 'Sep 18, 2026 14:22',
    },
    {
      id: 'ledg-102',
      type: 'RENDER_MINUTES',
      amount: '- 0.97 mins',
      project: 'The 3 Keys to Bootstrapping a SaaS',
      jobId: 'job-burn-9182',
      date: 'Sep 18, 2026 14:25',
    },
    {
      id: 'ledg-103',
      type: 'TRANSCRIPTION_MINUTES',
      amount: '- 7.00 mins',
      project: 'AI Automation Masterclass Ep. 04',
      jobId: 'job-stt-3120',
      date: 'Sep 17, 2026 11:04',
    },
    {
      id: 'ledg-104',
      type: 'EXPORTS_COUNT',
      amount: '- 1 export',
      project: 'AI Automation Masterclass Ep. 04',
      jobId: 'job-burn-4421',
      date: 'Sep 17, 2026 11:15',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Usage & Ledger</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            Monitor real-time consumption of transcription minutes, render compute, and cloud storage.
          </p>
        </div>
        <Link href="/settings/billing">
          <Button size="sm" rightIcon={<ArrowUpRight className="h-4 w-4" />}>
            Upgrade Plan
          </Button>
        </Link>
      </div>

      {/* 4 Usage Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <UsageMeter
            label="Transcription Quota"
            current={32.5}
            max={500}
            unit="mins"
          />
          <p className="text-[11px] text-slate-400 mt-3">467.5 mins remaining until reset on Oct 18</p>
        </Card>

        <Card>
          <UsageMeter
            label="Studio Rendering"
            current={28.0}
            max={500}
            unit="mins"
          />
          <p className="text-[11px] text-slate-400 mt-3">Priority GPU hardware rendering</p>
        </Card>

        <Card>
          <UsageMeter
            label="Cloud Storage"
            current={4.8}
            max={100}
            unit="GB"
          />
          <p className="text-[11px] text-slate-400 mt-3">95.2 GB available for media files</p>
        </Card>

        <Card>
          <UsageMeter
            label="Monthly Exports"
            current={14}
            max={300}
            unit="exports"
          />
          <p className="text-[11px] text-slate-400 mt-3">286 exports remaining</p>
        </Card>
      </div>

      {/* Usage Ledger Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Immutable Usage Ledger</h2>
          <span className="text-xs text-slate-400">All compute events logged with cryptographic precision</span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 font-semibold text-slate-600 dark:text-zinc-400">
              <tr>
                <th className="p-3.5 pl-4">Ledger ID</th>
                <th className="p-3.5">Activity Type</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Associated Project</th>
                <th className="p-3.5">Job ID</th>
                <th className="p-3.5 text-right pr-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300 font-mono text-[11px]">
              {ledgerEntries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="p-3.5 pl-4 font-semibold text-slate-900 dark:text-zinc-100 font-sans">
                    {e.id}
                  </td>
                  <td className="p-3.5">
                    <span className="rounded bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-[#635BFF]">
                      {e.type}
                    </span>
                  </td>
                  <td className="p-3.5 text-red-500 font-bold">{e.amount}</td>
                  <td className="p-3.5 font-sans">{e.project}</td>
                  <td className="p-3.5 text-slate-400">{e.jobId}</td>
                  <td className="p-3.5 text-right pr-4 text-slate-400 font-sans">{e.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

