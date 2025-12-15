import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // In a real app, verify Admin role here
    const session = await auth();
    // if (!session?.user?.email?.endsWith('@admin.com')) ... 

    const business = await prisma.business.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true }
        },
        _count: {
          select: {
            users: true,
            invoices: true,
            customers: true,
            items: true,
            expenses: true
          }
        }
      }
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Format for response
    const data = {
      ...business,
      stats: {
        users: business._count.users,
        invoices: business._count.invoices,
        customers: business._count.customers,
        items: business._count.items,
        expenses: business._count.expenses
      },
      owner: business.users.find(u => u.role === 'owner') || business.users[0] || {}
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch business error:', error);
    return NextResponse.json({ error: 'Failed to fetch business' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    // Verify admin...

    const businessId = id;

    // Perform cascading delete manually in a transaction since schema might be RESTRICT
    await prisma.$transaction(async (tx) => {
      // 1. Delete Invoice Items (linked to Invoices)
      // We find invoices first to delete their items efficiently? 
      // Or just delete where invoice.businessId = businessId
      // Prisma deleteMany supports filtering by relation!
      await tx.invoiceItem.deleteMany({
        where: {
          invoice: { businessId }
        }
      });

      // 2. Delete Receipts (linked to Payments)
      await tx.receipt.deleteMany({
        where: {
          payment: {
            invoice: { businessId }
          }
        }
      });

      // 3. Delete Payments (linked to Invoices)
      await tx.payment.deleteMany({
        where: {
          invoice: { businessId }
        }
      });

      // 4. Delete Invoices
      await tx.invoice.deleteMany({
        where: { businessId }
      });

      // 5. Delete Items (might be linked to InvoiceItems but we deleted those)
      // Check if Items are linked to anything else? No.
      await tx.item.deleteMany({
        where: { businessId }
      });

      // 6. Delete Expenses
      await tx.expense.deleteMany({
        where: { businessId }
      });

      // 7. Delete Customers
      // Invoices linked to Customers are gone.
      await tx.customer.deleteMany({
        where: { businessId }
      });

      // 8. Delete User Sessions & Accounts
      await tx.session.deleteMany({
        where: { user: { businessId } }
      });
      await tx.account.deleteMany({
        where: { user: { businessId } }
      });

      // 9. Delete Users
      await tx.user.deleteMany({
        where: { businessId }
      });

      // 10. Finally, delete Business
      await tx.business.delete({
        where: { id: businessId }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete business error:', error);
    return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 });
  }
}
