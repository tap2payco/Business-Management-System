import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { serializeItem } from '@/lib/serializers';

export const dynamic = 'force-dynamic';

const itemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  unitPrice: z.number().positive(),
  taxRate: z.number().min(0).max(1)
});

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.businessId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const items = await prisma.item.findMany({
      where: {
        businessId: session.user.businessId
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        unitPrice: true,
        taxRate: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const safe = items.map((it: any) => serializeItem(it));

    return NextResponse.json(safe);
  } catch (error) {
    console.error('Items API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.businessId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await req.json();
    const validatedData = itemSchema.parse(data);

    const item = await prisma.item.create({
      data: {
        ...validatedData,
        businessId: session.user.businessId
      }
    });
    return NextResponse.json(serializeItem(item));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid item data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create item error:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}