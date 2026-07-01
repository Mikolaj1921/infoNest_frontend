// info about this hook

// ua: кастомний хук для затримки оновлення значення (захист сервера від спаму запитами)
// ua: використовується для того, щоб не відправляти запит на сервер при кожному натисканні клавіші

import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 1500): T {
  // ua: локальний стан для збереження затриманого значення
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // ua: функція очищення
    // Якщо юзер натиснув наступну клавішу швидше, ніж пройшло delay,
    // ретурн скасовує попередній таймер і запускає новий заново
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // ua: рестарт ефектп при кожній зміні тексту або затримки

  return debouncedValue;
}
