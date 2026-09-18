'use client';

import React, { useState } from 'react';
import { Card, Input, Button } from '@captionstudio/ui';
import { Camera, Check } from 'lucide-react';

export default function ProfileSettingsPage() {
  const [name, setName] = useState('Alex Rivera');
  const [email, setEmail] = useState('alex.creator@captionstudio.io');
  const [timezone, setTimezone] = useState('America/New_York (UTC-05:00)');
  const [language, setLanguage] = useState('en');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <Card className="max-w-2xl space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Personal Profile</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Your name and avatar appear across shared project links and team workspaces.
          </p>
        </div>

        {/* Avatar Section */}
        <div className="flex items-center gap-4 pt-2">
          <div className="relative h-16 w-16 rounded-full bg-[#635BFF]/20 text-[#635BFF] flex items-center justify-center font-bold text-lg ring-4 ring-slate-100 dark:ring-zinc-800">
            AR
            <button
              type="button"
              className="absolute bottom-0 right-0 p-1 rounded-full bg-[#635BFF] text-white shadow-sm hover:bg-[#5248E6]"
              title="Upload new avatar"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">Profile Picture</p>
            <p className="text-[11px] text-slate-400">JPG, PNG, or GIF up to 5MB</p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            disabled
            hint="Email cannot be changed directly in dev mode."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-[#635BFF] focus:outline-none"
              >
                <option>America/New_York (UTC-05:00)</option>
                <option>Europe/London (UTC+00:00)</option>
                <option>Europe/Berlin (UTC+01:00)</option>
                <option>Asia/Tokyo (UTC+09:00)</option>
                <option>America/Los_Angeles (UTC-08:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-zinc-300 mb-1.5">
                Interface Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-[#635BFF] focus:outline-none"
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex justify-end">
          <Button
            type="submit"
            size="sm"
            leftIcon={isSaved ? <Check className="h-4 w-4 text-emerald-300" /> : undefined}
          >
            {isSaved ? 'Profile Saved' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  );
}

