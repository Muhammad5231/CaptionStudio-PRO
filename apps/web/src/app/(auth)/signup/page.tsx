'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpSchema, SignUpDto } from '@captionstudio/types';
import { Button, Input } from '@captionstudio/ui';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function SignUpPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpDto>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      termsAccepted: true,
    },
  });

  const passwordVal = watch('password') || '';
  const hasMinLength = passwordVal.length >= 8;
  const hasUpper = /[A-Z]/.test(passwordVal);
  const hasNumber = /[0-9]/.test(passwordVal);

  const [submittedEmail, setSubmittedEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const { signup, resendVerification } = useAuth();

  const onSubmit = async (data: SignUpDto) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const res = await signup(data);
      setSubmittedEmail(res.email || data.email);
      setIsSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An account with this email already exists.';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!submittedEmail || isResending) return;
    setIsResending(true);
    setResendStatus(null);
    try {
      await resendVerification(submittedEmail);
      setResendStatus('A new verification email has been sent to your inbox.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to resend verification email.';
      setResendStatus(message);
    } finally {
      setIsResending(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">Check your inbox</h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            We sent a verification link to <span className="font-semibold text-slate-700 dark:text-zinc-200">{submittedEmail}</span>. Please click the link to activate your account.
          </p>
        </div>

        {resendStatus && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {resendStatus}
          </p>
        )}

        <div className="pt-2 flex flex-col gap-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={handleResend}
            isLoading={isResending}
          >
            Resend verification email
          </Button>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#635BFF] hover:underline"
          >
            <span>Back to Sign In</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Create your account
        </h1>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
          Join 25,000+ creators and start producing high-retention captioned videos.
        </p>
      </div>

      {serverError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Alex Rivera"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="alex@creatorstudio.io"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-1.5">
          <Input
            label="Password"
            type="password"
            placeholder="At least 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
          {/* Password strength checklist */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            <div className={`flex items-center gap-1 ${hasMinLength ? 'text-emerald-500' : ''}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${hasMinLength ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`} />
              <span>8+ chars</span>
            </div>
            <div className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-500' : ''}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${hasUpper ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`} />
              <span>1 uppercase</span>
            </div>
            <div className={`flex items-center gap-1 ${hasNumber ? 'text-emerald-500' : ''}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${hasNumber ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`} />
              <span>1 number</span>
            </div>
          </div>
        </div>

        <div className="pt-1">
          <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 dark:text-zinc-400">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-slate-300 dark:border-zinc-700 text-[#635BFF] focus:ring-[#635BFF]"
              {...register('termsAccepted')}
            />
            <span>
              I agree to the{' '}
              <Link href="/terms" className="text-[#635BFF] underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#635BFF] underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {errors.termsAccepted && (
            <p className="text-xs text-red-500 mt-1">{errors.termsAccepted.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Create Studio Account
        </Button>
      </form>

      <div className="text-center text-xs text-slate-600 dark:text-zinc-400">
        Already have an account?{' '}
        <Link href="/login" className="text-[#635BFF] font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

