import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// services
import { authService } from '@/services/auth.service';

// zustand store
import { useAuthActions } from '@/store/useAuthStore';

// utils & validators
import { getApiErrorMessage } from '@/utils/api-error';
import { RegisterInput } from '@/validators/auth.schema';

// ua: хук для обробки реєстрації користувача
export const useRegisterMutation = () => {
  const router = useRouter();
  const { setAuth } = useAuthActions();

  return useMutation({
    // ua: відправлення даних реєстрації на backend
    mutationFn: (data: RegisterInput) => authService.register(data),

    // ua: обробка успішної реєстрації
    onSuccess: (responseData) => {
      setAuth(responseData.user);

      toast.success(responseData.message || 'Successfully registered!');

      router.push('/workspaces');
    },

    // ua: обробка помилок реєстрації
    onError: (error) => {
      const message = getApiErrorMessage(error);
      toast.error(message);
    },
  });
};
