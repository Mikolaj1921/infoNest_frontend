import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';

export const MarketingFooter = () => {
  return (
    <footer className="border-t border-color-800 bg-background py-12">
      <div className="mx-auto max-w-7xl px-6 ">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-2 text-sm ">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FontAwesomeIcon icon={faFolderOpen} className="h-4 w-4" />
            </div>
            <span>
              &copy; {new Date().getFullYear()} infoNest. Build for
              productivity.
            </span>
          </div>

          {/* Links */}
          <nav className="flex gap-8">
            <Link
              href="https://github.com"
              className="text-sm text-slate-400 hover:text-slate-50 transition-colors duration-300"
            >
              GitHub
            </Link>
            <Link
              href="https://mikolajmelnyk.pl"
              className="text-sm text-slate-400 hover:text-slate-50 transition-colors duration-300"
            >
              Portfolio
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-slate-400 hover:text-slate-50 transition-colors duration-300"
            >
              Privacy Policy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};
