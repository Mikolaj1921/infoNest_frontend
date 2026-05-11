// ua: React Query Provider

'use client';

// ua: QueryProvider відповідає за налаштування та надання контексту
// для React Query у всьому додатку. Створює екземпляр QueryClient (з налаштуваннями по дефолту)

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// ua: ReactQueryDevtools - дозволяє відстежувати та налагоджувати запити React Query у real time.
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // ua: по дефолту для всіх запитів React Query.
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  // ua: QueryClientProvider надає контекст для всіх компонентів, які юзає React Query.
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
