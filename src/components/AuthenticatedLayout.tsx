'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MainNav } from './MainNav';
import { UserNav } from './UserNav';
import type { Session } from 'next-auth';

export function AuthenticatedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const isAuthPage = pathname?.startsWith('/signin') || pathname?.startsWith('/signup');

  useEffect(() => {
    if (status === 'loading') return;

    if (!session && !isAuthPage) {
      router.push('/signin');
    } else if (session && isAuthPage) {
      router.push('/dashboard');
    }
  }, [session, status, isAuthPage, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthPage) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        {children}
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <MainNav />
      <div className="flex-1">
        <header className="border-b bg-white">
          <div className="flex h-16 items-center px-8">
            <div className="ml-auto flex items-center space-x-4">
              <UserNav user={session.user} />
            </div>
          </div>
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}