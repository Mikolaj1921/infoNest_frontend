// ai tests для src/middleware.ts

import { describe, test, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from './middleware';

// ua: допоміжна функція для створення фейкового об'єкта NextRequest
function createMockRequest(pathname: string, cookieValue?: string) {
  const url = `http://localhost:3000${pathname}`;
  const request = new NextRequest(new Request(url));

  // ua: імітуємо наявність або відсутність куки accessToken
  if (cookieValue) {
    request.cookies.set('accessToken', cookieValue);
  }

  return request;
}

describe('Server Middleware: Route Protection', () => {
  test('1. Має перенаправляти аноніма з приватної сторінки /workspaces на сторінку /login', () => {
    // ua: створюємо запит на приватний маршрут БЕЗ куки токена
    const request = createMockRequest('/workspaces');

    const response = middleware(request);

    // ua: очікуємо, що middleware повернув редірект (статус 307 або наявність заголовка location)
    expect(response).toBeDefined();
    expect(response?.headers.get('location')).toContain('/login');
    // ua: перевіряємо, що зберігся параметр "from" для подальшого повернення
    expect(response?.headers.get('location')).toContain('from=%2Fworkspaces');
  });

  test('2. Має дозволяти доступ аноніму на публічну сторінку /login', () => {
    // ua: запит на сторінку входу БЕЗ куки токена
    const request = createMockRequest('/login');

    const response = middleware(request);

    // ua: очікуємо NextResponse.next(), тобто заголовка редіректу не повинно бути
    expect(response?.headers.get('location')).toBeNull();
  });

  test('3. Має перенаправляти залогіненого юзера зі сторінки /login на /workspaces', () => {
    // ua: створюємо запит на сторінку входу ІЗ наявною кукою токена
    const request = createMockRequest('/login', 'valid-mock-token');

    const response = middleware(request);

    // ua: очікуємо автоматичний редірект у внутрішню зону
    expect(response).toBeDefined();
    expect(response?.headers.get('location')).toBe(
      'http://localhost:3000/workspaces',
    );
  });

  test('4. Має пропускати залогіненого користувача на приватну сторінку /workspaces', () => {
    // ua: запит на приватний маршрут ІЗ кукою токена
    const request = createMockRequest('/workspaces', 'valid-mock-token');

    const response = middleware(request);

    // ua: редіректу бути не повинно, доступ дозволено
    expect(response?.headers.get('location')).toBeNull();
  });
});
