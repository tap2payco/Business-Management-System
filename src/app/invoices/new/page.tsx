
import NewInvoiceClient from './NewInvoiceClient';
import { prisma } from '@/lib/prisma';
export default async function NewInvoicePage() {
  const business = await prisma.business.findFirst();
  const currency = process.env.DEFAULT_CURRENCY || 'TZS';
  return <NewInvoiceClient businessId={business?.id} currency={currency} defaultDueDays={14} />;
}
