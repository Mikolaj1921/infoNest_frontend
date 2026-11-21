'use client';

import Link from 'next/link';

// features - hooks
import { useRegisterForm } from '@/features/auth/hooks/useRegisterForm';
import { useRegisterMutation } from '@/features/auth/hooks/useRegisterMutation';

// ui components
import { AuthInput } from '@/components/ui/AuthInput';
import { AuthButton } from '@/components/ui/AuthButton';
import { AuthLegalNotice } from '@/features/auth/components/AuthLegalNotice';

// ua: компонент форми реєстрації користувача
export const RegisterForm = () => {
  // ua: ініціалізація форми та валідації
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useRegisterForm();

  // ua: мутація для реєстрації користувача
  const { mutate, isPending } = useRegisterMutation();

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
              Create an account
            </h1>

            <p className="text-sm text-muted-foreground">
              Enter your information to create an account
            </p>
          </div>

          {/* ua: форма реєстрації згідно з Zod-валідацією */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AuthInput
              label="Name"
              type="text"
              placeholder="John Doe"
              disabled={isPending}
              error={errors.name?.message}
              {...register('name')}
            />

            <AuthInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              disabled={isPending}
              error={errors.email?.message}
              {...register('email')}
            />

            <AuthInput
              label="Password"
              type="password"
              placeholder="••••••••"
              disabled={isPending}
              error={errors.password?.message}
              {...register('password')}
            />

            <AuthInput
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              disabled={isPending}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <AuthButton type="submit" isLoading={isPending}>
              Create Account &rarr;
            </AuthButton>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline underline-offset-4"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <AuthLegalNotice mode="register" />
    </div>
  );
};
