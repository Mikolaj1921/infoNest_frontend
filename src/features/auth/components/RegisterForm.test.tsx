// ai tests - RegisterForm component

import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ua: Мок мутації реєстрації
const mockMutate = vi.fn();
let mockIsPending = false;

vi.mock('../hooks/useRegisterMutation', () => ({
  useRegisterMutation: () => ({
    mutate: mockMutate,
    isPending: mockIsPending,
  }),
}));

import { RegisterForm } from './RegisterForm';

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
  });

  // 1. Відображення форми
  test('1.1 Повинен відображати заголовок реєстрації', () => {
    render(<RegisterForm />);

    expect(screen.getByText('Create an account')).toBeTruthy();
    expect(
      screen.getByText('Enter your information to create an account'),
    ).toBeTruthy();
  });

  test('1.2 Повинен відображати поле name', () => {
    render(<RegisterForm />);

    expect(screen.getByPlaceholderText('John Doe')).toBeTruthy();
  });

  test('1.3 Повинен відображати поле email', () => {
    render(<RegisterForm />);

    expect(screen.getByPlaceholderText('you@example.com')).toBeTruthy();
  });

  test('1.4 Повинен відображати поле password', () => {
    render(<RegisterForm />);

    const passwordFields = screen.getAllByPlaceholderText('••••••••');

    expect(passwordFields.length).toBe(2);
  });

  test('1.5 Повинен відображати посилання на вхід', () => {
    render(<RegisterForm />);

    expect(screen.getByText('Sign in')).toBeTruthy();
  });

  test('1.6 Повинен відображати Terms of Service та Privacy Policy', () => {
    render(<RegisterForm />);

    expect(screen.getByText('Terms of Service')).toBeTruthy();
    expect(screen.getByText('Privacy Policy')).toBeTruthy();
  });

  // 2. Відправлення форми
  test('2.1 Повинен відправляти всі реєстраційні дані', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { value: 'John Doe' },
    });

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'john@example.com' },
    });

    const passwordFields = screen.getAllByPlaceholderText('••••••••');

    fireEvent.change(passwordFields[0], {
      target: { value: 'Password123!' },
    });

    fireEvent.change(passwordFields[1], {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });

    expect(mockMutate).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
  });

  test('2.2 Не повинен викликати мутацію при порожніх полях', async () => {
    render(<RegisterForm />);

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  // 3. Валідація підтвердження пароля
  test('3.1 Не повинен відправляти форму, якщо паролі не збігаються', async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByPlaceholderText('John Doe'), {
      target: { value: 'John Doe' },
    });

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'john@example.com' },
    });

    const passwordFields = screen.getAllByPlaceholderText('••••••••');

    fireEvent.change(passwordFields[0], {
      target: { value: 'Password123!' },
    });

    fireEvent.change(passwordFields[1], {
      target: { value: 'DifferentPassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  // 4. Стан завантаження
  test('4.1 Повинен блокувати всі поля під час відправлення запиту', () => {
    mockIsPending = true;

    render(<RegisterForm />);

    const nameInput = screen.getByPlaceholderText(
      'John Doe',
    ) as HTMLInputElement;

    const emailInput = screen.getByPlaceholderText(
      'you@example.com',
    ) as HTMLInputElement;

    const passwordFields = screen.getAllByPlaceholderText(
      '••••••••',
    ) as HTMLInputElement[];

    expect(nameInput.disabled).toBe(true);
    expect(emailInput.disabled).toBe(true);
    expect(passwordFields[0].disabled).toBe(true);
    expect(passwordFields[1].disabled).toBe(true);
  });
});
