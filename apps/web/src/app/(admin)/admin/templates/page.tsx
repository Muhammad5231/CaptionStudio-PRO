'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Loader2 } from 'lucide-react';
import { Button, Badge } from '@captionstudio/ui';
import { api } from '@/lib/api-client';

interface AdminTemplate {
  id: string;
  slug: string;
  name: string;
  category: string;
  isPublished: boolean;
  isPremium: boolean;
  downloads: number;
  likes: number;
  createdAt: string;
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: AdminTemplate[] }>('/admin/templates');
      if (res.data) {
        setTemplates(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const togglePublish = async (id: string, currentPublished: boolean) => {
    setTogglingId(id);
    try {
      await api.patch(`/admin/templates/${id}`, { isPublished: !currentPublished });
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isPublished: !currentPublished } : t))
      );
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update template.');
    } finally {
      setTogglingId(null);
    }
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
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-red-600" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-500 dark:text-zinc-400">
            No templates registered in database.
          </div>
        ) : (
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
                    <button
                      onClick={() => togglePublish(t.id, t.isPublished)}
                      disabled={togglingId === t.id}
                      className="text-xs font-semibold text-[#635BFF] hover:underline"
                    >
                      {togglingId === t.id ? (
                        <Loader2 className="h-3 w-3 animate-spin inline" />
                      ) : t.isPublished ? (
                        'Unpublish'
                      ) : (
                        'Publish'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
