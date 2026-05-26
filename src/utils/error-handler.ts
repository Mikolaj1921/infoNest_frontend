// global error handler - ua: глобальний обробник помилок для API запитів

import { toast } from 'sonner';
// ua: імпорт утиліти для отримання повідомлення помилки з різних типів помилок
import { getApiErrorMessage } from './api-error';

// ua: глобальна функція для автоматичного виведення помилок API у Sonner
export const handleGlobalError = (error: unknown) => {
  const message = getApiErrorMessage(error);

  // ua: викликаємо toast з message з бекy
  toast.error(message);
};
