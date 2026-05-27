import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;
// providers
import QueryProvider from '@/providers/QueryProvider';
import AuthProvider from '@/providers/AuthProvider';
// toaster
import { Toaster } from 'sonner';
// ua: індикатор завантаження сторінок при навігації
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

// meta
export const metadata: Metadata = {
  title: {
    default: 'infoNest',
    template: '%s | infoNest', //  дозволить ст мати назви типу "Воркспейси | infoNest"
  },
  description: 'Your second brain for structured knowledge management.',
  icons: {
    icon: '/favicon.ico',
  },
};

// ua: базова структура (upd: з провайдером - обгортка всього додатку в QueryProvider)
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className="dark">
      <body className={inter.className}>
        <NextTopLoader
          color="var(--primary)"
          initialPosition={0.08}
          crawlSpeed={200}
          height={2}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
        />
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
        <Toaster
          theme="dark"
          position="bottom-right"
          expand={false}
          richColors
          toastOptions={{
            style: {
              background: 'var(--card)',
              borderColor: 'var(--border)',
              color: 'var(--foreground)',
            },
          }}
        />
      </body>
    </html>
  );
}
