'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Sparkles, Heart, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  'ALL',
  'TRENDING',
  'MINIMAL',
  'BOLD',
  'PODCAST',
  'GAMING',
  'BUSINESS',
  'SHORTS',
  'CINEMATIC',
  'KARAOKE',
];

const TEMPLATES = [
  {
    id: 'tpl-1',
    slug: 'beast-kinetic-yellow',
    name: 'Beast Kinetic Yellow',
    category: 'TRENDING',
    isPremium: false,
    text: 'HOOK VIEWERS IN 2 SECONDS!',
    highlight: 'HOOK VIEWERS',
    fontStyle: 'font-black uppercase text-xl',
    containerStyle: 'bg-black/90 text-white',
    activeHighlightStyle: 'text-yellow-400 scale-105 inline-block',
    tags: ['viral', 'shorts', 'youtube'],
  },
  {
    id: 'tpl-2',
    slug: 'hormozi-emerald',
    name: 'Hormozi Emerald Karaoke',
    category: 'PODCAST',
    isPremium: true,
    text: 'SCALE YOUR COMPANY TO EIGHT FIGURES',
    highlight: 'EIGHT FIGURES',
    fontStyle: 'font-extrabold uppercase text-lg',
    containerStyle: 'bg-zinc-950 text-slate-100',
    activeHighlightStyle: 'text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40 inline-block',
    tags: ['podcast', 'business', 'talking-head'],
  },
  {
    id: 'tpl-3',
    slug: 'nordic-clean-sub',
    name: 'Nordic Clean Subtitle',
    category: 'MINIMAL',
    isPremium: false,
    text: 'Good design is as little design as possible.',
    highlight: 'little design',
    fontStyle: 'font-medium text-sm',
    containerStyle: 'bg-zinc-900 text-white',
    activeHighlightStyle: 'text-white font-bold underline decoration-slate-400',
    tags: ['documentary', 'minimal', 'clean'],
  },
  {
    id: 'tpl-4',
    slug: 'cannes-cinema-gold',
    name: 'Cannes Classic Cinema',
    category: 'CINEMATIC',
    isPremium: false,
    text: 'In the end, we only regret the chances we did not take.',
    highlight: 'chances',
    fontStyle: 'font-serif font-semibold text-base italic',
    containerStyle: 'bg-black text-[#FEF08A] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]',
    activeHighlightStyle: 'text-[#FEF08A] font-bold',
    tags: ['cinema', 'film', 'golden'],
  },
  {
    id: 'tpl-5',
    slug: 'neon-cyber-pulse',
    name: 'Neon Cyber Pulse',
    category: 'GAMING',
    isPremium: true,
    text: 'INSANE 1v5 CLUTCH WITH ZERO SECONDS!',
    highlight: '1v5 CLUTCH',
    fontStyle: 'font-mono font-black uppercase text-lg',
    containerStyle: 'bg-[#0b0817] text-white',
    activeHighlightStyle: 'text-[#C4B5FD] drop-shadow-[0_0_12px_rgba(167,139,250,1)] scale-110 inline-block',
    tags: ['gaming', 'streamer', 'twitch'],
  },
  {
    id: 'tpl-6',
    slug: 'executive-studio-white',
    name: 'Executive Studio White',
    category: 'BUSINESS',
    isPremium: false,
    text: 'Revenue grew forty percent year over year.',
    highlight: 'forty percent',
    fontStyle: 'font-sans font-semibold text-sm',
    containerStyle: 'bg-slate-900 text-slate-100',
    activeHighlightStyle: 'bg-white text-slate-950 px-2 py-0.5 rounded font-bold inline-block',
    tags: ['business', 'conference', 'saas'],
  },
];

export default function TemplatesPage() {
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = TEMPLATES.filter((t) => {
    const matchesCat = selectedCat === 'ALL' || t.category === selectedCat;
    const matchesQuery =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-xs font-semibold uppercase tracking-wider text-[#635BFF]">Template Library</h1>
          <p className="mt-2 text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            Curated styles for viral retention.
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            Browse our hand-crafted collection of typography presets and animations.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search templates or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  selectedCat === cat
                    ? 'bg-[#635BFF] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-zinc-800/60 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tpl) => (
            <div
              key={tpl.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] overflow-hidden shadow-sm hover:border-[#635BFF]/50 hover:shadow-lg transition-all"
            >
              {/* Animated Preview Canvas */}
              <div
                className={`relative aspect-[16/10] w-full p-6 flex items-center justify-center text-center ${tpl.containerStyle}`}
              >
                {tpl.isPremium && (
                  <span className="absolute top-3 left-3 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-950 shadow-sm">
                    Pro
                  </span>
                )}
                <button className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-400 hover:text-red-400 bg-black/30 hover:bg-black/50 transition-colors">
                  <Heart className="h-4 w-4" />
                </button>

                <div className={tpl.fontStyle}>
                  {tpl.text.split(tpl.highlight)[0]}
                  <span className={tpl.activeHighlightStyle}>{tpl.highlight}</span>
                  {tpl.text.split(tpl.highlight)[1]}
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-zinc-100 text-base group-hover:text-[#635BFF] transition-colors">
                      {tpl.name}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {tpl.category}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tpl.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-zinc-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <Link
                    href={`/templates/${tpl.slug}`}
                    className="text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-[#635BFF] transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/signup?template=${tpl.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#635BFF] hover:text-[#5248E6]"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

