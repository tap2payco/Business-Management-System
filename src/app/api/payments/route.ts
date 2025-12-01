import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { serializePayment } from '@/lib/serializers';

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
    // Create payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method,
        reference,
        paidAt: new Date()
      }
    });
    return NextResponse.json(serializePayment(payment));
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}