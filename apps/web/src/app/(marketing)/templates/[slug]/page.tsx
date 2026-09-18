import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles, Check, Heart, Play } from 'lucide-react';

export default function TemplateDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const name = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/templates"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Templates</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Preview Box */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-black aspect-[9/16] max-w-sm mx-auto p-8 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-2xl">
              <div className="font-black uppercase text-2xl text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                THIS IS HOW YOU HOOK <span className="text-yellow-400 scale-110 inline-block">EVERY VIEWER</span> IN SECONDS!
              </div>
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-zinc-800">
                <span>60 FPS Preview</span>
                <span className="font-mono">1080x1920</span>
              </div>
            </div>
          </div>

          {/* Details & Config info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#635BFF]/10 text-[#635BFF] px-2.5 py-0.5 text-xs font-bold uppercase mb-3">
                <Sparkles className="h-3 w-3" />
                <span>Trending Style</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-zinc-50">{name}</h1>
              <p className="mt-3 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Engineered for maximum retention on short-form feeds. Features punchy sans-serif typography, high-contrast black strokes, and kinetic word pop animations.
              </p>
            </div>

            <div className="space-y-3 border-t border-slate-200 dark:border-zinc-800 pt-6 text-xs text-slate-700 dark:text-zinc-300">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-zinc-400">Font Family</span>
                <span className="font-semibold">Montserrat Black</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-zinc-400">Animation Style</span>
                <span className="font-semibold">Kinetic Pop + Spring In</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-zinc-400">Recommended For</span>
                <span className="font-semibold">Shorts, Reels, TikTok, Gaming</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-zinc-400">Position Preset</span>
                <span className="font-semibold">Center Middle / 60%</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Link
                href={`/signup?template=${slug}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#635BFF] px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[#5248E6] transition-all"
              >
                <span>Use This Template</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-3 text-sm font-medium text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Save to Favorites</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

