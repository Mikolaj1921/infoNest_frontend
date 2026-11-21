'use client';

import Link from 'next/link';

// features - hooks
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
import { useLoginMutation } from '@/features/auth/hooks/useLoginMutation';

// ui components
import { AuthInput } from '@/components/ui/AuthInput';
import { AuthButton } from '@/components/ui/AuthButton';
import { AuthLegalNotice } from '@/features/auth/components/AuthLegalNotice';

// ua: компонент форми авторизації користувача
export const LoginForm = () => {
  // ua: ініціалізація форми та валідації
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useLoginForm();

  // ua: мутація для авторизації користувача
  const { mutate, isPending } = useLoginMutation();

  // ua: обробник відправлення форми
  const onSubmit = (data: Parameters<typeof mutate>[0]) => {
    mutate(data);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="rounded-2xl border border-border bg-card/40 p-8 backdrop-blur-md shadow-2xl shadow-black/50">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h1>

            <p className="text-sm text-muted-foreground">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AuthInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              disabled={isPending}
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <AuthInput
                label=""
                type="password"
                placeholder="••••••••"
                disabled={isPending}
                error={errors.password?.message}
                {...register('password')}
              />
            </div>

            <AuthButton type="submit" isLoading={isPending}>
              Sign In &rarr;
            </AuthButton>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>

      <AuthLegalNotice mode="login" />
    </div>
  );
};
