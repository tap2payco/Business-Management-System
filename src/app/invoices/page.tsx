
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';
export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Invoices</h1>
        <a className="px-3 py-2 rounded bg-black text-white" href="/invoices/new">New Invoice</a>
      </div>
      <table className="w-full bg-white rounded shadow">
        <thead><tr className="text-left">
          <th className="p-3">Number</th><th className="p-3">Status</th><th className="p-3">Total</th><th className="p-3">Due</th><th className="p-3">Actions</th>
        </tr></thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-t">
              <td className="p-3"><a href={`/invoices/${inv.id}`} className="underline">{inv.number}</a></td>
              <td className="p-3">{inv.status}</td>
              <td className="p-3">{String(inv.grandTotal)} {inv.currency}</td>
              <td className="p-3">{String(inv.balanceDue)} {inv.currency}</td>
              <td className="p-3">
                <a href={`/invoices/${inv.id}`} className="text-blue-600 underline mr-2">View</a>
                <a href={`/invoices/${inv.id}/edit`} className="text-indigo-600 underline">Edit</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
