'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Shield,
  CreditCard,
  Bell,
  Sun,
  Users,
  BarChart2,
} from 'lucide-react';

const SETTINGS_TABS = [
  { label: 'Profile', href: '/settings/profile', icon: User },
  { label: 'Security', href: '/settings/security', icon: Shield },
  { label: 'Billing & Plan', href: '/settings/billing', icon: CreditCard },
  { label: 'Usage', href: '/settings/usage', icon: BarChart2 },
  { label: 'Notifications', href: '/settings/notifications', icon: Bell },
  { label: 'Appearance', href: '/settings/appearance', icon: Sun },
  { label: 'Team', href: '/settings/team', icon: Users },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">Settings</h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
          Manage your personal account, team workspace, security preferences, and subscription.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-zinc-800 overflow-x-auto pb-px">
        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-[#635BFF] text-[#635BFF]'
                  : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="pt-2">{children}</div>
    </div>
  );
}

