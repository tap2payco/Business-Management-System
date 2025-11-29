
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import NewInvoiceClient from './NewInvoiceClient';

export default async function NewInvoicePage() {
  const session = await auth();
  if (!session?.user?.businessId) {
    redirect('/signin');
  }
  
  const currency = process.env.DEFAULT_CURRENCY || 'TZS';
  return <NewInvoiceClient businessId={session.user.businessId} currency={currency} defaultDueDays={14} />;
}
