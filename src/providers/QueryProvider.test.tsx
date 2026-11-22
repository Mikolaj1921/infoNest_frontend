// tests with ai - query provider

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useQueryClient } from '@tanstack/react-query';

import QueryProvider from './QueryProvider';

// ua: мок React Query Devtools
vi.mock('@tanstack/react-query-devtools', () => ({
  ReactQueryDevtools: vi.fn(({ initialIsOpen }: { initialIsOpen: boolean }) => (
    <div data-testid="react-query-devtools">{String(initialIsOpen)}</div>
  )),
}));

// ua: компонент для перевірки доступності QueryClient
const QueryClientConsumer = () => {
  const queryClient = useQueryClient();

  return (
    <div data-testid="query-client">
      {queryClient ? 'available' : 'unavailable'}
    </div>
  );
};

describe('QueryProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Рендеринг дочірніх компонентів
  it('1. Повинен рендерити дочірні компоненти', () => {
    render(
      <QueryProvider>
        <div data-testid="child-component">Child content</div>
      </QueryProvider>,
    );

    expect(screen.getByTestId('child-component')).toBeTruthy();
    expect(screen.getByText('Child content')).toBeTruthy();
  });

  // 2. Надання QueryClient через контекст
  it('2. Повинен надавати QueryClient дочірнім компонентам', () => {
    render(
      <QueryProvider>
        <QueryClientConsumer />
      </QueryProvider>,
    );

    expect(screen.getByTestId('query-client').textContent).toBe('available');
  });

  // 3. Рендеринг React Query Devtools
  it('3. Повинен рендерити ReactQueryDevtools', () => {
    render(
      <QueryProvider>
        <div>Content</div>
      </QueryProvider>,
    );

    expect(screen.getByTestId('react-query-devtools')).toBeTruthy();
  });

  // 4. Початковий стан Devtools
  it('4. Повинен закривати Devtools за замовчуванням', () => {
    render(
      <QueryProvider>
        <div>Content</div>
      </QueryProvider>,
    );

    expect(screen.getByTestId('react-query-devtools').textContent).toBe(
      'false',
    );
  });

  // 5. Налаштування React Query
  it('5. Повинен використовувати правильні налаштування запитів', () => {
    const ConfigConsumer = () => {
      const queryClient = useQueryClient();
      const defaults = queryClient.getDefaultOptions();

      return (
        <div
          data-testid="query-config"
          data-stale-time={defaults.queries?.staleTime}
          data-refetch-on-window-focus={String(
            defaults.queries?.refetchOnWindowFocus,
          )}
          data-retry={defaults.queries?.retry}
        />
      );
    };

    render(
      <QueryProvider>
        <ConfigConsumer />
      </QueryProvider>,
    );

    const config = screen.getByTestId('query-config');

    expect(config.getAttribute('data-stale-time')).toBe(String(60 * 1000));
    expect(config.getAttribute('data-refetch-on-window-focus')).toBe('false');
    expect(config.getAttribute('data-retry')).toBe('1');
  });

  // 6. Стабільність екземпляра QueryClient
  it('6. Повинен зберігати той самий QueryClient після повторного рендерингу', () => {
    const InstanceConsumer = () => {
      const queryClient = useQueryClient();

      return <div data-testid="query-instance">{String(queryClient)}</div>;
    };

    const { rerender } = render(
      <QueryProvider>
        <InstanceConsumer />
      </QueryProvider>,
    );

    const initialInstance = screen.getByTestId('query-instance').textContent;

    rerender(
      <QueryProvider>
        <InstanceConsumer />
      </QueryProvider>,
    );

    expect(screen.getByTestId('query-instance').textContent).toBe(
      initialInstance,
    );
  });
});
