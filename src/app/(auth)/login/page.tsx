'use client';
// routes & libs & state management
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

// services
import { authService } from '@/services/auth.service';
// zustand store
import { useAuthStore } from '@/store/useAuthStore';
// features context - custom hooks
import { useLoginForm } from '@/features/auth/hooks/useLoginForm';
// ui components
import { toast } from 'sonner';
import { AuthInput } from '@/components/ui/AuthInput';
import { AuthButton } from '@/components/ui/AuthButton';
// utils & validators
import { getApiErrorMessage } from '@/utils/api-error';
import { LoginInput } from '@/validators/auth.schema';

// ua: сторінка авторизації користувача
export default function LoginPage() {
  const router = useRouter();
  // function for update global state auth
  const { setAuth } = useAuthStore();

  // ua: ініціалізація існуючої оболонки форми
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useLoginForm();

  // server state - React Query
  // ua: мутація для відправки даних логіну на бекенд
  const { mutate, isPending } = useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (responseData) => {
      setAuth(responseData.user); // ua: записуємо юзера в глобальний стор
      toast.success(responseData.message || 'Successfully logged in!');
      router.push('/workspaces'); // ua: перенаправляємо на вибір простору
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      toast.error(message); // ua: error з бекенду
    },
  });

  // ua: обробник formsubmit
  const onSubmit = (data: LoginInput) => {
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

      {/*block policy*/}
      <div className="text-center text-xs text-muted-foreground/60 px-4">
        By signing in, you agree to our{' '}
        <Link
          href="/TermsOfService"
          className="font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          href="/PrivacyPolicy"
          className="font-medium text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}
