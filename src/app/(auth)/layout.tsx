import Link from 'next/link';
// icons components
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';

// ua: спільний макет для публічних сторінок авторизації (Login/Register)
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-background selection:bg-primary/30">
      {/* gradient on background */}
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden">
        <div className="h-[530px] w-[600px] translate-y-2/5 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* header - logo */}
      <header className="relative z-10 flex h-16 items-center px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <FontAwesomeIcon icon={faFolderOpen} className="h-4 w-4" />
          </div>
          <span className="bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
            infoNest
          </span>
        </Link>
      </header>

      {/* center - forms login & register */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div>{children}</div>
      </main>
    </div>
  );
}
