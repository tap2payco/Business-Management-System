
import { prisma } from '@/lib/prisma';
export default async function ReceiptsPage(){
  const receipts = await prisma.receipt.findMany({ orderBy: { issuedAt: 'desc' }, include: { payment: { include: { invoice: true } } } });
  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h1 className='text-xl font-semibold'>Receipts</h1>
        <div className='flex gap-2'>
          <a className='px-3 py-2 rounded bg-black text-white' href='/receipts/import'>Import Receipt</a>
          <a className='px-3 py-2 rounded bg-gray-900 text-white hover:bg-gray-800' href='/receipts/new'>Add Receipt</a>
        </div>
      </div>
      <table className='w-full bg-white rounded shadow'>
        <thead><tr><th className='p-3 text-left'>Receipt</th><th className='p-3 text-left'>Invoice</th><th className='p-3 text-left'>Amount</th></tr></thead>
        <tbody>
          {receipts.map(r => (
            <tr key={r.id} className='border-t'>
              <td className='p-3'><a href={`/api/pdf/receipt/${r.id}`} className='underline'>{r.number}</a></td>
              <td className='p-3'><a className='underline' href={`/invoices/${r.payment.invoiceId}`}>{r.payment.invoice.number}</a></td>
              <td className='p-3'>{String(r.payment.amount)} {r.payment.invoice.currency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
