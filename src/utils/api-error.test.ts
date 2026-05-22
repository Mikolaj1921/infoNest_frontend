//ua: готові ai тести

import { describe, test, expect } from 'vitest';
import { AxiosError } from 'axios';
import { getApiErrorMessage } from './api-error';

describe('Global Utility: getApiErrorMessage', () => {
  test('1. Має успішно діставати кастомне повідомлення про помилку з Express-бекенду', () => {
    const mockAxiosError = {
      isAxiosError: true,
      response: {
        data: {
          message: 'User already exists',
        },
      },
    } as unknown as AxiosError;

    const result = getApiErrorMessage(mockAxiosError);
    expect(result).toBe('User already exists');
  });

  test('2. Має повертати технічне повідомлення Axios, якщо бекенд не надіслав власного message', () => {
    const mockAxiosError = {
      isAxiosError: true,
      message: 'Network Error',
      response: undefined,
    } as unknown as AxiosError;

    const result = getApiErrorMessage(mockAxiosError);
    expect(result).toBe('Network Error');
  });

  test('3. Має повертати дефолтний рядок, якщо у помилки Axios взагалі немає жодних даних', () => {
    const mockAxiosError = {
      isAxiosError: true,
      response: {
        data: {},
      },
    } as unknown as AxiosError;

    const result = getApiErrorMessage(mockAxiosError);

    expect(result).toBe('Something went wrong with the API request');
  });

  test('4. Має коректно обробляти базові помилки стандартного двигуна JavaScript Error', () => {
    const mockJsError = new Error('Client-side runtime exception');

    const result = getApiErrorMessage(mockJsError);
    expect(result).toBe('Client-side runtime exception');
  });

  test('5. Має повертати універсальну заглушку для невідомих типів помилок (наприклад, null або рядок)', () => {
    const result = getApiErrorMessage('Random string error');

    expect(result).toBe('Unknown error in the application');
  });
});
