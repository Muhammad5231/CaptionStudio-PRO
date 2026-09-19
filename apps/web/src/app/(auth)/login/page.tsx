'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginDto } from '@captionstudio/types';
import { Button, Input } from '@captionstudio/ui';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [serverError, setServerError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginDto) => {
    setIsLoading(true);
    setServerError(null);
    setUnverifiedEmail(null);

    try {
      await login(data.email, data.password, data.rememberMe);
      router.push(redirectUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password. Please try again.';
      if (message.includes('verify your email')) {
        setUnverifiedEmail(data.email);
      }
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Welcome back
        </h1>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
          Sign in to access your projects, brand kits, and video templates.
        </p>
      </div>

      {serverError && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
          {unverifiedEmail && (
            <div className="pt-1">
              <Link
                href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                className="font-semibold underline hover:opacity-80"
              >
                Go to verification page to resend email
              </Link>
            </div>
          )}
        </div>
      )}

      {/* OAuth Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setServerError('OAuth login is not configured for this environment.')}
          className="flex items-center justify-center gap-2 h-10 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-400 dark:text-zinc-500 cursor-not-allowed transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="flex items-center justify-center gap-2 h-10 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>GitHub</span>
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
        <span className="absolute bg-white dark:bg-[#09090B] px-3 text-[11px] font-medium text-slate-400 dark:text-zinc-500 uppercase">
          Or continue with email
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-zinc-400">
              <input
                type="checkbox"
                className="rounded border-slate-300 dark:border-zinc-700 text-[#635BFF] focus:ring-[#635BFF]"
                {...register('rememberMe')}
              />
              <span>Remember me for 30 days</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-[#635BFF] hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Sign In to Studio
        </Button>
      </form>

      <div className="text-center text-xs text-slate-600 dark:text-zinc-400">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#635BFF] font-semibold hover:underline">
          Sign up free
        </Link>
      </div>
    </div>
  );
}

