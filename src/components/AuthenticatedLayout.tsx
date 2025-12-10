'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session && !isAuthPage) {
      router.push('/signin');
    } else if (session && isAuthPage) {
      router.push('/dashboard');
    }
  }, [session, status, isAuthPage, router]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
      <MainNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b bg-white sticky top-0 z-30">
          <div className="flex h-16 items-center px-4 md:px-8">
            {/* Hamburger menu button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 mr-4"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="ml-auto flex items-center space-x-4">
              <UserNav user={session.user} />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}