import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// services
import { authService } from '@/services/auth.service';

// zustand store
import { useAuthActions } from '@/store/useAuthStore';

// utils & validators
import { getApiErrorMessage } from '@/utils/api-error';
import { LoginInput } from '@/validators/auth.schema';

// ua: хук для обробки авторизації користувача
export const useLoginMutation = () => {
  const router = useRouter();
  const { setAuth } = useAuthActions();

  return useMutation({
    // ua: відправлення даних авторизації на backend
    mutationFn: (data: LoginInput) => authService.login(data),

    // ua: обробка успішної авторизації
    onSuccess: (responseData) => {
      setAuth(responseData.user);

      toast.success(responseData.message || 'Successfully logged in!');

      router.push('/workspaces');
    },

    // ua: обробка помилок авторизації
    onError: (error) => {
      const message = getApiErrorMessage(error);
      toast.error(message);
    },
  });
};
