import React from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-[#09090B]">
      {/* Left Form Area */}
      <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-12 lg:p-16">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#635BFF] text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-slate-900 dark:text-zinc-50">
              CaptionStudio <span className="text-[#635BFF]">PRO</span>
            </span>
          </Link>
        </div>

        <div className="my-auto py-8 max-w-md w-full mx-auto">{children}</div>

        <div className="text-xs text-slate-500 dark:text-zinc-500">
          © {new Date().getFullYear()} CaptionStudio PRO. All rights reserved.
        </div>
      </div>

      {/* Right Brand Showcase Area */}
      <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-16 bg-gradient-to-tr from-slate-950 via-zinc-900 to-indigo-950 text-white border-l border-zinc-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(99,91,255,0.25),transparent)]" />
        <div className="relative z-10" />

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
            <span>Powering over 140,000 captioned videos</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
            "CaptionStudio PRO transformed our video retention. Average view duration doubled across all our client accounts."
          </h2>
          <div className="pt-2">
            <p className="font-semibold text-white">Marcus Brody</p>
            <p className="text-xs text-zinc-400">Head of Production at Brody Media Group</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>99.2% Whisper Accuracy</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Sub-frame Word Timing</span>
          </div>
        </div>
      </div>
    </div>
  );
}

