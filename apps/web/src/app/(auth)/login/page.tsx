'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginDto } from '@captionstudio/types';
import { Button, Input } from '@captionstudio/ui';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const [serverError, setServerError] = useState<string | null>(null);
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

    try {
      await login(data.email, data.password, data.rememberMe);
      router.push(redirectUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password. Please try again.';
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
          Sign in with your @gmail.com account to access CaptionStudio PRO.
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
          label="Gmail Address"
          type="email"
          placeholder="yourname@gmail.com"
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
              <span>Remember me</span>
            </label>
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
          Sign up with Gmail
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#635BFF]" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
