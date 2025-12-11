
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getNextNumber } from '@/lib/numbering';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('Creating invoice with payload:', JSON.stringify(payload, null, 2));
    const taxDefault = Number(process.env.DEFAULT_TAX_RATE ?? 0);
    const items = payload.items.map((it: any) => ({ ...it, taxRate: typeof it.taxRate === 'number' ? it.taxRate : taxDefault }));
    const subtotal = items.reduce((s: number, it: any) => s + it.quantity * it.unitPrice, 0);
    const taxTotal = items.reduce((s: number, it: any) => s + (it.quantity * it.unitPrice) * (it.taxRate ?? taxDefault), 0);
    const grandTotal = subtotal + taxTotal;
    const number = await getNextNumber('invoice');
    
    // Require businessId - don't create new businesses
    if (!payload.businessId) {
      throw new Error('Business ID is required');
    }
    
    const invoice = await prisma.$transaction(async (tx) => {
      const bizId = payload.businessId;
      const custId = payload.customer.id ?? (await tx.customer.create({ data: { businessId: bizId, name: payload.customer.name, email: payload.customer.email, phone: payload.customer.phone, address: payload.customer.address } })).id;
      const inv = await tx.invoice.create({ data: { businessId: bizId, customerId: custId, number, issueDate: new Date(payload.issueDate), dueDate: new Date(payload.dueDate), currency: payload.currency, notes: payload.notes, subtotal, taxTotal, grandTotal, amountPaid: 0, balanceDue: grandTotal, status: 'SENT', items: { create: items.map((it: any) => ({ itemId: it.itemId || undefined, description: it.description, quantity: it.quantity, unitPrice: it.unitPrice, taxRate: it.taxRate ?? taxDefault, lineTotal: it.quantity * it.unitPrice })) } } });
      return inv;
    });
    return NextResponse.json({ id: invoice.id, number: invoice.number });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
