'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, ArrowRight, RotateCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button, Input } from '@captionstudio/ui';
import { useAuth } from '@/context/auth-context';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const initialEmail = searchParams.get('email') || '';

  const { verifyEmail, resendVerification } = useAuth();

  const [isVerifying, setIsVerifying] = useState(Boolean(token));
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [resendEmail, setResendEmail] = useState(initialEmail);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let mounted = true;
    const runVerification = async () => {
      setIsVerifying(true);
      setErrorMessage(null);
      try {
        await verifyEmail(token);
        if (mounted) {
          setIsVerified(true);
        }
      } catch (err: unknown) {
        if (mounted) {
          const message = err instanceof Error ? err.message : 'Invalid or expired verification token.';
          setErrorMessage(message);
        }
      } finally {
        if (mounted) {
          setIsVerifying(false);
        }
      }
    };

    runVerification();
    return () => {
      mounted = false;
    };
  }, [token, verifyEmail]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail || isResending) return;

    setIsResending(true);
    setResendSuccess(null);
    setErrorMessage(null);

    try {
      await resendVerification(resendEmail);
      setResendSuccess('If an account exists with this email, a new verification link has been sent.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send verification link.';
      setErrorMessage(message);
    } finally {
      setIsResending(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#635BFF]/10 text-[#635BFF]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">Verifying your email</h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            Please wait while we confirm your account credentials...
          </p>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">Email verified!</h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            Your email has been verified and your studio account is now fully active.
          </p>
        </div>
        <div className="pt-2">
          <Button
            className="w-full"
            onClick={() => router.push('/dashboard')}
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#635BFF]/10 text-[#635BFF] mb-4">
          <Mail className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">Verify your email</h1>
        <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
          We sent a verification link to your registered email address. Please click the link to activate your account.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {resendSuccess && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{resendSuccess}</span>
        </div>
      )}

      <form onSubmit={handleResend} className="space-y-3 pt-2">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@company.com"
          value={resendEmail}
          onChange={(e) => setResendEmail(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="outline"
          className="w-full text-xs"
          isLoading={isResending}
          leftIcon={<RotateCw className="h-3.5 w-3.5" />}
        >
          Resend Verification Email
        </Button>
      </form>

      <div className="text-center text-xs text-slate-600 dark:text-zinc-400 pt-2">
        Already verified?{' '}
        <Link href="/login" className="text-[#635BFF] font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#635BFF]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
