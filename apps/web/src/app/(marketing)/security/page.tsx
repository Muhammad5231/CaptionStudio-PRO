import React from 'react';
import { ShieldCheck, Lock, KeyRound, Server } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Trust & Safety</h1>
          <p className="mt-2 text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            Enterprise-Grade Security Architecture
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            How CaptionStudio PRO protects your proprietary video assets, scripts, and authentication credentials.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
            <Lock className="h-6 w-6 text-[#635BFF] mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 mb-1">AES-256 Encryption</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              All raw video files, transcribed text, and rendered assets are encrypted both at rest via AES-256 and in transit via TLS 1.3.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
            <KeyRound className="h-6 w-6 text-emerald-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 mb-1">Signed Pre-Authenticated URLs</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Video media is never exposed through open public buckets. Temporary presigned download links expire after strict time windows.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
            <ShieldCheck className="h-6 w-6 text-amber-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 mb-1">Granular RBAC Policies</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Workspace role separation (Owner, Admin, Editor, Viewer) ensures team members only have permissions necessary for their tasks.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
            <Server className="h-6 w-6 text-purple-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-zinc-100 mb-1">Isolated Processing Workers</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
              Video transcoding and AI transcription jobs run in ephemeral sandboxed container environments that delete temporary work files upon job completion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

