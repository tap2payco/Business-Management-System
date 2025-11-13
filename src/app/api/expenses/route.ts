import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { serializeExpense } from '@/lib/serializers';

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
        updatedAt: true
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
    const { date, amount, description, category, reference } = data;

  const expense = await prisma.expense.create({
      data: {
        businessId: session.user.businessId,
        date: new Date(date),
        amount,
        description,
        category,
        reference
      }
    });
    return NextResponse.json(serializeExpense(expense));
  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}