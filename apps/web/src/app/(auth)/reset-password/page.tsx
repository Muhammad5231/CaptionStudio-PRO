'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetPasswordSchema, ResetPasswordDto } from '@captionstudio/types';
import { Button, Input } from '@captionstudio/ui';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordDto>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      token: 'demo-token',
    },
  });

  const onSubmit = async (data: ResetPasswordDto) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-zinc-50">Password updated!</h1>
          <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
            Your new password has been securely updated. You can now sign in with your updated credentials.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#635BFF] hover:underline"
        >
          <span>Sign In to Studio</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Choose a new password
        </h1>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
          Must be at least 8 characters with at least one uppercase letter and one number.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('token')} />

        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Update Password
        </Button>
      </form>
    </div>
  );
}

