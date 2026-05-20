'use client';
// routes & libs & state management
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

// services
import { authService } from '@/services/auth.service';
// zustand store
import { useAuthActions } from '@/store/useAuthStore';
// features context - custom hooks
import { useRegisterForm } from '@/features/auth/hooks/useRegisterForm';
// ui components
import { toast } from 'sonner';
import { AuthInput } from '@/components/ui/AuthInput';
import { AuthButton } from '@/components/ui/AuthButton';
// utils & validators
import { getApiErrorMessage } from '@/utils/api-error';
import { RegisterInput } from '@/validators/auth.schema';

// ua: сторінка реєстрації користувача
export default function RegisterPage() {
  const router = useRouter();
  // custom hook
  const { setAuth } = useAuthActions();

  // ua: ініціалізація існуючої оболонки форми
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useRegisterForm();

  // server state - React Query

  // ua: мутація для відправки даних реєстрації на бекенд
  const { mutate, isPending } = useMutation({
    mutationFn: (data: RegisterInput) => authService.register(data),

    onSuccess: (responseData) => {
      setAuth(responseData.user); // ua: записуємо юзера в глобальний стор
      toast.success(responseData.message || 'Successfully registered!');

      router.push('/workspaces'); // ua: перенаправлення на ворксппейси
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      toast.error(message);
    },
  });

  // ua: обробник formsubmit
  const onSubmit = (data: RegisterInput) => {
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

          {/*form - згідно з валідацією*/}
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

      {/*block policy*/}
      <div className="text-center text-xs text-muted-foreground/60 px-4">
        By creating an account, you agree to our{' '}
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
