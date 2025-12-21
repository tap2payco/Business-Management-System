import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { serializeExpense } from '@/lib/serializers';

const expenseSchema = z.object({
  date: z.string().or(z.date()),
  amount: z.number().positive(),
  description: z.string().min(1),
  category: z.enum(['SALARY', 'RENT', 'ADVERTISING', 'FUEL', 'ALLOWANCE', 'STATIONARY', 'UTILITIES', 'COMMUNICATION', 'COGS', 'TRANSPORT', 'MISCELLANEOUS']),
  reference: z.string().optional(),
  notes: z.string().optional()
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

    const expense = await prisma.expense.findFirst({
      where: {
        id,
        businessId: session.user.businessId
      }
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeExpense(expense));
  } catch (error) {
    console.error('Get expense error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
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
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        businessId: session.user.businessId
      }
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    const data = await req.json();
    const validatedData = expenseSchema.parse(data);

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        date: new Date(validatedData.date),
        amount: validatedData.amount,
        description: validatedData.description,
        category: validatedData.category as any,
        reference: validatedData.reference,
        notes: validatedData.notes
      }
    });

    return NextResponse.json(serializeExpense(expense));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid expense data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update expense error:', error);
    return NextResponse.json(
      { error: 'Failed to update expense' },
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
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        businessId: session.user.businessId
      }
    });

    if (!existingExpense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    await prisma.expense.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete expense error:', error);
    return NextResponse.json(
      { error: 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
