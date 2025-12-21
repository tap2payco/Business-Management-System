import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { serializeExpense } from '@/lib/serializers';

export const dynamic = 'force-dynamic';

const expenseSchema = z.object({
  date: z.string().or(z.date()),
  amount: z.number().positive(),
  description: z.string().min(1),
  category: z.string().min(1),
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

    const expenses = await prisma.expense.findMany({
      where: {
        businessId: session.user.businessId
      },
      orderBy: {
        date: 'desc'
      },
      select: {
        id: true,
        date: true,
        amount: true,
        description: true,
        category: true,
        reference: true,
        createdAt: true,
        updatedAt: true,
        notes: true
      }
    });

    const safe = expenses.map((e: any) => serializeExpense(e));

    return NextResponse.json(safe);
  } catch (error) {
    console.error('Expenses API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
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
    console.log('Received expense data:', JSON.stringify(data, null, 2));
    
    const validatedData = expenseSchema.parse(data);
    console.log('Validated expense data:', JSON.stringify(validatedData, null, 2));

    const expense = await prisma.expense.create({
      data: {
        businessId: session.user.businessId,
        date: new Date(validatedData.date),
        amount: validatedData.amount,
        description: validatedData.description,
        category: validatedData.category,
        reference: validatedData.reference || null,
        notes: validatedData.notes || null
      }
    });
    
    console.log('Created expense:', expense.id);
    return NextResponse.json(serializeExpense(expense));
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', JSON.stringify(error.errors, null, 2));
      return NextResponse.json(
        { error: 'Invalid expense data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create expense error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create expense' },
      { status: 500 }
    );
  }
}