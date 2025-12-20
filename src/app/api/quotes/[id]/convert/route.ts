import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(
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
    const quote = await prisma.quote.findFirst({
      where: {
        id,
        businessId: session.user.businessId,
      },
      include: {
        items: true,
        customer: true,
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Must be ACCEPTED to convert
    if (quote.status !== 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Only accepted quotes can be converted to invoices' },
        { status: 400 }
      );
    }

    // Generate invoice number
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await prisma.invoice.count({
      where: {
        businessId: session.user.businessId,
        number: {
          startsWith: `INV-${dateStr}`,
        },
      },
    });
    const invoiceNumber = `INV-${dateStr}-${String(count + 1).padStart(3, '0')}`;

    // Get business for currency
    const business = await prisma.business.findUnique({
      where: { id: session.user.businessId },
    });

    // Create invoice from quote
    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        businessId: session.user.businessId,
        customerId: quote.customerId,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        currency: business?.currency || 'TZS',
        status: 'UNPAID',
        notes: quote.notes,
        subtotal: quote.subtotal,
        taxTotal: quote.taxTotal,
        grandTotal: quote.grandTotal,
        amountPaid: 0,
        balanceDue: quote.grandTotal,
        items: {
          create: quote.items.map(item => ({
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

    // Update quote status to CONVERTED
    await prisma.quote.update({
      where: { id },
      data: {
        status: 'CONVERTED',
      },
    });

    // Serialize response
    const serialized = {
      ...invoice,
      subtotal: Number(invoice.subtotal),
      taxTotal: Number(invoice.taxTotal),
      grandTotal: Number(invoice.grandTotal),
      amountPaid: Number(invoice.amountPaid),
      balanceDue: Number(invoice.balanceDue),
      items: invoice.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate),
        lineTotal: Number(item.lineTotal),
      })),
    };

    return NextResponse.json(serialized, { status: 201 });
  } catch (error) {
    console.error('Convert quote error:', error);
    return NextResponse.json(
      { error: 'Failed to convert quote to invoice' },
      { status: 500 }
    );
  }
}
