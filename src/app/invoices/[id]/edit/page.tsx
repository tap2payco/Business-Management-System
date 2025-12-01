import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import EditInvoiceClient from './EditInvoiceClient';

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.businessId) {
    redirect('/signin');
  }

  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      customer: true
    }
  });

  if (!invoice || invoice.businessId !== session.user.businessId) {
    return <div>Invoice not found</div>;
  }

  // Serialize data for client component
  const serializedInvoice = {
    id: invoice.id,
    businessId: invoice.businessId,
    currency: invoice.currency,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    notes: invoice.notes || '',
    customer: {
      id: invoice.customer.id,
      name: invoice.customer.name,
      email: invoice.customer.email || '',
      phone: invoice.customer.phone || '',
      address: invoice.customer.address || ''
    },
    items: invoice.items.map(item => ({
      id: item.id,
      itemId: item.itemId || undefined,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      taxRate: Number(item.taxRate)
    }))
  };

  return <EditInvoiceClient invoice={serializedInvoice} />;
}
