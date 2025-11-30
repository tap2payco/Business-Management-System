
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export default auth((req) => {
  // Let auth pages and API routes handle their own auth
  const publicPaths = ['/signin', '/signup', '/api', '/super-admin-setup'];
  if (publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Require auth for all other routes
  const isAuth = !!req.auth;
  if (!isAuth) {
    const url = new URL('/signin', req.nextUrl.origin);
    url.searchParams.set('callbackUrl', encodeURIComponent(req.nextUrl.href));
    return Response.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
