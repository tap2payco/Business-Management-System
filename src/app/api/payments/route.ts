import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { serializePayment } from '@/lib/serializers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payments = await prisma.payment.findMany({
      where: {
        invoice: {
          businessId: session.user.businessId
        }
      },
      include: {
        invoice: {
          select: {
            id: true,
            number: true,
            customer: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        paidAt: 'desc'
      }
    });

    const safe = payments.map((p: any) => serializePayment(p));

    return NextResponse.json(safe);
  } catch (error) {
    console.error('Payments API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const data = await req.json();
    const { invoiceId, amount, method, reference } = data;
    
    if (!invoiceId || !amount || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get current invoice state
      const invoice = await tx.invoice.findUnique({ 
        where: { id: invoiceId }
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // 2. Create Payment
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount,
          method,
          reference,
          paidAt: new Date()
        }
      });

      // 3. Recalculate Invoice Totals
      const currentPaid = Number(invoice.amountPaid) || 0;
      const newPaid = currentPaid + Number(amount);
      const newBalance = Number(invoice.grandTotal) - newPaid;
      
      // Determine new status
      let newStatus = invoice.status;
      if (newBalance <= 0) {
        newStatus = 'PAID';
      } else if (newPaid > 0) {
        newStatus = 'PARTIALLY_PAID';
      }

      // Update Invoice
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: newPaid,
          balanceDue: newBalance,
          status: newStatus
        }
      });

      // 4. Create Receipt automatically
      const { getNextNumber } = await import('@/lib/numbering');
      const receiptNumber = await getNextNumber('receipt');
      
      const receipt = await tx.receipt.create({
        data: {
          number: receiptNumber,
          paymentId: payment.id,
          issuedAt: new Date()
        }
      });

      return { payment, receipt };
    });

    return NextResponse.json(serializePayment(result.payment));
  } catch (error: any) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' }, 
      { status: 500 }
    );
  }
}