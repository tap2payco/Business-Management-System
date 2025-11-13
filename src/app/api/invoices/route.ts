
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getNextNumber } from '@/lib/numbering';
export async function POST(req: NextRequest) {
  const payload = await req.json();
  const taxDefault = Number(process.env.DEFAULT_TAX_RATE ?? 0);
  const items = payload.items.map((it: any) => ({ ...it, taxRate: typeof it.taxRate === 'number' ? it.taxRate : taxDefault }));
  const subtotal = items.reduce((s: number, it: any) => s + it.quantity * it.unitPrice, 0);
  const taxTotal = items.reduce((s: number, it: any) => s + (it.quantity * it.unitPrice) * (it.taxRate ?? taxDefault), 0);
  const grandTotal = subtotal + taxTotal;
  const number = await getNextNumber('invoice');
  const invoice = await prisma.$transaction(async (tx) => {
    const bizId = payload.businessId ?? (await tx.business.create({ data: { name: 'My Business', currency: process.env.DEFAULT_CURRENCY || 'TZS', taxRate: Number(process.env.DEFAULT_TAX_RATE || 0) } })).id;
    const custId = payload.customer.id ?? (await tx.customer.create({ data: { businessId: bizId, name: payload.customer.name, email: payload.customer.email, phone: payload.customer.phone, address: payload.customer.address } })).id;
    const inv = await tx.invoice.create({ data: { businessId: bizId, customerId: custId, number, issueDate: new Date(payload.issueDate), dueDate: new Date(payload.dueDate), currency: payload.currency, notes: payload.notes, subtotal, taxTotal, grandTotal, amountPaid: 0, balanceDue: grandTotal, status: 'SENT', items: { create: items.map((it: any) => ({ description: it.description, quantity: it.quantity, unitPrice: it.unitPrice, taxRate: it.taxRate ?? taxDefault, lineTotal: it.quantity * it.unitPrice })) } } });
    return inv;
  });
  return NextResponse.json({ id: invoice.id, number: invoice.number });
}
