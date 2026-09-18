'use client';

import React, { useState } from 'react';
import { Card, Button } from '@captionstudio/ui';
import { Check } from 'lucide-react';

export default function NotificationsSettingsPage() {
  const [emailExportReady, setEmailExportReady] = useState(true);
  const [emailTranscribeFailed, setEmailTranscribeFailed] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);
  const [billingReceipts, setBillingReceipts] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <Card className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Notification Preferences</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Select which events trigger email and browser notifications.
        </p>
      </div>

      <div className="space-y-4 text-xs">
        <label className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 cursor-pointer">
          <div>
            <p className="font-semibold text-slate-900 dark:text-zinc-100">Video Export Ready</p>
            <p className="text-[11px] text-slate-400">Receive an email with direct download link when rendering finishes.</p>
          </div>
          <input
            type="checkbox"
            checked={emailExportReady}
            onChange={(e) => setEmailExportReady(e.target.checked)}
            className="mt-1 rounded text-[#635BFF] focus:ring-[#635BFF]"
          />
        </label>

        <label className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 cursor-pointer">
          <div>
            <p className="font-semibold text-slate-900 dark:text-zinc-100">Processing Failures</p>
            <p className="text-[11px] text-slate-400">Immediate alert if an audio stream or transcode job encounters an error.</p>
          </div>
          <input
            type="checkbox"
            checked={emailTranscribeFailed}
            onChange={(e) => setEmailTranscribeFailed(e.target.checked)}
            className="mt-1 rounded text-[#635BFF] focus:ring-[#635BFF]"
          />
        </label>

        <label className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 cursor-pointer">
          <div>
            <p className="font-semibold text-slate-900 dark:text-zinc-100">Monthly Billing & Receipts</p>
            <p className="text-[11px] text-slate-400">Automated invoices sent when subscription charges process.</p>
          </div>
          <input
            type="checkbox"
            checked={billingReceipts}
            onChange={(e) => setBillingReceipts(e.target.checked)}
            className="mt-1 rounded text-[#635BFF] focus:ring-[#635BFF]"
          />
        </label>

        <label className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 cursor-pointer">
          <div>
            <p className="font-semibold text-slate-900 dark:text-zinc-100">Product & Template Updates</p>
            <p className="text-[11px] text-slate-400">Bi-weekly digest of new trending styles and feature releases.</p>
          </div>
          <input
            type="checkbox"
            checked={productUpdates}
            onChange={(e) => setProductUpdates(e.target.checked)}
            className="mt-1 rounded text-[#635BFF] focus:ring-[#635BFF]"
          />
        </label>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex justify-end">
        <Button size="sm" onClick={handleSave}>
          {isSaved ? 'Preferences Saved' : 'Save Preferences'}
        </Button>
      </div>
    </Card>
  );
}

