import { describe, it, expect, vi, beforeEach } from 'vitest';

import api from '@/lib/axios';
import { authService } from './auth.service';

import type { User } from '@/types/user';
import type { AuthResponse, MessageResponse } from '@/types/auth';

// ua: мок Axios API
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Отримання поточного користувача
  it('1. Повинен отримувати дані активної сесії через getMe', async () => {
    const mockUser = {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
    } as User;

    vi.mocked(api.get).mockResolvedValue({
      data: {
        success: true,
        data: {
          user: mockUser,
        },
      },
    } as never);

    const result = await authService.getMe();

    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(mockUser);
  });

  // 2. Повернення саме об'єкта user
  it('2. Повинен повертати user з вкладеної API-відповіді', async () => {
    const mockUser = {
      id: 'user-456',
      email: 'another@example.com',
    } as User;

    const mockResponse = {
      success: true,
      data: {
        user: mockUser,
      },
    };

    vi.mocked(api.get).mockResolvedValue({
      data: mockResponse,
    } as never);

    const result = await authService.getMe();

    expect(result).toEqual(mockResponse.data.user);
    expect(result).not.toEqual(mockResponse);
  });

  // 3. Авторизація користувача
  it('3. Повинен виконувати login з переданими даними', async () => {
    const dto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockAuthResponse = {
      user: {
        id: 'user-123',
        email: dto.email,
      },
      token: 'test-token',
    } as unknown as AuthResponse;

    vi.mocked(api.post).mockResolvedValue({
      data: {
        success: true,
        data: mockAuthResponse,
      },
    } as never);

    const result = await authService.login(dto);

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/auth/login', dto);
    expect(result).toEqual(mockAuthResponse);
  });

  // 4. Повернення даних авторизації
  it('4. Повинен повертати data з відповіді login', async () => {
    const mockAuthResponse = {
      user: { id: 'user-123' },
      token: 'login-token',
    } as unknown as AuthResponse;

    const mockResponse = {
      success: true,
      data: mockAuthResponse,
    };

    vi.mocked(api.post).mockResolvedValue({
      data: mockResponse,
    } as never);

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result).toEqual(mockResponse.data);
    expect(result).not.toEqual(mockResponse);
  });

  // 5. Реєстрація користувача
  it('5. Повинен виконувати register з переданими даними', async () => {
    const dto = {
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    };

    const mockAuthResponse = {
      user: {
        id: 'user-789',
        email: dto.email,
      },
      token: 'register-token',
    } as unknown as AuthResponse;

    vi.mocked(api.post).mockResolvedValue({
      data: {
        success: true,
        data: mockAuthResponse,
      },
    } as never);

    const result = await authService.register(dto);

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/auth/register', dto);
    expect(result).toEqual(mockAuthResponse);
  });

  // 6. Повернення даних після реєстрації
  it('6. Повинен повертати data з відповіді register', async () => {
    const mockAuthResponse = {
      user: { id: 'user-789' },
      token: 'register-token',
    } as unknown as AuthResponse;

    const mockResponse = {
      success: true,
      data: mockAuthResponse,
    };

    vi.mocked(api.post).mockResolvedValue({
      data: mockResponse,
    } as never);

    const result = await authService.register({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    });

    expect(result).toEqual(mockResponse.data);
    expect(result).not.toEqual(mockResponse);
  });

  // 7. Вихід користувача
  it('7. Повинен виконувати logout', async () => {
    const mockMessageResponse = {
      message: 'Logged out successfully',
    } as MessageResponse;

    vi.mocked(api.post).mockResolvedValue({
      data: {
        success: true,
        data: mockMessageResponse,
      },
    } as never);

    const result = await authService.logout();

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/auth/logout');
    expect(result).toEqual(mockMessageResponse);
  });

  // 8. Повернення повідомлення після виходу
  it('8. Повинен повертати data з відповіді logout', async () => {
    const mockMessageResponse = {
      message: 'Logged out successfully',
    } as MessageResponse;

    const mockResponse = {
      success: true,
      data: mockMessageResponse,
    };

    vi.mocked(api.post).mockResolvedValue({
      data: mockResponse,
    } as never);

    const result = await authService.logout();

    expect(result).toEqual(mockResponse.data);
    expect(result).not.toEqual(mockResponse);
  });

  // 9. Обробка помилки getMe
  it('9. Повинен передавати помилку getMe далі', async () => {
    const mockError = new Error('Session error');

    vi.mocked(api.get).mockRejectedValue(mockError);

    await expect(authService.getMe()).rejects.toBe(mockError);
  });

  // 10. Обробка помилки login
  it('10. Повинен передавати помилку login далі', async () => {
    const mockError = new Error('Login failed');

    vi.mocked(api.post).mockRejectedValue(mockError);

    await expect(
      authService.login({
        email: 'test@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toBe(mockError);
  });

  // 11. Обробка помилки register
  it('11. Повинен передавати помилку register далі', async () => {
    const mockError = new Error('Registration failed');

    vi.mocked(api.post).mockRejectedValue(mockError);

    await expect(
      authService.register({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      }),
    ).rejects.toBe(mockError);
  });

  // 12. Обробка помилки logout
  it('12. Повинен передавати помилку logout далі', async () => {
    const mockError = new Error('Logout failed');

    vi.mocked(api.post).mockRejectedValue(mockError);

    await expect(authService.logout()).rejects.toBe(mockError);
  });
});
