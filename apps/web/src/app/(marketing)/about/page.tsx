import React from 'react';
import Link from 'next/link';
import { Sparkles, Users, Target, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-xs font-semibold uppercase tracking-wider text-[#635BFF]">Our Mission</h1>
          <p className="mt-2 text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            Empowering the next billion visual storytellers.
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl mx-auto">
            CaptionStudio PRO was born out of frustration with clunky desktop editors and generic auto-caption apps that fail on word timing and typography.
          </p>
        </div>

        <div className="mt-16 space-y-8 text-slate-600 dark:text-zinc-300 leading-relaxed text-base">
          <p>
            We believe that sound-off video consumption should not mean zero engagement. By blending millisecond-accurate AI speech recognition with broadcast-grade typography presets, CaptionStudio PRO turns spoken words into an active retention hook.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
              <Target className="h-6 w-6 text-[#635BFF] mb-3" />
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 mb-1">Precision First</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Sub-frame word synchronization so animations feel natural and organic with human speech cadence.</p>
            </div>
            <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
              <Users className="h-6 w-6 text-emerald-500 mb-3" />
              <h3 className="font-bold text-slate-900 dark:text-zinc-100 mb-1">Built For Scale</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Designed to support solo TikTok creators up to multi-seat media production studios publishing hundreds of videos daily.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

