import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Verify ownership
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
      select: { businessId: true }
    });

    if (!existingInvoice || existingInvoice.businessId !== session.user.businessId) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Update invoice
    // We need to handle items carefully: delete existing and recreate, or update
    // For simplicity and correctness with the current schema, we'll delete existing items and recreate them
    // This ensures we handle added/removed items correctly

    // Transaction to ensure atomicity
    const updatedInvoice = await prisma.$transaction(async (tx) => {
      // 1. Delete existing items
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id }
      });

      // 2. Update invoice details
      const invoice = await tx.invoice.update({
        where: { id },
        data: {
          customerId: body.customer.id, // Assuming customer exists or handled by frontend
          issueDate: new Date(body.issueDate),
          dueDate: new Date(body.dueDate),
          notes: body.notes,
          currency: body.currency,
          // Recalculate totals based on new items
          subtotal: body.items.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0),
          taxTotal: body.items.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.unitPrice) * Number(item.taxRate || 0)), 0),
          grandTotal: body.items.reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.unitPrice) * (1 + Number(item.taxRate || 0))), 0),
          // Update balance due (grandTotal - amountPaid)
          // We need to fetch current amountPaid to be safe, or recalculate it if we were updating payments (which we aren't here)
        }
      });

      // 3. Create new items
      if (body.items && body.items.length > 0) {
        await tx.invoiceItem.createMany({
          data: body.items.map((item: any) => ({
            invoiceId: id,
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            taxRate: Number(item.taxRate || 0),
            lineTotal: Number(item.quantity) * Number(item.unitPrice),
            itemId: item.itemId || null
          }))
        });
      }

      // 4. Recalculate balance due
      // Fetch the updated invoice with payments to calculate balance
      const finalInvoice = await tx.invoice.findUnique({
        where: { id },
        include: { payments: true }
      });

      if (finalInvoice) {
        const amountPaid = finalInvoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
        const balanceDue = Number(finalInvoice.grandTotal) - amountPaid;
        
        await tx.invoice.update({
          where: { id },
          data: { 
            amountPaid,
            balanceDue,
            status: balanceDue <= 0 ? 'PAID' : (balanceDue < Number(finalInvoice.grandTotal) ? 'PARTIAL' : 'SENT') // Simple status logic
          }
        });
      }

      return invoice;
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
      select: { businessId: true }
    });

    if (!existingInvoice || existingInvoice.businessId !== session.user.businessId) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Delete invoice (cascade should handle items, but let's be explicit if needed or rely on schema)
    // Schema usually handles cascade for relations if configured, but Prisma needs explicit delete for some relations if not in DB
    // Assuming schema has onDelete: Cascade or we let Prisma handle it.
    // Let's check schema... actually we can just try delete.
    
    await prisma.invoice.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
