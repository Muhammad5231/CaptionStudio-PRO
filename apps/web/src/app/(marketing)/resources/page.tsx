import React from 'react';
import Link from 'next/link';
import { BookOpen, Video, FileText, ArrowRight } from 'lucide-react';

export default function ResourcesPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-xs font-semibold uppercase tracking-wider text-[#635BFF]">Creator Hub</h1>
          <p className="mt-2 text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            Guides, Tutorials & Best Practices
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            Master the art of short-form retention, subtitle typography, and audio synchronization.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#635BFF]/10 text-[#635BFF] mb-6">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Subtitle Psychology 101</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              Why 85% of social media feeds are watched on mute, and how animated captions lift average view duration by up to 240%.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-6">
              <Video className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Shorts & Reels Formatting</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              Safe zones, typography sizes, and positioning rules so subtitles don't get covered by platform UI buttons.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-6">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">SRT vs ASS vs WebVTT</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
              A comprehensive technical guide to subtitle formats, styling tags, and subtitle burning in video production pipelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

