
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function ViewReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: {
      payment: {
        include: {
          invoice: {
            include: { customer: true, business: true }
          }
        }
      }
    }
  });

  if (!receipt) return notFound();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Receipt {receipt.number}</h1>
        <a 
          href={`/api/pdf/receipt/${receipt.id}`} 
          target="_blank" 
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Download PDF
        </a>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border">
        <div className="p-8 border-b">
             <div className="flex justify-between">
                <div>
                    <h2 className="text-xl font-bold">{receipt.payment.invoice.business.name}</h2>
                    <p className="text-gray-600 whitespace-pre-wrap">{receipt.payment.invoice.business.address}</p>
                    <p className="text-gray-600">{receipt.payment.invoice.business.email}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-lg font-semibold text-gray-500">RECEIPT</h3>
                    <p className="text-2xl font-bold">{receipt.number}</p>
                    <p className="text-gray-600 mt-2">Date: {new Date(receipt.issuedAt).toLocaleDateString()}</p>
                </div>
             </div>
        </div>

        <div className="p-8">
            <div className="flex justify-between mb-8">
                <div>
                    <h4 className="text-sm font-semibold text-gray-500 uppercase">Received From</h4>
                    <p className="text-lg font-medium">{receipt.payment.invoice.customer.name}</p>
                    <p className="text-gray-600">{receipt.payment.invoice.customer.address}</p>
                </div>
            </div>

            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3">Description</th>
                        <th className="text-right py-3">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="border-b border-gray-100">
                        <td className="py-4">
                            Payment for Invoice #{receipt.payment.invoice.number}
                            {receipt.payment.reference && <span className="block text-sm text-gray-500">Ref: {receipt.payment.reference}</span>}
                        </td>
                        <td className="text-right py-4 font-medium">
                            {Number(receipt.payment.amount).toLocaleString()} {receipt.payment.invoice.currency}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="text-center text-gray-500 text-sm mt-12">
                <p>Thank you for your business!</p>
            </div>
        </div>
      </div>
    </div>
  );
}
