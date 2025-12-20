import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const quoteUpdateSchema = z.object({
  customerId: z.string().optional(),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED']).optional(),
  expiryDate: z.string().datetime().optional(),
  validUntil: z.string().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string().optional(),
    description: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string().default('pcs'),
    unitPrice: z.number().positive(),
    taxRate: z.number().min(0).max(1),
  })).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const quote = await prisma.quote.findFirst({
      where: {
        id,
        businessId: session.user.businessId,
      },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Serialize Decimal fields
    const serialized = {
      ...quote,
      subtotal: Number(quote.subtotal),
      taxTotal: Number(quote.taxTotal),
      grandTotal: Number(quote.grandTotal),
      items: quote.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate),
        lineTotal: Number(item.lineTotal),
      })),
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Get quote error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id,
        businessId: session.user.businessId,
      },
    });

    if (!existingQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Cannot edit converted quotes
    if (existingQuote.status === 'CONVERTED') {
      return NextResponse.json(
        { error: 'Cannot edit converted quotes' },
        { status: 400 }
      );
    }

    const data = await req.json();
    const validated = quoteUpdateSchema.parse(data);

    // If items are provided, recalculate totals
    let updateData: any = {
      customerId: validated.customerId,
      status: validated.status,
      expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : undefined,
      validUntil: validated.validUntil,
      notes: validated.notes,
      terms: validated.terms,
    };

    if (validated.items) {
      const items = validated.items.map(item => {
        const lineTotal = item.quantity * item.unitPrice;
        return {
          ...item,
          lineTotal,
        };
      });

      const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
      const taxTotal = items.reduce(
        (sum, item) => sum + item.lineTotal * item.taxRate,
        0
      );
      const grandTotal = subtotal + taxTotal;

      updateData = {
        ...updateData,
        subtotal,
        taxTotal,
        grandTotal,
      };

      // Delete existing items and create new ones
      await prisma.quoteItem.deleteMany({
        where: { quoteId: id },
      });

      await prisma.quoteItem.createMany({
        data: items.map(item => ({
          quoteId: id,
          itemId: item.itemId,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          lineTotal: item.lineTotal,
        })),
      });
    }

    const quote = await prisma.quote.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        customer: true,
      },
    });

    // Serialize response
    const serialized = {
      ...quote,
      subtotal: Number(quote.subtotal),
      taxTotal: Number(quote.taxTotal),
      grandTotal: Number(quote.grandTotal),
      items: quote.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate),
        lineTotal: Number(item.lineTotal),
      })),
    };

    return NextResponse.json(serialized);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid quote data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update quote error:', error);
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const existingQuote = await prisma.quote.findFirst({
      where: {
        id,
        businessId: session.user.businessId,
      },
    });

    if (!existingQuote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Can only delete DRAFT quotes
    if (existingQuote.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Can only delete draft quotes' },
        { status: 400 }
      );
    }

    await prisma.quote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete quote error:', error);
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    );
  }
}
