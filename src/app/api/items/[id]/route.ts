import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { serializeItem } from '@/lib/serializers';

const itemSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['GOODS', 'SERVICE']).default('GOODS'),
  description: z.string().optional(),
  unitPrice: z.number().positive(),
  taxRate: z.number().min(0).max(1),
  unit: z.string().default('pcs'),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.businessId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const item = await prisma.item.findFirst({
      where: {
        id,
        businessId: session.user.businessId
      }
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeItem(item));
  } catch (error) {
    console.error('Get item error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.businessId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existingItem = await prisma.item.findFirst({
      where: {
        id,
        businessId: session.user.businessId
      }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const data = await req.json();
    const validatedData = itemSchema.parse(data);

    const item = await prisma.item.update({
      where: { id },
      data: validatedData
    });

    return NextResponse.json(serializeItem(item));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid item data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update item error:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.businessId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existingItem = await prisma.item.findFirst({
      where: {
        id,
        businessId: session.user.businessId
      }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Check if item is used in any invoices
    const invoiceItemCount = await prisma.invoiceItem.count({
      where: { itemId: id }
    });

    if (invoiceItemCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete item that is used in invoices', count: invoiceItemCount },
        { status: 409 }
      );
    }

    await prisma.item.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete item error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
