'use client';

import React from 'react';
import { Card, Badge } from '@captionstudio/ui';
import { CheckCircle2, HardDrive, Cpu, Film, Sparkles } from 'lucide-react';

export default function BillingSettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      {/* Current Plan Overview */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Local Development Mode</h2>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Running locally with SQLite database and local filesystem media storage. All studio features are fully unlocked.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-slate-400 text-[11px]">Local Transcription</p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Unlimited (Whisper)</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Rendering Engine</p>
            <p className="font-bold text-[#635BFF] mt-0.5">FFmpeg Local</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Media Storage</p>
            <p className="font-bold text-slate-900 dark:text-zinc-100 mt-0.5">./uploads (Disk)</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Export Watermark</p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Removed</p>
          </div>
        </div>
      </Card>

      {/* Local Infrastructure Information */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Local Architecture</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Overview of currently configured local services and runtime storage.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30">
            <HardDrive className="h-5 w-5 text-[#635BFF] shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-zinc-100">SQLite Database</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">data/captionstudio.db</p>
            </div>
            <div className="ml-auto">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30">
            <Cpu className="h-5 w-5 text-[#635BFF] shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-zinc-100">Speech-to-Text</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Local Whisper CLI / faster-whisper</p>
            </div>
            <div className="ml-auto">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30">
            <Film className="h-5 w-5 text-[#635BFF] shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-zinc-100">Video Processing</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">FFmpeg 7.1.1 + FFprobe</p>
            </div>
            <div className="ml-auto">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
