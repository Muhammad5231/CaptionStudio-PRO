'use client';

import React, { useState } from 'react';
import { Plus, Check, Eye, Trash2, Edit3 } from 'lucide-react';
import { Button, Badge } from '@captionstudio/ui';

interface AdminTemplate {
  id: string;
  slug: string;
  name: string;
  category: string;
  isPublished: boolean;
  isPremium: boolean;
  downloads: number;
}

const INITIAL_TEMPLATES: AdminTemplate[] = [
  { id: 't-1', slug: 'beast-kinetic-yellow', name: 'Beast Kinetic Yellow', category: 'TRENDING', isPublished: true, isPremium: false, downloads: 14200 },
  { id: 't-2', slug: 'hormozi-emerald', name: 'Hormozi Emerald Karaoke', category: 'PODCAST', isPublished: true, isPremium: true, downloads: 22400 },
  { id: 't-3', slug: 'nordic-clean-sub', name: 'Nordic Clean Subtitle', category: 'MINIMAL', isPublished: true, isPremium: false, downloads: 8900 },
  { id: 't-4', slug: 'cannes-cinema-gold', name: 'Cannes Classic Cinema', category: 'CINEMATIC', isPublished: true, isPremium: false, downloads: 6100 },
  { id: 't-5', slug: 'neon-cyber-pulse', name: 'Neon Cyber Pulse', category: 'GAMING', isPublished: false, isPremium: true, downloads: 11300 },
];

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<AdminTemplate[]>(INITIAL_TEMPLATES);

  const togglePublish = (id: string) => {
    setTemplates(
      templates.map((t) => (t.id === id ? { ...t, isPublished: !t.isPublished } : t))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Global Template Registry</h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            Publish, edit JSON style payloads, and curate featured subtitle templates for the creator ecosystem.
          </p>
        </div>

        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
          Register New Template
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 font-semibold text-slate-600 dark:text-zinc-400">
            <tr>
              <th className="p-3.5 pl-4">Template Name</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Tier</th>
              <th className="p-3.5">Downloads</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-slate-700 dark:text-zinc-300">
            {templates.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors">
                <td className="p-3.5 pl-4 font-semibold text-slate-900 dark:text-zinc-100">
                  {t.name}
                  <span className="block font-mono text-[10px] text-slate-400">{t.slug}</span>
                </td>
                <td className="p-3.5">
                  <span className="rounded bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-zinc-400">
                    {t.category}
                  </span>
                </td>
                <td className="p-3.5">
                  <Badge variant={t.isPremium ? 'brand' : 'neutral'}>
                    {t.isPremium ? 'PRO' : 'FREE'}
                  </Badge>
                </td>
                <td className="p-3.5 font-mono text-[11px]">{t.downloads.toLocaleString()}</td>
                <td className="p-3.5">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                      t.isPublished ? 'text-emerald-500' : 'text-slate-400'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${t.isPublished ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span>{t.isPublished ? 'Published' : 'Draft'}</span>
                  </span>
                </td>
                <td className="p-3.5 text-right pr-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => togglePublish(t.id)}
                      className="text-xs font-semibold text-[#635BFF] hover:underline"
                    >
                      {t.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

