'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Sparkles, ArrowRight, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

export function MarketingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-[#09090B]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#635BFF] text-white shadow-sm shadow-[#635BFF]/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-slate-900 dark:text-zinc-50">
            CaptionStudio <span className="text-[#635BFF]">PRO</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-zinc-400">
          <Link href="/features" className="hover:text-[#635BFF] dark:hover:text-zinc-100 transition-colors">
            Product
          </Link>
          <Link href="/how-it-works" className="hover:text-[#635BFF] dark:hover:text-zinc-100 transition-colors">
            How It Works
          </Link>
          <Link href="/templates" className="hover:text-[#635BFF] dark:hover:text-zinc-100 transition-colors">
            Templates
          </Link>
          <Link href="/pricing" className="hover:text-[#635BFF] dark:hover:text-zinc-100 transition-colors">
            Pricing
          </Link>
          <Link href="/resources" className="hover:text-[#635BFF] dark:hover:text-zinc-100 transition-colors">
            Resources
          </Link>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-lg p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
              <div className="h-4 w-4" />
            )}
          </button>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors px-3 py-2"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#635BFF] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#5248E6] transition-all"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-lg p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {mounted ? (
              theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
              <div className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 dark:text-zinc-300 hover:text-[#635BFF]"
          >
            Product Features
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 dark:text-zinc-300 hover:text-[#635BFF]"
          >
            How It Works
          </Link>
          <Link
            href="/templates"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 dark:text-zinc-300 hover:text-[#635BFF]"
          >
            Templates Gallery
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 dark:text-zinc-300 hover:text-[#635BFF]"
          >
            Pricing Plans
          </Link>
          <Link
            href="/resources"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 dark:text-zinc-300 hover:text-[#635BFF]"
          >
            Resources & Blog
          </Link>
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center w-full py-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 font-medium text-slate-700 dark:text-zinc-300"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center w-full py-2.5 rounded-lg bg-[#635BFF] text-white font-medium shadow-sm"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

