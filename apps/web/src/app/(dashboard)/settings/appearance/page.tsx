'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Card } from '@captionstudio/ui';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

export default function AppearanceSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    {
      id: 'light',
      label: 'Light',
      desc: 'Crisp high-contrast daylight theme with clean borders.',
      icon: Sun,
    },
    {
      id: 'dark',
      label: 'Dark (Studio)',
      desc: 'Dedicated deep zinc theme designed for long editing sessions.',
      icon: Moon,
    },
    {
      id: 'system',
      label: 'System Sync',
      desc: 'Automatically matches your operating system preferences.',
      icon: Laptop,
    },
  ];

  return (
    <Card className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Appearance & Theme</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
          Customize your visual editing environment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {themes.map((t) => {
          const Icon = t.icon;
          const isSelected = mounted && theme === t.id;

          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-[#635BFF] bg-[#635BFF]/10 text-[#635BFF]'
                  : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <Icon className="h-5 w-5" />
                {isSelected && <Check className="h-4 w-4 text-[#635BFF]" />}
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">{t.label}</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">{t.desc}</p>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

