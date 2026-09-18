import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const title = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Articles</span>
        </Link>

        <header className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#635BFF]">Case Study & Analysis</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-zinc-50 leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-zinc-400 pt-2 border-b border-slate-200 dark:border-zinc-800 pb-6">
            <span>By Alex Rivera</span>
            <span>•</span>
            <span>September 14, 2026</span>
            <span>•</span>
            <span>5 min read</span>
          </div>
        </header>

        <div className="mt-8 prose dark:prose-invert prose-slate max-w-none text-slate-700 dark:text-zinc-300 leading-relaxed space-y-6 text-base">
          <p>
            When viewers scroll through TikTok, Instagram Reels, or YouTube Shorts, they make a subconscious decision within the first 1.5 seconds whether to keep watching or swipe away.
          </p>
          <p>
            Traditional static subtitles provide accessibility, but kinetic animated subtitles act as a visual metronome for the brain. By flashing the active word in a contrasting color exactly when spoken, you create micro-rewards that keep attention locked onto your content.
          </p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 pt-4">1. High-Contrast Typography</h2>
          <p>
            Avoid thin aesthetic fonts that get washed out on dynamic video backgrounds. Heavy weights like Montserrat Black or Plus Jakarta Sans 800 with a 3px to 4px black outline ensure readability on any backdrop.
          </p>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100 pt-4">2. Word Clumping Rules</h2>
          <p>
            Never display more than 3 to 4 words simultaneously on a 9:16 vertical video. When users have to read full multi-line paragraphs, their eyes leave the creator’s face, causing retention to drop abruptly.
          </p>
        </div>
      </div>
    </div>
  );
}

