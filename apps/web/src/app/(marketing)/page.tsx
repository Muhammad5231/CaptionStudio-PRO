'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  Sliders,
  CheckCircle2,
  Layers,
  Wand2,
  Video,
  Zap,
  Clock,
  Shield,
  Palette,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

const DEMO_STYLES = [
  {
    id: 'beast',
    name: 'Beast Kinetic',
    styleClass: 'text-white font-black uppercase text-2xl sm:text-3xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]',
    highlightClass: 'text-[#FACC15] scale-110 inline-block transition-transform',
  },
  {
    id: 'hormozi',
    name: 'Emerald Karaoke',
    styleClass: 'text-slate-100 font-extrabold uppercase text-xl sm:text-2xl',
    highlightClass: 'text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 scale-105 inline-block',
  },
  {
    id: 'nordic',
    name: 'Nordic Clean',
    styleClass: 'text-white font-medium text-lg sm:text-xl bg-black/75 px-3 py-1 rounded-md backdrop-blur-sm',
    highlightClass: 'text-white font-bold',
  },
  {
    id: 'neon',
    name: 'Cyber Pulse',
    styleClass: 'text-white font-extrabold uppercase text-xl sm:text-2xl drop-shadow-[0_0_12px_rgba(167,139,250,0.9)]',
    highlightClass: 'text-[#C4B5FD] scale-115 inline-block',
  },
];

const WORDS = ['This', 'is', 'how', 'your', 'story', 'gets', 'attention.'];

