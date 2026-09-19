'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, UsageMeter, Button, EmptyState } from '@captionstudio/ui';
import { ArrowUpRight, Loader2, FileText } from 'lucide-react';
import { api } from '@/lib/api-client';

interface UsageData {
  tier?: string;
  planTier?: string;
  transcriptionMinutesTotal: number;
  transcriptionMinutesUsed: number;
  renderMinutesTotal: number;
  renderMinutesUsed: number;
  storageBytesTotal: number;
  storageBytesUsed: number;
  exportsTotal: number;
  exportsUsed: number;
  periodStart?: string;
  periodEnd?: string;
}

interface LedgerRecord {
  id: string;
  userId: string;
  workspaceId: string;
  type: string;
  amount: number;
  projectId?: string | null;
  jobId?: string | null;
  eventKey?: string | null;
  createdAt: string;
}

export default function UsagePage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const [usageRes, ledgerRes] = await Promise.all([
          api.get<{ success: boolean; data: UsageData }>('/usage'),
          api.get<{ success: boolean; data: { entries: LedgerRecord[]; total: number } }>('/usage/ledger'),
        ]);

        if (usageRes.data) {
          setUsage(usageRes.data);
        }
        if (ledgerRes.data?.entries) {
          setLedgerEntries(ledgerRes.data.entries);
        }
      } catch (err) {
        console.error('Failed to load usage data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsage();
  }, []);

  const formatAmount = (type: string, amount: number) => {
    switch (type) {
      case 'TRANSCRIPTION_MINUTES':
      case 'RENDER_MINUTES':
        return `- ${amount.toFixed(2)} mins`;
      case 'STORAGE_BYTES':
        return `${(amount / (1024 * 1024)).toFixed(2)} MB`;
      case 'EXPORTS_COUNT':
        return `- ${amount} export${amount === 1 ? '' : 's'}`;
      default:
        return `- ${amount}`;
    }
  };

  const periodEndFormatted = usage?.periodEnd
    ? new Date(usage.periodEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : null;

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
            Manage Plan
          </Button>
        </Link>
      </div>

      {/* 4 Usage Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <UsageMeter
            label="Transcription Quota"
            current={usage ? Math.round(usage.transcriptionMinutesUsed * 10) / 10 : 0}
            max={usage ? usage.transcriptionMinutesTotal : 0}
            unit="mins"
          />
          <p className="text-[11px] text-slate-400 mt-3">
            {isLoading
              ? 'Loading quota...'
              : usage
              ? `${Math.max(0, usage.transcriptionMinutesTotal - usage.transcriptionMinutesUsed).toFixed(1)} mins remaining${
                  periodEndFormatted ? ` until reset on ${periodEndFormatted}` : ''
                }`
              : 'Usage unavailable'}
          </p>
        </Card>

        <Card>
          <UsageMeter
            label="Studio Rendering"
            current={usage ? Math.round(usage.renderMinutesUsed * 10) / 10 : 0}
            max={usage ? usage.renderMinutesTotal : 0}
            unit="mins"
          />
          <p className="text-[11px] text-slate-400 mt-3">
            {isLoading
              ? 'Loading quota...'
              : usage
              ? `${Math.max(0, usage.renderMinutesTotal - usage.renderMinutesUsed).toFixed(1)} render mins remaining`
              : 'Usage unavailable'}
          </p>
        </Card>

        <Card>
          <UsageMeter
            label="Cloud Storage"
            current={usage ? Number((usage.storageBytesUsed / (1024 * 1024 * 1024)).toFixed(1)) : 0}
            max={usage ? Number((usage.storageBytesTotal / (1024 * 1024 * 1024)).toFixed(1)) : 0}
            unit="GB"
          />
          <p className="text-[11px] text-slate-400 mt-3">
            {isLoading
              ? 'Loading quota...'
              : usage
              ? `${Math.max(
                  0,
                  (usage.storageBytesTotal - usage.storageBytesUsed) / (1024 * 1024 * 1024)
                ).toFixed(1)} GB available`
              : 'Usage unavailable'}
          </p>
        </Card>

        <Card>
          <UsageMeter
            label="Monthly Exports"
            current={usage ? usage.exportsUsed : 0}
            max={usage ? usage.exportsTotal : 0}
            unit="exports"
          />
          <p className="text-[11px] text-slate-400 mt-3">
            {isLoading
              ? 'Loading quota...'
              : usage
              ? `${Math.max(0, usage.exportsTotal - usage.exportsUsed)} exports remaining`
              : 'Usage unavailable'}
          </p>
        </Card>
      </div>

      {/* Usage Ledger Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Immutable Usage Ledger</h2>
          <span className="text-xs text-slate-400">All compute events logged with cryptographic precision</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
            <Loader2 className="h-6 w-6 animate-spin text-[#635BFF]" />
          </div>
        ) : ledgerEntries.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-8 text-center">
            <EmptyState
              icon={<FileText className="h-8 w-8 text-slate-400" />}
              title="No usage recorded yet"
              description="When you transcribe audio, render subtitles, or export media, consumption events will be recorded here."
            />
          </div>
        ) : (
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
                    <td className="p-3.5 text-red-500 font-bold">{formatAmount(e.type, e.amount)}</td>
                    <td className="p-3.5 font-sans">{e.projectId || '—'}</td>
                    <td className="p-3.5 text-slate-400">{e.jobId || '—'}</td>
                    <td className="p-3.5 text-right pr-4 text-slate-400 font-sans">
                      {new Date(e.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
