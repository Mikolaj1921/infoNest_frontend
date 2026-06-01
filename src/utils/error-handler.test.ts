// ua: тестування глобальної утиліти обробки помилок

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';
import { handleGlobalError } from './error-handler';
import { AxiosError } from 'axios';

// ua: макетування ліби тост sonner, щоб тести не пробувли рендерити UI
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('Global Utility: handleGlobalError', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // ua: скидання лічильника викликів перед кожним тестом
  });

  test('1. Має автоматично викликати toast.error з кастомним повідомленням від Express-бекенду', () => {
    // ua: імітування помилки Axios
    const mockAxiosError = {
      isAxiosError: true,
      response: {
        data: {
          message: 'Workspace name is required',
        },
      },
    } as unknown as AxiosError;

    // ua: виклик обробника помилок
    handleGlobalError(mockAxiosError);

    // ua: перевірка, що метод toast.error був викликаний онлі 1 раз
    expect(toast.error).toHaveBeenCalledTimes(1);

    // ua: перевірка чи Sonner отримав правильний текст помилки
    expect(toast.error).toHaveBeenCalledWith('Workspace name is required');
  });

  test('2. Має викликати toast.error з дефолтною англійською заглушкою при отриманні невідомого типу помилки', () => {
    // ua: передача невідомого типу помилки
    handleGlobalError('Unexpected server database crash');

    expect(toast.error).toHaveBeenCalledTimes(1);

    // ua: перевірка, що утиліта підставила дефолтний глобал рядок з api-error
    expect(toast.error).toHaveBeenCalledWith(
      'Unknown error in the application',
    );
  });
});