export default function MarketingHomePage() {
  const [activeStyleIdx, setActiveStyleIdx] = useState(0);
  const [activeWordIdx, setActiveWordIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Word playback tick
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveWordIdx((prev) => (prev + 1) % WORDS.length);
    }, 450);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const currentStyle = DEMO_STYLES[activeStyleIdx];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ---------------------------------------------------------------------- */}
      {/* HERO SECTION */}
      {/* ---------------------------------------------------------------------- */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32 border-b border-slate-200 dark:border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,91,255,0.15),transparent)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#635BFF]/30 bg-[#635BFF]/10 px-3.5 py-1 text-xs font-semibold text-[#635BFF] mb-6 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Next-Gen Video Subtitle Platform</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-50 leading-[1.1]">
            Create captions that make videos{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#635BFF] via-[#818CF8] to-[#A78BFA]">
              impossible to ignore.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg sm:text-xl text-slate-600 dark:text-zinc-400 leading-relaxed">
            Generate, edit, style, animate, and export professional captions from your videos or subtitle files. Built for creators who refuse to publish boring videos.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#635BFF] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#635BFF]/25 hover:bg-[#5248E6] transition-all"
            >
              <span>Start Creating Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/templates"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-8 py-3.5 text-base font-semibold text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all"
            >
              <span>Explore Templates</span>
            </Link>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* INTERACTIVE PRODUCT DEMO */}
          {/* ------------------------------------------------------------------ */}
          <div className="mt-16 mx-auto max-w-4xl">
            <div className="relative rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-900 p-2 shadow-2xl shadow-black/40">
              {/* Studio Window Chrome */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-zinc-400">CaptionStudio PRO Editor — Preview Canvas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px]">4K 60 FPS</span>
                </div>
              </div>

              {/* Video Player Canvas */}
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#0d0d11] flex items-center justify-center">
                {/* Background ambient video placeholder */}
                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-950 via-zinc-900 to-indigo-950/40 opacity-90" />

                {/* Animated Captions Overlay */}
                <div className="relative z-10 text-center px-6 max-w-xl select-none">
                  <div className={currentStyle.styleClass}>
                    {WORDS.map((w, idx) => {
                      const isCurrent = idx === activeWordIdx;
                      return (
                        <span
                          key={idx}
                          className={`inline-block mx-1.5 transition-all duration-150 ${
                            isCurrent ? currentStyle.highlightClass : 'opacity-80'
                          }`}
                        >
                          {w}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Scrubber Bar */}
                <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10 text-xs text-white">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1 hover:text-[#635BFF] transition-colors"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <div className="flex-1 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#635BFF] transition-all duration-300"
                      style={{ width: `${((activeWordIdx + 1) / WORDS.length) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px]">00:0{activeWordIdx + 1}.24 / 00:03.00</span>
                </div>
              </div>

              {/* Style Switcher Bar */}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 p-2 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <span className="text-xs font-semibold text-zinc-400 pl-2">Switch Preset:</span>
                <div className="flex items-center gap-1.5">
                  {DEMO_STYLES.map((st, idx) => (
                    <button
                      key={st.id}
                      onClick={() => setActiveStyleIdx(idx)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                        activeStyleIdx === idx
                          ? 'bg-[#635BFF] text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                    >
                      {st.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* SOCIAL PROOF */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-12 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#111113]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Trusted by top creators, media agencies, and podcasters across 120+ countries
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all">
            <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-zinc-200">CREATOR HUB</span>
            <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-zinc-200">VIRALCAST</span>
            <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-zinc-200">TALKINGHEADS</span>
            <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-zinc-200">SHORTS AGENCY</span>
            <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-zinc-200">FILMCRAFT PRO</span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* HOW IT WORKS (3 SIMPLE STEPS) */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-24 border-b border-slate-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#635BFF]">Workflow</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-zinc-50">
              Captions made simple in three steps.
            </p>
            <p className="mt-4 text-base text-slate-600 dark:text-zinc-400">
              From raw footage to viral, engagement-boosting videos in under 60 seconds.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-8 shadow-sm">
              <span className="text-5xl font-black text-slate-200 dark:text-zinc-800">01</span>
              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-zinc-100">Upload Video or Subtitle</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Drop your MP4, MOV, or WEBM video, or import SRT, VTT, or ASS files. Whisper speech-to-text extracts every spoken word automatically.
              </p>
            </div>

            <div className="relative rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-8 shadow-sm">
              <span className="text-5xl font-black text-[#635BFF]/30">02</span>
              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-zinc-100">Pick Style & Animate</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Choose from 50+ viral creator presets (Hormozi, MrBeast, Cinematic). Customize colors, active word highlights, fonts, and kinetic bounces.
              </p>
            </div>

            <div className="relative rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-8 shadow-sm">
              <span className="text-5xl font-black text-emerald-500/30">03</span>
              <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-zinc-100">Preview & Studio Export</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Preview your animation at 60 FPS in real-time. Export crisp 1080p or 4K videos ready to publish directly to Shorts, TikTok, and YouTube.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* QUICK MODE VS PRO EDITOR */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-24 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-[#0c0c0e]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#635BFF]">Flexibility</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-zinc-50">
              Quick Mode or Pro Timeline Editor
            </p>
            <p className="mt-4 text-base text-slate-600 dark:text-zinc-400">
              Speed when you need it fast. Granular surgical control when every millisecond counts.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Mode */}
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-8 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 text-xs font-bold uppercase">
                <Zap className="h-4 w-4" />
                <span>Quick Mode — For Fast Turnaround</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">30-Second Viral Generator</h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Ideal for creators publishing multiple videos a day. Upload footage, pick a trending template, and get ready-to-share vertical clips immediately.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>One-click AI transcription</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Automated word-by-word highlight placement</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Instant social aspect ratio presets (9:16, 1:1, 16:9)</span>
                </div>
              </div>
            </div>

            {/* Pro Editor */}
            <div className="rounded-2xl border border-[#635BFF]/40 bg-white dark:bg-[#111113] p-8 space-y-6 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 h-24 w-24 bg-[#635BFF]/10 rounded-bl-full" />
              <div className="inline-flex items-center gap-2 rounded-lg bg-[#635BFF]/10 text-[#635BFF] px-3 py-1 text-xs font-bold uppercase">
                <Sliders className="h-4 w-4" />
                <span>Pro Editor — For Studio Video Editors</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Frame-Accurate Timeline Suite</h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Full-featured subtitle workstation. Adjust word timestamps, split and merge lines, fine-tune bezier curves, and curate multiple speaker styles.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 text-[#635BFF] shrink-0" />
                  <span>Word-level timing adjustments with millisecond snap</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 text-[#635BFF] shrink-0" />
                  <span>Split, merge, and regroup captions with hotkeys</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 text-[#635BFF] shrink-0" />
                  <span>Multi-speaker auto-detection & custom styling</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* PRICING PREVIEW TEASER */}
      {/* ---------------------------------------------------------------------- */}
      <section className="py-24 border-b border-slate-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#635BFF]">Simple Pricing</h2>
          <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-zinc-50">
            Fair, transparent plans for every scale
          </p>
          <p className="mt-4 text-base text-slate-600 dark:text-zinc-400 max-w-xl mx-auto">
            Start free, upgrade as your channel grows. No unexpected fees or hidden usage locks.
          </p>

          <div className="mt-12 flex justify-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-[#635BFF] px-8 py-3.5 text-base font-semibold text-white shadow-md hover:bg-[#5248E6] transition-all"
            >
              <span>View All Plans & Feature Comparison</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* FINAL CTA */}
      {/* ---------------------------------------------------------------------- */}
      <section className="relative overflow-hidden py-24 bg-slate-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_100%,rgba(99,91,255,0.3),transparent)]" />
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to give your videos a competitive edge?
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-base sm:text-lg">
            Join thousands of creators producing high-retention captioned videos with CaptionStudio PRO.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#635BFF] px-8 py-4 text-base font-semibold text-white shadow-xl hover:bg-[#5248E6] transition-all"
            >
              <span>Start Free Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-8 py-4 text-base font-semibold text-zinc-200 hover:bg-zinc-800 transition-all"
            >
              <span>Explore Plans</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

