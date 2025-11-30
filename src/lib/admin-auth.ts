import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * Check if the current user is a super admin.
 * Returns the user object if authorized, null otherwise.
 */
export async function getSuperAdmin() {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isSuperAdmin: true, id: true, name: true, email: true }
  });

  if (!user || !user.isSuperAdmin) {
    return null;
  }

  return user;
}

/**
 * Middleware-like function to protect API routes.
 * Usage:
 * const admin = await requireSuperAdmin();
 * if (admin instanceof NextResponse) return admin;
 */
export async function requireSuperAdmin() {
  const admin = await getSuperAdmin();
  
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized: Super Admin access required' },
      { status: 403 }
    );
  }
  
  return admin;
}
