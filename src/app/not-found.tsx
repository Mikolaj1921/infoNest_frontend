import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <h1 className="text-9xl font-bold text-primary/20">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-foreground">
        Page Not Found
      </h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Something went wrong. The page you are looking for does not exist or has
        been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all"
      >
        Come back Home
      </Link>
    </div>
  );
}
