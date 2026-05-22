// ua: import хуків та сервісів
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ua: Middleware для захисту priv-routes та перенаправлення auth-users з auth pages
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl; // ua: поточний шлях

  const token = request.cookies.get('accessToken')?.value; // token from cookies (subt 2)

  //ua: визначення типів маршрутів
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isPrivatePage =
    pathname.startsWith('/workspaces') || pathname.startsWith('/profile');

  // ua: сценаріЇ
  if (isPrivatePage && !token) {
    const loginUrl = new URL('/login', request.url);
    // save the current path
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/workspaces', request.url));
  }

  // skip middleware for other routes
  return NextResponse.next();
}

// ua: matcher - шляхи на які буде діяти middleware (subt 3)
export const config = {
  matcher: ['/login', '/register', '/workspaces/:path*', '/profile/:path*'],
};
