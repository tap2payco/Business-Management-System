import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { z } from 'zod';
import { serializeCustomer } from '@/lib/serializers';

const customerSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['INDIVIDUAL', 'COMPANY']).default('INDIVIDUAL'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
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

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        businessId: session.user.businessId
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeCustomer(customer));
  } catch (error) {
    console.error('Get customer error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
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
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        businessId: session.user.businessId
      }
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const data = await req.json();
    const validatedData = customerSchema.parse(data);

    const customer = await prisma.customer.update({
      where: { id },
      data: validatedData
    });

    return NextResponse.json(serializeCustomer(customer));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid customer data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Update customer error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
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
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        businessId: session.user.businessId
      }
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Check if customer has invoices
    const invoiceCount = await prisma.invoice.count({
      where: { customerId: id }
    });

    if (invoiceCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing invoices', count: invoiceCount },
        { status: 409 }
      );
    }

    await prisma.customer.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
