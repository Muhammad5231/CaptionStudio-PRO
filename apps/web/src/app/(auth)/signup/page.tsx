'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignUpSchema, SignUpDto } from '@captionstudio/types';
import { Button, Input } from '@captionstudio/ui';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function SignUpPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpDto>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const passwordVal = watch('password') || '';
  const hasMinLength = passwordVal.length >= 8;

  const { signup } = useAuth();

  const onSubmit = async (data: SignUpDto) => {
    setIsLoading(true);
    setServerError(null);

    try {
      await signup(data);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An account with this email already exists.';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          Create your account
        </h1>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
          Sign up with your @gmail.com address to start creating viral captioned videos.
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
          label="Full Name (Optional)"
          placeholder="Alex Rivera"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Gmail Address"
          type="email"
          placeholder="yourname@gmail.com"
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
          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500 dark:text-zinc-400">
            <span className={`h-1.5 w-1.5 rounded-full ${hasMinLength ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`} />
            <span className={hasMinLength ? 'text-emerald-500 font-medium' : ''}>
              At least 8 characters
            </span>
          </div>
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
