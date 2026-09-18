'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, RotateCw } from 'lucide-react';
import { Button } from '@captionstudio/ui';

export default function VerifyEmailPage() {
  return (
    <div className="text-center space-y-6">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#635BFF]/10 text-[#635BFF]">
        <Mail className="h-8 w-8" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">Verify your email</h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
          We sent a verification link to your registered email address. Click the link to complete account setup.
        </p>
      </div>

      <div className="pt-2 flex flex-col gap-3">
        <Button
          variant="outline"
          className="w-full text-xs"
          leftIcon={<RotateCw className="h-3.5 w-3.5" />}
        >
          Resend Verification Email
        </Button>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#635BFF] hover:underline"
        >
          <span>Continue to Studio Workspace</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

