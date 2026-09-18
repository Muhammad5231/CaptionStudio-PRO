'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { PLAN_CONFIGS } from '@captionstudio/billing';
import { PlanTier } from '@captionstudio/types';

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('yearly');

  const plans = Object.values(PLAN_CONFIGS);

  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-xs font-semibold uppercase tracking-wider text-[#635BFF]">Pricing & Plans</h1>
          <p className="mt-2 text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            Transparent plans for every creative ambition.
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            Start free, upgrade as your channel grows. Switch or cancel at any time.
          </p>

          {/* Billing Interval Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 p-1.5">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-white dark:bg-[#111113] text-slate-900 dark:text-zinc-100 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                billingInterval === 'yearly'
                  ? 'bg-white dark:bg-[#111113] text-slate-900 dark:text-zinc-100 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((p) => {
            const isPro = p.tier === PlanTier.PRO;
            const price = billingInterval === 'yearly' ? p.yearlyPriceUsd : p.monthlyPriceUsd;

            return (
              <div
                key={p.tier}
                className={`relative flex flex-col justify-between rounded-2xl p-8 transition-all ${
                  isPro
                    ? 'border-2 border-[#635BFF] bg-white dark:bg-[#111113] shadow-xl shadow-[#635BFF]/10'
                    : 'border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] shadow-sm'
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#635BFF] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
                    {p.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100">{p.name}</h3>
                  <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 min-h-[32px]">{p.description}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-zinc-50">${price}</span>
                    <span className="text-xs text-slate-500 dark:text-zinc-400">/ month</span>
                  </div>
                  {billingInterval === 'yearly' && price > 0 && (
                    <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">Billed annually (${price * 12}/yr)</p>
                  )}

                  <ul className="mt-8 space-y-3 border-t border-slate-100 dark:border-zinc-800/80 pt-6 text-xs text-slate-700 dark:text-zinc-300">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800/80">
                  <Link
                    href={`/signup?plan=${p.tier.toLowerCase()}`}
                    className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                      isPro
                        ? 'bg-[#635BFF] text-white hover:bg-[#5248E6] shadow-md'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    <span>{p.ctaLabel}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix */}
        <div className="mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-zinc-100">Detailed Feature Comparison</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">Compare quotas, storage allocations, and team tools across tiers.</p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                <tr>
                  <th className="p-4">Feature / Quota</th>
                  <th className="p-4">Free Starter</th>
                  <th className="p-4">Creator</th>
                  <th className="p-4 text-[#635BFF]">Pro Studio</th>
                  <th className="p-4">Business</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs text-slate-600 dark:text-zinc-400">
                <tr>
                  <td className="p-4 font-medium text-slate-900 dark:text-zinc-100">Monthly AI Transcription</td>
                  <td className="p-4">15 mins</td>
                  <td className="p-4">120 mins</td>
                  <td className="p-4 font-semibold text-[#635BFF]">500 mins</td>
                  <td className="p-4">2,000 mins</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900 dark:text-zinc-100">Max Active Projects</td>
                  <td className="p-4">3</td>
                  <td className="p-4">20</td>
                  <td className="p-4 font-semibold text-[#635BFF]">100</td>
                  <td className="p-4">Unlimited (1,000)</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900 dark:text-zinc-100">Export Resolution</td>
                  <td className="p-4">720p 30 FPS</td>
                  <td className="p-4">1080p 60 FPS</td>
                  <td className="p-4 font-semibold text-[#635BFF]">4K 60 FPS</td>
                  <td className="p-4">4K 60 FPS HDR</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900 dark:text-zinc-100">Cloud Storage</td>
                  <td className="p-4">1 GB</td>
                  <td className="p-4">25 GB</td>
                  <td className="p-4 font-semibold text-[#635BFF]">100 GB</td>
                  <td className="p-4">500 GB</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900 dark:text-zinc-100">Watermark Removed</td>
                  <td className="p-4 text-slate-400">—</td>
                  <td className="p-4 text-emerald-500 font-bold">Yes</td>
                  <td className="p-4 text-emerald-500 font-bold">Yes</td>
                  <td className="p-4 text-emerald-500 font-bold">Yes</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900 dark:text-zinc-100">Brand Kit & Custom Fonts</td>
                  <td className="p-4 text-slate-400">—</td>
                  <td className="p-4 text-emerald-500 font-bold">Yes</td>
                  <td className="p-4 text-emerald-500 font-bold">Yes</td>
                  <td className="p-4 text-emerald-500 font-bold">Yes</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-slate-900 dark:text-zinc-100">Team Collaboration Seats</td>
                  <td className="p-4 text-slate-400">1</td>
                  <td className="p-4 text-slate-400">1</td>
                  <td className="p-4 font-semibold text-[#635BFF]">Up to 3 seats</td>
                  <td className="p-4">Unlimited seats</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing FAQ */}
        <div className="mt-24 max-w-3xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-zinc-100">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-6">
              <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">How is transcription usage calculated?</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Usage is measured by the actual audio duration of the uploaded media file, rounded to the nearest second. If you upload a 2-minute video, 2.0 minutes are deducted from your monthly quota.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-6">
              <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">Can I upgrade or downgrade midway through a month?</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Yes. When you upgrade, your new quota is unlocked immediately with prorated billing applied to your account.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-6">
              <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">Do unused transcription minutes roll over?</h4>
              <p className="mt-2 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Monthly quotas reset at the beginning of each billing cycle to ensure consistent high-priority processing power.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

