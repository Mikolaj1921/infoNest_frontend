import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

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

// ua: базова структура
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
