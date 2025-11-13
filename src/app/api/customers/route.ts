import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable()
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

    const customers = await prisma.customer.findMany({
      where: {
        businessId: session.user.businessId
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            invoices: true
          }
        }
      }
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Customers API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
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
    const validatedData = customerSchema.parse(data);

    const customer = await prisma.customer.create({
      data: {
        ...validatedData,
        businessId: session.user.businessId
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid customer data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}