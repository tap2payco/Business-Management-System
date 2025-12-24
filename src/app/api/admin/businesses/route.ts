import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // Protect route
  const authResult = await requireSuperAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            invoices: true,
            customers: true
          }
        },
        users: {
          where: { role: 'OWNER' },
          select: {
            name: true,
            phone: true
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format data for frontend
    const formattedBusinesses = businesses.map(b => ({
      id: b.id,
      name: b.name,
      email: b.email,
      phone: b.phone,
      createdAt: b.createdAt,
      stats: {
        users: b._count.users,
        invoices: b._count.invoices,
        customers: b._count.customers
      },
      owner: b.users[0] || { name: 'Unknown', phone: 'Unknown' }
    }));

    return NextResponse.json(formattedBusinesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}
