'use server';

import { prisma } from '@/lib/prisma';
import { serializePayment } from '@/lib/serializers';

export async function payInvoice(invoiceId: string, amount: number, method: string) {
  // Basic validation
  if (!invoiceId) throw new Error('invoiceId is required');
  const amt = Number(amount || 0);
  if (isNaN(amt) || amt <= 0) throw new Error('Invalid amount');

  // Create payment, receipt, and update invoice totals in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create payment
    const payment = await tx.payment.create({
      data: {
        invoiceId,
        amount: amt,
        method,
        paidAt: new Date()
      }
    });

    // Create receipt for payment
    // Find next receipt number (simple increment for demo, use Sequence for production)
    const lastReceipt = await tx.receipt.findMany({ orderBy: { issuedAt: 'desc' }, take: 1 });
    let nextNumber = 'R-0001';
    if (lastReceipt.length > 0) {
      const lastNum = lastReceipt[0].number;
      const num = parseInt(lastNum.replace(/\D/g, '')) + 1;
      nextNumber = `R-${String(num).padStart(4, '0')}`;
    }
    await tx.receipt.create({
      data: {
        paymentId: payment.id,
        number: nextNumber,
        issuedAt: new Date()
      }
    });

    // Recalculate invoice totals
    const invoice = await tx.invoice.findUnique({ where: { id: invoiceId }, include: { payments: true, items: true, business: true } });
    if (!invoice) throw new Error('Invoice not found');

    const amountPaid = invoice.payments.reduce((s, p) => s + Number(p.amount), 0) + amt;
    const subtotal = invoice.items.reduce((s, it) => s + Number(it.quantity) * Number(it.unitPrice), 0);
    const taxTotal = invoice.items.reduce((s, it) => s + Number(it.quantity) * Number(it.unitPrice) * Number(it.taxRate || 0), 0);
    const grandTotal = subtotal + taxTotal;
    const balanceDue = grandTotal - amountPaid;

    await tx.invoice.update({ where: { id: invoiceId }, data: { amountPaid: amountPaid, balanceDue } });

    const safePayment = serializePayment(payment);
    const safeInvoice = { id: invoiceId, amountPaid: Number(amountPaid), balanceDue: Number(balanceDue) };

    return { payment: safePayment, invoice: safeInvoice };
  });

  return result;
}