
// ...existing code...
// This page must be a server component for data fetching
import { prisma } from '@/lib/prisma';
import InvoiceClientView from './InvoiceClientView';

export default async function InvoiceView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inv = await prisma.invoice.findUnique({ 
    where: { id }, 
    include: { 
      items: true, 
      payments: { 
        include: { receipt: true } 
      }, 
      customer: true,
      business: true
    } 
  });
  if (!inv) return <div>Not found</div>;

  // Serialize Decimal and Date fields to plain JS values so they can be
  // passed safely into client components.
  const safeInv = {
    id: inv.id,
    number: inv.number,
    status: inv.status,
    currency: inv.currency || (inv.business?.currency ?? 'TZS'),
    issueDate: inv.issueDate ? inv.issueDate.toISOString() : null,
    dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
    notes: inv.notes ?? null,
    items: inv.items.map((it: any) => ({
      id: it.id,
      description: it.description,
      quantity: Number(it.quantity),
      unitPrice: Number(it.unitPrice),
      taxRate: Number(it.taxRate || 0),
      lineTotal: Number(it.lineTotal ?? (Number(it.quantity) * Number(it.unitPrice)))
    })),
    payments: inv.payments.map((p: any) => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method,
      paidAt: p.paidAt ? new Date(p.paidAt).toISOString() : null,
      receipt: p.receipt ? { id: p.receipt.id, number: p.receipt.number } : null
    })),
    customer: inv.customer ? { id: inv.customer.id, name: inv.customer.name, address: inv.customer.address || null } : null,
    subtotal: Number(inv.subtotal ?? inv.items.reduce((s: number, it: any) => s + Number(it.quantity) * Number(it.unitPrice), 0)),
    taxTotal: Number(inv.taxTotal ?? inv.items.reduce((s: number, it: any) => s + Number(it.quantity) * Number(it.unitPrice) * Number(it.taxRate || 0), 0)),
    grandTotal: Number(inv.grandTotal ?? 0),
    amountPaid: Number(inv.amountPaid ?? inv.payments.reduce((s: number, p: any) => s + Number(p.amount), 0)),
    balanceDue: Number(inv.balanceDue ?? 0)
  };

  return <InvoiceClientView inv={safeInv} />;
}

// Create a new file InvoiceClientView.tsx as a client component for payment form and UI logic
