import React from 'react';
import Link from 'next/link';
import {
  Wand2,
  Clock,
  Layers,
  Sparkles,
  Zap,
  Sliders,
  Type,
  Palette,
  Video,
  Globe,
  Share2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Wand2,
    title: 'AI Speech-to-Text Transcription',
    description: 'Trained on over 680,000 hours of multi-accent speech with 99.2% accuracy. Auto-detects 90+ languages and accents.',
  },
  {
    icon: Clock,
    title: 'Word-Level Accurate Timestamps',
    description: 'Every individual word is assigned millisecond-accurate start and end points for pinpoint karaoke-style highlights.',
  },
  {
    icon: Layers,
    title: '50+ Trending Creator Templates',
    description: 'Authentic styles replicating MrBeast, Alex Hormozi, documentary films, gaming streams, and modern aesthetic reels.',
  },
  {
    icon: Sliders,
    title: 'Nonlinear Pro Timeline Editor',
    description: 'Split lines with hotkeys, merge phrases, tweak timings, and scrub at full 60 FPS without timeline lag.',
  },
  {
    icon: Palette,
    title: 'Brand Kit & Preset Manager',
    description: 'Save custom typography, hex colors, animated logos, and watermark positions to apply to future projects in 1-click.',
  },
  {
    icon: Video,
    title: 'Ultra-Fast 4K Studio Rendering',
    description: 'GPU-accelerated cloud rendering engines deliver crystal-clear 1080p and 4K MP4/MOV exports in seconds.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-xs font-semibold uppercase tracking-wider text-[#635BFF]">Product Capabilities</h1>
          <p className="mt-2 text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            Engineered for speed, precision, and retention.
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            Everything you need to turn raw speech into magnetic visual narratives.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-8 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-all"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#635BFF]/10 text-[#635BFF] mb-6">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="mt-20 rounded-2xl bg-gradient-to-r from-[#635BFF] to-[#818CF8] p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-2xl font-bold">Start captioning your videos now</h3>
            <p className="mt-1 text-sm text-indigo-100">Free starter plan includes 15 minutes of AI transcription every month.</p>
          </div>
          <Link
            href="/signup"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#635BFF] shadow-sm hover:bg-indigo-50 transition-all"
          >
            <span>Create Free Account</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

