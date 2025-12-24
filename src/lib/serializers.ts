// Helpers to serialize Prisma model results (Decimal, Date) into plain JS values
export function serializePayment(p: any) {
  return {
    id: p.id,
    paidAt: p.paidAt ? new Date(p.paidAt).toISOString() : null,
    amount: Number(p.amount),
    method: p.method,
    reference: p.reference ?? null,
    invoiceId: p.invoiceId ?? (p.invoice ? p.invoice.id : null),
    invoice: p.invoice ? { number: p.invoice.number, customer: p.invoice.customer } : null,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : null
  };
}

export function serializeExpense(e: any) {
  return {
    id: e.id,
    date: e.date ? new Date(e.date).toISOString() : null,
    amount: Number(e.amount),
    description: e.description,
    category: e.category,
    reference: e.reference ?? null,
    createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : null,
    updatedAt: e.updatedAt ? new Date(e.updatedAt).toISOString() : null
  };
}

export function serializeItem(it: any) {
  return {
    id: it.id,
    name: it.name,
    description: it.description ?? null,
    unitPrice: Number(it.unitPrice),
    taxRate: Number(it.taxRate ?? 0),
    type: it.type ?? 'GOODS',
    stock: it.stock ?? 0,
    unit: it.unit ?? 'pcs',
    serialNumber: it.serialNumber ?? null,
    createdAt: it.createdAt ? new Date(it.createdAt).toISOString() : null,
    updatedAt: it.updatedAt ? new Date(it.updatedAt).toISOString() : null
  };
}

export function serializeBusiness(b: any) {
  return {
    id: b.id,
    name: b.name,
    email: b.email ?? null,
    phone: b.phone ?? null,
    address: b.address ?? null,
    currency: b.currency,
    taxRate: Number(b.taxRate ?? 0),
    logo: b.logo ?? null,
    createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : null,
    updatedAt: b.updatedAt ? new Date(b.updatedAt).toISOString() : null
  };
}

export function serializeCustomer(c: any) {
  return {
    id: c.id,
    name: c.name,
    email: c.email ?? null,
    phone: c.phone ?? null,
    address: c.address ?? null,
    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
    updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : null
  };
}


export function serializeInvoiceSummary(inv: any) {
  // A compact invoice summary safe to send to the client
  return {
    id: inv.id,
    number: inv.number,
    status: inv.status,
    currency: inv.currency,
    issueDate: inv.issueDate ? new Date(inv.issueDate).toISOString() : null,
    dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString() : null,
    subtotal: Number(inv.subtotal ?? 0),
    taxTotal: Number(inv.taxTotal ?? 0),
    grandTotal: Number(inv.grandTotal ?? 0),
    amountPaid: Number(inv.amountPaid ?? 0),
    balanceDue: Number(inv.balanceDue ?? 0),
    customer: inv.customer ? { id: inv.customer.id, name: inv.customer.name } : null
  };
}

export default {};
