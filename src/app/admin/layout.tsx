import React from 'react';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/signin');
  }

  // Verify super admin status directly from DB
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true }
  });

  if (!user?.isSuperAdmin) {
    redirect('/dashboard'); // Redirect normal users back to their dashboard
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-red-400">Super Admin Dashboard</h1>
            <span className="px-2 py-1 rounded text-xs bg-slate-800 text-gray-400 border border-slate-700">
              System Management
            </span>
          </div>
          <nav>
            <Link
              href="/dashboard"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
            >
              <span>←</span> Back to App
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
