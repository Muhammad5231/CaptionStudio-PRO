import React from 'react';
import Link from 'next/link';
import { Upload, Sparkles, Sliders, Download, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-xs font-semibold uppercase tracking-wider text-[#635BFF]">Workflow Deep Dive</h1>
          <p className="mt-2 text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            How CaptionStudio PRO Works
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            A frictionless workflow designed to save video creators 5+ hours every week.
          </p>
        </div>

        <div className="mt-16 space-y-16 max-w-4xl mx-auto">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-start gap-8 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#635BFF]/10 text-[#635BFF]">
              <Upload className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#635BFF]">Step 01</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Upload Video or Existing Subtitles</h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Drag and drop your video file (up to 4K resolution) or import standard subtitle formats including SRT, WebVTT, and ASS. Our system automatically processes your audio with high-throughput neural pipelines.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row items-start gap-8 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Step 02</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">AI Speech Recognition & Alignment</h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Our speech-to-text models extract every sentence and tag each word with its precise timestamp. Filler words can be automatically suppressed or retained based on your editorial preference.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-start gap-8 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Sliders className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Step 03</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Style, Animate, and Fine-Tune</h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Apply one of our 50+ templates or adjust font weight, letter spacing, stroke outlines, drop shadows, and active word animation pulses. Preview the result in real-time in the interactive player canvas.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col md:flex-row items-start gap-8 p-8 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
              <Download className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-500">Step 04</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Export & Publish Anywhere</h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Export hardcoded MP4 videos or download standalone SRT/VTT caption tracks. Published videos are optimized for maximum engagement across Instagram Reels, TikTok, YouTube Shorts, and LinkedIn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

