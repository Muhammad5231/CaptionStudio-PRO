import React from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, User } from 'lucide-react';

const POSTS = [
  {
    slug: 'how-mrbeast-styles-captions',
    title: 'The Visual Anatomy of MrBeast Subtitles',
    excerpt: 'An in-depth breakdown of high-contrast yellow typography, kinetic spring pops, and viewer retention strategies.',
    author: 'Alex Rivera',
    date: 'Sep 12, 2026',
    category: 'Analysis',
  },
  {
    slug: 'whisper-ai-speech-accuracy',
    title: 'Benchmarking AI Speech-to-Text for Video Editors',
    excerpt: 'How word-level timestamp interpolation achieves sub-frame alignment without manual timeline dragging.',
    author: 'Elena Rostova',
    date: 'Sep 04, 2026',
    category: 'Engineering',
  },
  {
    slug: '5-caption-mistakes-killing-reach',
    title: '5 Caption Mistakes That Are Killing Your Short-Form Reach',
    excerpt: 'From overcrowded text chunks to terrible stroke contrast, avoid these common pitfalls on Reels and TikTok.',
    author: 'Marcus Brody',
    date: 'Aug 28, 2026',
    category: 'Growth',
  },
];

export default function BlogPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-xs font-semibold uppercase tracking-wider text-[#635BFF]">The Studio Blog</h1>
          <p className="mt-2 text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            Insights for Modern Video Creators
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            Product updates, engineering deep dives, and content strategy essays.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {POSTS.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-6 shadow-sm hover:border-[#635BFF]/50 transition-all"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#635BFF]">
                  {post.category}
                </span>
                <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-zinc-100">
                  <Link href={`/blog/${post.slug}`} className="hover:text-[#635BFF] transition-colors">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">{post.excerpt}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                <span>{post.date}</span>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 font-semibold text-[#635BFF] hover:underline"
                >
                  <span>Read Article</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

