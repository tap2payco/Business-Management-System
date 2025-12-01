import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBusiness } from '@/lib/serializers';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const business = await prisma.business.findUnique({
      where: { id: session.user.businessId }
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeBusiness(business));
  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business details' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    const business = await prisma.business.update({
      where: { id: session.user.businessId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        currency: data.currency,
        taxRate: data.taxRate,
        logo: data.logo,
        invoiceTemplate: data.invoiceTemplate,
        receiptTemplate: data.receiptTemplate,
      }
    });

    return NextResponse.json(serializeBusiness(business));
  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json(
      { error: 'Failed to update business details' },
      { status: 500 }
    );
  }
}