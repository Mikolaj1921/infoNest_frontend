import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// eslint-disable-next-line
export function middleware(request: NextRequest) {
  // тимчасово скіп всі запити далі
  return NextResponse.next();
}

// Налаштування рутів, які middleware має ігнорувати (поки тільки статичні файли)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
