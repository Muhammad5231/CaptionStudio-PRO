'use client';

import React from 'react';
import { Card, Input, Button } from '@captionstudio/ui';
import { KeyRound, ShieldAlert, Smartphone, Laptop } from 'lucide-react';

export default function SecuritySettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      {/* Change Password Card */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Change Password</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Ensure your account is using a secure, unique password.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Input label="Current Password" type="password" placeholder="••••••••" />
          <Input label="New Password" type="password" placeholder="••••••••" />
          <Input label="Confirm New Password" type="password" placeholder="••••••••" />
        </div>

        <div className="pt-2 flex justify-end">
          <Button size="sm">Update Password</Button>
        </div>
      </Card>

      {/* Active Sessions */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">Active Sessions</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Devices currently authenticated into your CaptionStudio PRO account.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <Laptop className="h-5 w-5 text-[#635BFF]" />
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Chrome on Windows (Current)
                </p>
                <p className="text-[11px] text-slate-400">New York, USA • 192.168.1.1</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-500 uppercase">Active Now</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                  Safari on iPhone 15 Pro
                </p>
                <p className="text-[11px] text-slate-400">New York, USA • 3 days ago</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-[11px] h-7 px-2">
              Revoke
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

