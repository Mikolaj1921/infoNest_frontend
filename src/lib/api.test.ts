// ua: ai tests - тести апішки Axios

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios, { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// ua: мок функції очищення авторизації
const { mockClearAuth } = vi.hoisted(() => ({
  mockClearAuth: vi.fn(),
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthStore: {
    getState: () => ({
      actions: {
        clearAuth: mockClearAuth,
      },
    }),
  },
}));

// ua: допоміжна функція для створення Axios-помилки
const createAxiosError = (
  config: InternalAxiosRequestConfig,
  status: number,
  data: unknown = { message: 'Test API error' },
) => {
  const response = {
    data,
    status,
    statusText: 'Error',
    headers: {},
    config,
  } as AxiosResponse;

  return new AxiosError(
    `Request failed with status code ${status}`,
    'ERR_BAD_REQUEST',
    config,
    undefined,
    response,
  );
};

describe('api Axios instance', () => {
  let api: typeof import('./axios').default;

  beforeEach(async () => {
    vi.resetModules();
    mockClearAuth.mockReset();

    // ua: імпортуємо новий екземпляр API для кожного тесту
    const apiImport = await import('./axios');
    api = apiImport.default;

    // ua: за замовчуванням запити не повинні звертатися до реального сервера
    api.defaults.adapter = async (config) => ({
      data: { success: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ua: 1. Перевірка базової конфігурації Axios
  it('1. Повинен мати правильну базову конфігурацію', () => {
    expect(api.defaults.baseURL).toBe(
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    );

    expect(api.defaults.withCredentials).toBe(true);
  });

  // ua: 2. Успішна відповідь від API
  it('2. Повинен повертати успішну відповідь від API', async () => {
    const response = await api.get('/test');

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ success: true });
  });

  // ua: 3. Обробка звичайної API-помилки
  it('3. Повинен логувати звичайні API-помилки', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    api.defaults.adapter = async (config) => {
      throw createAxiosError(config, 500, {
        message: 'Internal server error',
      });
    };

    await expect(api.get('/test')).rejects.toMatchObject({
      response: {
        status: 500,
      },
    });

    expect(consoleError).toHaveBeenCalledWith(
      'API Error:',
      'Internal server error',
    );
  });

  // ua: 4. Обробка помилки без повідомлення від сервера
  it('4. Повинен використовувати стандартне повідомлення, якщо сервер не передав message', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    api.defaults.adapter = async (config) => {
      throw createAxiosError(config, 500, {});
    };

    await expect(api.get('/test')).rejects.toBeInstanceOf(AxiosError);

    expect(consoleError).toHaveBeenCalledWith(
      'API Error:',
      'Something went wrong',
    );
  });

  // ua: 5. Автоматичне оновлення сесії після 401
  it('5. Повинен виконувати refresh після отримання 401', async () => {
    const refreshSpy = vi.spyOn(axios, 'post').mockResolvedValue({
      status: 200,
      data: { success: true },
    });

    let requestCount = 0;

    api.defaults.adapter = async (config) => {
      requestCount += 1;

      if (requestCount === 1) {
        throw createAxiosError(config, 401);
      }

      return {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    };

    const response = await api.get('/documents');

    expect(refreshSpy).toHaveBeenCalledTimes(1);
    expect(refreshSpy).toHaveBeenCalledWith(
      `${api.defaults.baseURL}/auth/refresh`,
      {},
      { withCredentials: true },
    );

    expect(requestCount).toBe(2);
    expect(response.data).toEqual({ success: true });
    expect(mockClearAuth).not.toHaveBeenCalled();
  });

  // ua: 6. Повторний запит після успішного refresh
  it('6. Повинен повторно виконувати початковий запит після refresh', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue({
      status: 200,
      data: { success: true },
    });

    let requestCount = 0;

    api.defaults.adapter = async (config) => {
      requestCount += 1;

      if (requestCount === 1) {
        throw createAxiosError(config, 401);
      }

      return {
        data: { document: 'Test document' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    };

    const response = await api.get('/documents/123');

    expect(requestCount).toBe(2);
    expect(response.data).toEqual({
      document: 'Test document',
    });
  });

  // ua: 7. Очищення авторизації, якщо refresh завершився помилкою
  it('7. Повинен викликати clearAuth, якщо refresh завершився помилкою', async () => {
    const refreshError = new AxiosError('Refresh failed');

    vi.spyOn(axios, 'post').mockRejectedValue(refreshError);

    api.defaults.adapter = async (config) => {
      throw createAxiosError(config, 401);
    };

    await expect(api.get('/documents')).rejects.toBe(refreshError);

    expect(mockClearAuth).toHaveBeenCalledTimes(1);
  });

  // ua: 8. Відсутність refresh для запиту профілю
  it('8. Повинен очищувати авторизацію при 401 на /auth/me без refresh', async () => {
    const refreshSpy = vi.spyOn(axios, 'post');

    api.defaults.adapter = async (config) => {
      throw createAxiosError(config, 401);
    };

    await expect(api.get('/auth/me')).rejects.toMatchObject({
      response: {
        status: 401,
      },
    });

    expect(refreshSpy).not.toHaveBeenCalled();
    expect(mockClearAuth).toHaveBeenCalledTimes(1);
  });

  // ua: 9. Відсутність refresh для login та register
  it.each(['/auth/login', '/auth/register'])(
    '9. Не повинен запускати refresh при 401 на %s',
    async (url) => {
      const refreshSpy = vi.spyOn(axios, 'post');

      api.defaults.adapter = async (config) => {
        throw createAxiosError(config, 401);
      };

      await expect(api.post(url)).rejects.toMatchObject({
        response: {
          status: 401,
        },
      });

      expect(refreshSpy).not.toHaveBeenCalled();
      expect(mockClearAuth).not.toHaveBeenCalled();
    },
  );

  // ua: 10. Спеціальна обробка 404 для structure та files
  it.each(['/structure', '/files'])(
    '10. Повинен передавати 404 для %s без додаткового логування',
    async (url) => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      api.defaults.adapter = async (config) => {
        throw createAxiosError(config, 404, {
          message: 'Resource not found',
        });
      };

      await expect(api.get(url)).rejects.toMatchObject({
        response: {
          status: 404,
        },
      });

      expect(consoleError).not.toHaveBeenCalled();
      expect(mockClearAuth).not.toHaveBeenCalled();
    },
  );

  // ua: 11. Обробка помилки refresh endpoint
  it('11. Повинен очищувати авторизацію при помилці самого refresh endpoint', async () => {
    api.defaults.adapter = async (config) => {
      throw createAxiosError(config, 401);
    };

    await expect(api.get('/auth/refresh')).rejects.toMatchObject({
      response: {
        status: 401,
      },
    });

    expect(mockClearAuth).toHaveBeenCalledTimes(1);
  });
});
