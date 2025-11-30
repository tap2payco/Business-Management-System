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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-red-400">Super Admin</h1>
          <p className="text-xs text-gray-400 mt-1">System Management</p>
        </div>
        <nav className="mt-6">
          <Link
            href="/admin"
            className="block px-6 py-3 text-gray-300 hover:bg-slate-800 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/businesses"
            className="block px-6 py-3 text-gray-300 hover:bg-slate-800 hover:text-white"
          >
            Businesses
          </Link>
          <div className="mt-8 px-6">
            <div className="border-t border-slate-700 pt-4">
              <Link
                href="/dashboard"
                className="block py-2 text-sm text-blue-400 hover:text-blue-300"
              >
                ← Back to App
              </Link>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
