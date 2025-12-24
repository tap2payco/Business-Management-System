import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  session: { 
    strategy: 'jwt',
    maxAge: 15 * 60 // 15 minutes in seconds
  },
  pages: {
    signIn: '/signin',
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [], // Providers are configured in auth.ts
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = nextUrl.pathname.startsWith('/signin') || nextUrl.pathname.startsWith('/signup');
      const isApiRoute = nextUrl.pathname.startsWith('/api');
      const isPublicRoute = isAuthRoute || isApiRoute;

      if (isPublicRoute) {
        return true;
      }

      if (!isLoggedIn) {
        return false; // Redirect unauthenticated users to login page
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
