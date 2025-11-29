import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const standaloneReceiptSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.string().min(1),
  reference: z.string().optional(),
  notes: z.string().optional()
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

    const receipts = await prisma.receipt.findMany({
      orderBy: { issuedAt: 'desc' },
      include: { 
        payment: { 
          include: { 
            invoice: {
              include: {
                customer: true
              }
            } 
          } 
        } 
      },
      where: {
        payment: {
          invoice: {
            businessId: session.user.businessId
          }
        }
      }
    });

    return NextResponse.json(receipts);
  } catch (error) {
    console.error('Receipts API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipts' },
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
    const validatedData = standaloneReceiptSchema.parse(data);

    // For standalone receipts, we need to create a payment first
    // This is a simplified approach - you might want to create a different flow
    // or add a flag to indicate standalone receipts
    
    // Generate receipt number
    const year = new Date().getFullYear();
    const sequence = await prisma.sequence.upsert({
      where: {
        kind_year: {
          kind: 'RECEIPT',
          year
        }
      },
      update: {
        next: { increment: 1 }
      },
      create: {
        kind: 'RECEIPT',
        year,
        next: 1
      }
    });

    const receiptNumber = `RCP-${year}-${String(sequence.next).padStart(4, '0')}`;

    return NextResponse.json({
      message: 'Standalone receipt creation requires invoice/payment link',
      suggestion: 'Create payment from invoice or use import feature',
      receiptNumber
    }, { status: 400 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid receipt data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create receipt error:', error);
    return NextResponse.json(
      { error: 'Failed to create receipt' },
      { status: 500 }
    );
  }
}
