'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Button, Badge } from '@captionstudio/ui';
import { Check, CreditCard, Download, ArrowUpRight } from 'lucide-react';

export default function BillingSettingsPage() {
  const invoices = [
    { id: 'INV-2026-009', date: 'Sep 18, 2026', amount: '$39.00', status: 'Paid' },
    { id: 'INV-2026-008', date: 'Aug 18, 2026', amount: '$39.00', status: 'Paid' },
    { id: 'INV-2026-007', date: 'Jul 18, 2026', amount: '$39.00', status: 'Paid' },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Current Plan Overview */}
      <Card className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">Pro Studio Plan</h2>
              <Badge variant="success">Active</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
              Billed monthly at $39.00/month. Next billing date is October 18, 2026.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              Cancel Plan
            </Button>
            <Link href="/pricing">
              <Button size="sm" rightIcon={<ArrowUpRight className="h-4 w-4" />}>
                Change Plan
              </Button>
            </Link>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-slate-400 text-[11px]">Monthly Transcribe</p>
            <p className="font-bold text-slate-900 dark:text-zinc-100 mt-0.5">500 Mins</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Export Quality</p>
            <p className="font-bold text-[#635BFF] mt-0.5">4K 60 FPS</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Cloud Storage</p>
            <p className="font-bold text-slate-900 dark:text-zinc-100 mt-0.5">100 GB</p>
          </div>
          <div>
            <p className="text-slate-400 text-[11px]">Team Collaboration</p>
            <p className="font-bold text-slate-900 dark:text-zinc-100 mt-0.5">3 Members</p>
          </div>
        </div>
      </Card>

      {/* Payment Method */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Payment Method</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Card used for your recurring monthly subscription.
            </p>
          </div>
          <Button variant="outline" size="sm">
            Update Card
          </Button>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 text-xs">
          <CreditCard className="h-5 w-5 text-[#635BFF]" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-zinc-100">Visa ending in 4242</p>
            <p className="text-[11px] text-slate-400">Expires 08/2028</p>
          </div>
        </div>
      </Card>

      {/* Invoice History */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Invoice History</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Download PDF receipts for your accounting and tax records.
          </p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
          {invoices.map((inv) => (
            <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-semibold text-slate-900 dark:text-zinc-100">{inv.id}</p>
                <p className="text-[11px] text-slate-400">{inv.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-slate-900 dark:text-zinc-100">{inv.amount}</span>
                <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                  {inv.status}
                </span>
                <button
                  onClick={() => alert('Downloading PDF invoice...')}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  title="Download Invoice"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

