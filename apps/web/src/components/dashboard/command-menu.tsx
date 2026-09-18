'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  Search,
  Plus,
  Video,
  Layers,
  Palette,
  HardDrive,
  CreditCard,
  Settings,
  Sun,
  Moon,
  Shield,
  X,
} from 'lucide-react';

export function CommandMenu() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const navigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setIsOpen(false);
  };

  const commands = [
    { label: 'Create New Project', icon: Plus, action: () => navigate('/projects?new=true'), category: 'Actions' },
    { label: 'Browse Projects', icon: Video, action: () => navigate('/projects'), category: 'Navigation' },
    { label: 'Explore Templates', icon: Layers, action: () => navigate('/templates'), category: 'Navigation' },
    { label: 'Open Brand Kit', icon: Palette, action: () => navigate('/brand-kit'), category: 'Navigation' },
    { label: 'View Exports', icon: HardDrive, action: () => navigate('/exports'), category: 'Navigation' },
    { label: 'Billing & Subscriptions', icon: CreditCard, action: () => navigate('/settings/billing'), category: 'Settings' },
    { label: 'Account Settings', icon: Settings, action: () => navigate('/settings/profile'), category: 'Settings' },
    { label: 'Admin Control Center', icon: Shield, action: () => navigate('/admin'), category: 'Admin' },
    { label: 'Toggle Light/Dark Theme', icon: theme === 'dark' ? Sun : Moon, action: toggleTheme, category: 'Preferences' },
  ];

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] shadow-2xl overflow-hidden z-10">
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-zinc-800">
          <Search className="h-4 w-4 text-slate-400 dark:text-zinc-500 shrink-0" />
          <input
            type="text"
            placeholder="Type a command or search..."
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-12 px-3 bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block rounded bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-zinc-400">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-xs text-slate-500 dark:text-zinc-400">No commands found.</p>
          ) : (
            filtered.map((c, idx) => {
              const Icon = c.icon;
              return (
                <button
                  key={idx}
                  onClick={c.action}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/80 hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                    <span>{c.label}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {c.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

