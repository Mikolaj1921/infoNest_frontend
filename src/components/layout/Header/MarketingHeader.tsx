import Link from 'next/link';

export const MarketingHeader = () => {
  return (
    <header className="fixed top-0 z-50 w-full bg-background border-b border-color-800 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl  text-brand shadow-inner">
            🪹
          </div>
          <span className="text-white text-transparent">infoNest</span>
        </div>
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="#features"
            className="text-sm font-medium text-slate-400 hover:text-slate-50 transition-colors"
          >
            Features
          </Link>
          <Link
            href="#docs"
            className="text-sm font-medium text-slate-400 hover:text-slate-50 transition-colors"
          >
            Documentation
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-200 hover:text-white px-4 py-2"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand/20 transition-all  hover:scale-105 active:scale-95"
          >
            Sign Up Free
          </Link>
        </div>
      </div>
    </header>
  );
};
