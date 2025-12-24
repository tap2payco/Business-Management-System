
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { formatCurrency } from '@/lib/formatStats';
import { auth } from '@/auth';

export default async function ViewPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  
  if (!session?.user?.businessId) {
    redirect('/login');
  }

  const { id } = await params;
  const payment = await prisma.payment.findFirst({
    where: { 
      id,
      invoice: {
        businessId: session.user.businessId
      }
    },
    include: {
        invoice: {
            include: { customer: true }
        },
        receipt: true
    }
  });

  if (!payment) return notFound();

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow rounded-lg mt-8">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-800">Payment Details</h1>
            <span className="text-sm text-gray-500">ID: {payment.id}</span>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Invoice</h2>
                <p className="text-lg font-medium">
                    <a href={`/invoices/${payment.invoice.id}`} className="text-blue-600 hover:underline">
                        {payment.invoice.number}
                    </a>
                </p>
            </div>
             <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Customer</h2>
                <p className="text-lg">{payment.invoice.customer.name}</p>
            </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <span className="block text-sm text-gray-500">Amount Paid</span>
                    <span className="block text-xl font-bold text-green-700">{formatCurrency(Number(payment.amount), payment.invoice.currency)}</span>
                </div>
                <div>
                     <span className="block text-sm text-gray-500">Date</span>
                     <span className="block text-lg">{new Date(payment.paidAt).toLocaleDateString()}</span>
                </div>
                 <div>
                     <span className="block text-sm text-gray-500">Method</span>
                     <span className="block text-lg capitalize">{payment.method.toLowerCase()}</span>
                </div>
                 <div>
                     <span className="block text-sm text-gray-500">Reference</span>
                     <span className="block text-lg">{payment.reference || '-'}</span>
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-4">
            <a href="/invoices" className="px-4 py-2 border rounded hover:bg-gray-50">
                Back to Invoices
            </a>
            {payment.receipt ? (
                <a 
                    href={`/receipts/${payment.receipt.id}`} 
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    View Receipt
                </a>
            ) : (
                <span className="text-gray-500 italic flex items-center">No receipt generated</span>
            )}
        </div>
    </div>
  );
}
