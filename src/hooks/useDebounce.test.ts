// ua: тестування кастом хука useDebounce

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('Custom Hook: useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers(); // відлік часу
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ua: тестування початкового значення та оновленого значення після затримки
  test('1. Початкове значення повертається відразу, а оновлене — суворо після затримки', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1500 } },
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 1500 });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1499);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  // ua: тестування швидкого введення нових символів
  test('2. Швидке введення нових символів скидає попередній таймер і запускає новий відлік', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 1500 } },
    );

    // imit швидке натискання клавіш (введення тексту)
    rerender({ value: 'ab', delay: 1500 });
    act(() => {
      vi.advanceTimersByTime(1000); // 1s
    });

    rerender({ value: 'abc', delay: 1500 }); // Натиснули третю літеру, попередній таймер скасовано
    act(() => {
      vi.advanceTimersByTime(1000); // +1s (sum 2s, але з моменту 'abc' лише 1000)
    });

    expect(result.current).toBe('a'); // старий текст, бо таймер скидався

    // Чекаємо фінальні 0.5с для 'abc'
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('abc'); // Оновлення пройшло тільки після повної паузи в друці
  });
});
