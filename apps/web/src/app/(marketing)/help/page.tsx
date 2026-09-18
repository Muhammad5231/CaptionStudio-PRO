import React from 'react';
import Link from 'next/link';
import { HelpCircle, Search, MessageSquare, LifeBuoy, FileQuestion } from 'lucide-react';

export default function HelpCenterPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-xs font-semibold uppercase tracking-wider text-[#635BFF]">Support Center</h1>
          <p className="mt-2 text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            How can we help you?
          </p>
          <div className="mt-8 relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search guides, billing questions, or troubleshooting..."
              className="w-full h-12 pl-12 pr-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-8 shadow-sm">
            <LifeBuoy className="h-8 w-8 text-[#635BFF] mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Getting Started</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">Account setup, uploading videos, and exporting your first captioned clip.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-8 shadow-sm">
            <FileQuestion className="h-8 w-8 text-amber-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Billing & Subscriptions</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">Managing plans, updating credit cards, invoice history, and refunds.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-8 shadow-sm">
            <MessageSquare className="h-8 w-8 text-emerald-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Direct Support</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">Speak directly with our technical support team via email or live chat.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

