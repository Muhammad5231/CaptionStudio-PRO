'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Search,
  Bell,
  Sun,
  Moon,
  Plus,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { SIDEBAR_NAV, SIDEBAR_BOTTOM_NAV } from './sidebar';

export function DashboardTopbar({
  onOpenMobileNav,
}: {
  onOpenMobileNav: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const notifications = [
    {
      id: 'n-1',
      title: 'Export Completed',
      message: 'Your video "The 3 Keys to Bootstrapping a SaaS" is ready to download.',
      time: '10m ago',
      read: false,
    },
    {
      id: 'n-2',
      title: 'Transcription Ready',
      message: 'AI Speech-to-Text finished 58.4s audio with 100% word timestamps.',
      time: '1h ago',
      read: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-[#111113]/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Nav Toggle & Search Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Command Menu Trigger Button */}
        <button
          onClick={() => {
            const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
            window.dispatchEvent(event);
          }}
          className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 px-3 py-1.5 text-xs text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors w-48 sm:w-72"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Search projects, templates...</span>
          <kbd className="ml-auto hidden sm:inline-block rounded bg-white dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono border border-slate-200 dark:border-zinc-700">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/projects?new=true"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#635BFF] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#5248E6] transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Project</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          title="Toggle Theme"
        >
          {mounted ? (
            theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
          ) : (
            <div className="h-4 w-4" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#635BFF]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-4 shadow-2xl z-50">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                  Notifications
                </span>
                <span className="text-[10px] text-[#635BFF] font-semibold cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 mt-2">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900 dark:text-zinc-200">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-slate-500 dark:text-zinc-400 text-[11px] leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <Link
          href="/settings/profile"
          className="h-8 w-8 rounded-full bg-[#635BFF]/20 text-[#635BFF] flex items-center justify-center font-bold text-xs ring-2 ring-transparent hover:ring-[#635BFF] transition-all"
        >
          AR
        </Link>
      </div>
    </header>
  );
}

