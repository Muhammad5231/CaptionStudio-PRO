'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DashboardSidebar, SIDEBAR_NAV, SIDEBAR_BOTTOM_NAV } from '@/components/dashboard/sidebar';
import { DashboardTopbar } from '@/components/dashboard/topbar';
import { CommandMenu } from '@/components/dashboard/command-menu';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-[#09090B]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#635BFF]" />
          <p className="text-xs text-slate-500 dark:text-zinc-400">Loading CaptionStudio workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#09090B]">
      {/* Desktop Sidebar */}
      <DashboardSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col justify-between w-72 bg-white dark:bg-[#111113] border-r border-slate-200 dark:border-zinc-800 p-4 z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 font-bold text-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#635BFF] text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span>CaptionStudio PRO</span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-4 space-y-1">
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
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#635BFF] text-white'
                          : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-1">
              {SIDEBAR_BOTTOM_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardTopbar onOpenMobileNav={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Global Command Menu Dialog */}
      <CommandMenu />
    </div>
  );
}

