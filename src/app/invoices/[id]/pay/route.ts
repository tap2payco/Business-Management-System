
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getNextNumber } from '@/lib/numbering';
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { amount, method, reference, paidAt } = body;
  const out = await prisma.$transaction(async (tx) => {
    const inv = await tx.invoice.findUnique({ where: { id } });
    if (!inv) return { status: 404, json: { error: 'Invoice not found' } };
    const p = await tx.payment.create({ data: { invoiceId: inv.id, amount, method, reference, paidAt: paidAt ? new Date(paidAt) : new Date() } });
    const newPaid = Number(inv.amountPaid) + Number(amount);
    const newBal  = Number(inv.grandTotal) - newPaid;
    const status = newBal <= 0 ? 'PAID' : newPaid > 0 ? 'PARTIALLY_PAID' : inv.status;
    await tx.invoice.update({ where: { id: inv.id }, data: { amountPaid: newPaid, balanceDue: Math.max(0, newBal), status } });
    const rctNo = await getNextNumber('receipt');
    const receipt = await tx.receipt.create({ data: { paymentId: p.id, number: rctNo } });
    return { status: 200, json: { ok: true, paymentId: p.id, receiptId: receipt.id, receipt: rctNo } };
  });
  return NextResponse.json(out.json, { status: out.status });
}
