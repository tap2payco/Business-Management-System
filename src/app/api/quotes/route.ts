import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const quoteSchema = z.object({
  customerId: z.string().min(1),
  issueDate: z.string().datetime().optional(),
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
  })).min(1),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    const quotes = await prisma.quote.findMany({
      where: {
        businessId: session.user.businessId,
        ...(status && { status: status as any }),
        ...(customerId && { customerId }),
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Serialize Decimal fields
    const serialized = quotes.map(q => ({
      ...q,
      subtotal: Number(q.subtotal),
      taxTotal: Number(q.taxTotal),
      grandTotal: Number(q.grandTotal),
      items: q.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate),
        lineTotal: Number(item.lineTotal),
      })),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Get quotes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const validated = quoteSchema.parse(data);

    // Generate quote number
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await prisma.quote.count({
      where: {
        businessId: session.user.businessId,
        number: {
          startsWith: `QT-${dateStr}`,
        },
      },
    });
    const quoteNumber = `QT-${dateStr}-${String(count + 1).padStart(3, '0')}`;

    // Calculate totals
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

    // Create quote with items
    const quote = await prisma.quote.create({
      data: {
        number: quoteNumber,
        businessId: session.user.businessId,
        customerId: validated.customerId,
        issueDate: validated.issueDate ? new Date(validated.issueDate) : new Date(),
        expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : null,
        validUntil: validated.validUntil,
        notes: validated.notes,
        terms: validated.terms,
        subtotal,
        taxTotal,
        grandTotal,
        items: {
          create: items.map(item => ({
            itemId: item.itemId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            lineTotal: item.lineTotal,
          })),
        },
      },
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

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid quote data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create quote error:', error);
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    );
  }
}
