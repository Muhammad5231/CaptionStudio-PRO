'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  Video,
  Activity,
  Layers,
  CreditCard,
  Settings,
  ArrowLeft,
  Sparkles,
  BarChart3,
  FileText,
} from 'lucide-react';

const ADMIN_NAV = [
  { label: 'Overview', href: '/admin', icon: BarChart3 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Background Jobs', href: '/admin/jobs', icon: Activity },
  { label: 'Templates', href: '/admin/templates', icon: Layers },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-[#09090B]">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                CaptionStudio Admin
              </p>
              <p className="text-[10px] text-red-500 font-semibold">Super Admin Console</p>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-zinc-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Studio App</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] px-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-600 dark:text-zinc-400">
              System Cluster Online (3 Redis Workers Active)
            </span>
          </div>
          <span className="text-xs font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full">
            Admin Auth Verified
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

