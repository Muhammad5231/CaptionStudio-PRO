'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Video,
  Layers,
  Palette,
  HardDrive,
  BarChart2,
  CreditCard,
  Settings,
  HelpCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
} from 'lucide-react';

export const SIDEBAR_NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: Video },
  { label: 'Templates', href: '/templates', icon: Layers },
  { label: 'Brand Kit', href: '/brand-kit', icon: Palette },
  { label: 'Exports', href: '/exports', icon: HardDrive },
  { label: 'Usage', href: '/usage', icon: BarChart2 },
  { label: 'Billing', href: '/settings/billing', icon: CreditCard },
];

export const SIDEBAR_BOTTOM_NAV = [
  { label: 'Admin Panel', href: '/admin', icon: Shield, adminOnly: true },
  { label: 'Settings', href: '/settings/profile', icon: Settings },
  { label: 'Help & Docs', href: '/help', icon: HelpCircle },
];

export function DashboardSidebar({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`hidden md:flex flex-col justify-between border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      } shrink-0 select-none z-30`}
    >
      {/* Top Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200 dark:border-zinc-800">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-sm tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#635BFF] text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-slate-900 dark:text-zinc-50">
                CaptionStudio <span className="text-[#635BFF]">PRO</span>
              </span>
            </Link>
          )}

          {isCollapsed && (
            <Link href="/dashboard" className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-[#635BFF] text-white">
              <Sparkles className="h-4 w-4" />
            </Link>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 ${
              isCollapsed ? 'hidden' : 'block'
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="p-3 space-y-1">
          {SIDEBAR_NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#635BFF] text-white shadow-sm shadow-[#635BFF]/20'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-100'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Nav & User Profile */}
      <div className="p-3 border-t border-slate-200 dark:border-zinc-800 space-y-1">
        {SIDEBAR_BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-100 dark:bg-zinc-800 text-[#635BFF]'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/60 hover:text-slate-900 dark:hover:text-zinc-100'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Collapsed Toggle Button when collapsed */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* User preview */}
        {!isCollapsed && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-full bg-[#635BFF]/20 text-[#635BFF] flex items-center justify-center font-bold text-xs shrink-0">
                AR
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">Alex Rivera</p>
                <p className="text-[11px] text-slate-400 truncate">Pro Studio Plan</p>
              </div>
            </div>
            <Link
              href="/login"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

