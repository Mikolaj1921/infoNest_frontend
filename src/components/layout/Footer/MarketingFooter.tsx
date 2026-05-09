import Link from 'next/link';

export const MarketingFooter = () => {
  return (
    <footer className="border-t border-color-800 bg-background py-12">
      <div className="mx-auto max-w-7xl px-6 ">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-2 text-sm ">
            <span className="text-lg">🪹</span>
            <span>
              &copy; {new Date().getFullYear()} infoNest. Build for
              productivity.
            </span>
          </div>

          {/* Links */}
          <nav className="flex gap-8">
            <Link
              href="https://github.com"
              className="text-sm text-slate-400 hover:text-slate-50 transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="https://mikolajmelnyk.pl"
              className="text-sm text-slate-400 hover:text-slate-50 transition-colors"
            >
              Portfolio
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-slate-400 hover:text-slate-50 transition-colors"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};
