import React from 'react';
import { Mail, MessageCircle, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-xs font-semibold uppercase tracking-wider text-[#635BFF]">Get In Touch</h1>
          <p className="mt-2 text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-zinc-50 tracking-tight">
            We’d love to hear from you
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-zinc-400">
            Have a question about enterprise volume, custom styling, or technical issues? Let us know.
          </p>
        </div>

        <div className="mt-16 max-w-xl mx-auto rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#111113] p-8 shadow-sm">
          <form className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-zinc-300">Name</label>
              <input
                type="text"
                placeholder="Alex Rivera"
                className="mt-1.5 w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-[#635BFF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-zinc-300">Email Address</label>
              <input
                type="email"
                placeholder="alex@example.com"
                className="mt-1.5 w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-[#635BFF] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-zinc-300">Message</label>
              <textarea
                rows={4}
                placeholder="How can our team help?"
                className="mt-1.5 w-full p-3 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:ring-2 focus:ring-[#635BFF] focus:outline-none"
              />
            </div>
            <button
              type="button"
              className="w-full h-10 rounded-lg bg-[#635BFF] text-white font-semibold text-sm hover:bg-[#5248E6] transition-all"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

