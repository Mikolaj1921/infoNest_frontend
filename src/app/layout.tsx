import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'infoNest | Your Second Brain',
  description: 'Organize your knowledge in structured workspaces.',
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
