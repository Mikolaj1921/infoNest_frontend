// ai tests - LoginForm component

import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ua: Мок мутації авторизації
const mockMutate = vi.fn();
let mockIsPending = false;

vi.mock('../hooks/useLoginMutation', () => ({
  useLoginMutation: () => ({
    mutate: mockMutate,
    isPending: mockIsPending,
  }),
}));

import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
  });

  // 1. Відображення форми
  test('1.1 Повинен відображати заголовок форми входу', () => {
    render(<LoginForm />);

    expect(screen.getByText('Welcome back')).toBeTruthy();
    expect(screen.getByText('Enter your credentials to continue')).toBeTruthy();
  });

  test('1.2 Повинен відображати поле email', () => {
    render(<LoginForm />);

    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy();
  });

  test('1.3 Повинен відображати поле password', () => {
    render(<LoginForm />);

    expect(screen.getByPlaceholderText('••••••••')).toBeTruthy();
  });

  test('1.4 Повинен відображати посилання Forgot password', () => {
    render(<LoginForm />);

    expect(screen.getByText('Forgot password?')).toBeTruthy();
  });

  test('1.5 Повинен відображати посилання на реєстрацію', () => {
    render(<LoginForm />);

    expect(screen.getByText('Create one')).toBeTruthy();
  });

  test('1.6 Повинен відображати Terms of Service та Privacy Policy', () => {
    render(<LoginForm />);

    expect(screen.getByText('Terms of Service')).toBeTruthy();
    expect(screen.getByText('Privacy Policy')).toBeTruthy();
  });

  // 2. Відправлення форми
  test('2.1 Повинен відправляти введені email та password', async () => {
    render(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'test@example.com' },
    });

    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    expect(mockMutate).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
    });
  });

  test('2.2 Не повинен викликати мутацію при порожніх полях', async () => {
    render(<LoginForm />);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  // 3. Стан завантаження
  test('3.1 Повинен блокувати поля під час відправлення запиту', () => {
    mockIsPending = true;

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText(
      'you@example.com',
    ) as HTMLInputElement;

    const passwordInput = screen.getByPlaceholderText(
      '••••••••',
    ) as HTMLInputElement;

    expect(emailInput.disabled).toBe(true);
    expect(passwordInput.disabled).toBe(true);
  });
});
