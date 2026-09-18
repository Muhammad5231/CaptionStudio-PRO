import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, Heart } from 'lucide-react';

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-[#09090B] text-slate-600 dark:text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#635BFF] text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-slate-900 dark:text-zinc-100">
                CaptionStudio <span className="text-[#635BFF]">PRO</span>
              </span>
            </Link>
            <p className="text-sm max-w-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              The next-generation video caption and subtitle creation suite. Designed for professional creators, video editors, and high-growth media teams.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-500 pt-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span>Enterprise SOC2 Type II & GDPR Compliant</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-zinc-200">
              Product
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/features" className="hover:text-[#635BFF] transition-colors">Features</Link></li>
              <li><Link href="/how-it-works" className="hover:text-[#635BFF] transition-colors">How It Works</Link></li>
              <li><Link href="/templates" className="hover:text-[#635BFF] transition-colors">Template Gallery</Link></li>
              <li><Link href="/pricing" className="hover:text-[#635BFF] transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-zinc-200">
              Resources
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/resources" className="hover:text-[#635BFF] transition-colors">Creator Guides</Link></li>
              <li><Link href="/blog" className="hover:text-[#635BFF] transition-colors">Blog</Link></li>
              <li><Link href="/help" className="hover:text-[#635BFF] transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-[#635BFF] transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Legal & Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-zinc-200">
              Legal & Trust
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-[#635BFF] transition-colors">About Us</Link></li>
              <li><Link href="/security" className="hover:text-[#635BFF] transition-colors">Security</Link></li>
              <li><Link href="/privacy" className="hover:text-[#635BFF] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#635BFF] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} CaptionStudio PRO, Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with precision for video storytellers worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}

