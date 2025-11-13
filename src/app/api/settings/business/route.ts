import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeBusiness } from '@/lib/serializers';

export async function GET() {
  try {
    // Get the first business (for now, we only support one business)
    const business = await prisma.business.findFirst();

    if (!business) {
      return NextResponse.json(
        { error: 'No business found' },
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
    const data = await req.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    // Get the first business or create one if it doesn't exist
    const business = await prisma.business.upsert({
      where: { id: data.id || 'default' },
      update: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        currency: data.currency,
        taxRate: data.taxRate,
      },
      create: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        currency: data.currency || 'TZS',
        taxRate: data.taxRate || 0,
      },
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