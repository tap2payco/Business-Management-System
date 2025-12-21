
import { prisma } from '@/lib/prisma';
import SearchInput from '@/components/ui/SearchInput';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const { auth } = await import('@/auth');
  const session = await auth();
  if (!session?.user?.businessId) {
    return <div className="p-8">Unauthorized: No business found.</div>;
  }

  const { query } = await searchParams;

  const where: Prisma.InvoiceWhereInput = {
    businessId: session.user.businessId,
  };

  if (query) {
    where.OR = [
      { number: { contains: query, mode: 'insensitive' } },
      { customer: { name: { contains: query, mode: 'insensitive' } } }
    ];
  }

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { customer: true } // Include customer for name search if needed, but not strictly required if only searching relation field exists
  });

  return (
    <div className="space-y-4 p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="mt-2 text-gray-600">Track and manage your invoices</p>
        </div>
        <a className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800 min-h-[44px] flex items-center justify-center" href="/invoices/new">New Invoice</a>
      </div>

      <div className="w-full max-w-sm">
        <SearchInput placeholder="Search invoices..." />
      </div>

      <div className="table-responsive bg-white rounded shadow">
        <table className="w-full">
          <thead><tr className="text-left">
            <th className="p-2 md:p-3 text-sm md:text-base">Number</th>
            <th className="p-2 md:p-3 text-sm md:text-base hidden sm:table-cell">Status</th>
            <th className="p-2 md:p-3 text-sm md:text-base">Total</th>
            <th className="p-2 md:p-3 text-sm md:text-base hidden md:table-cell">Due</th>
            <th className="p-2 md:p-3 text-sm md:text-base">Actions</th>
          </tr></thead>
          <tbody>
            {invoices.length === 0 ? (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                        {query ? 'No invoices match your search.' : 'No invoices found.'}
                    </td>
                </tr>
            ) : (
                invoices.map((inv) => (
                <tr key={inv.id} className="border-t">
                    <td className="p-2 md:p-3 text-sm md:text-base">
                    <a href={`/invoices/${inv.id}`} className="underline font-medium">{inv.number}</a>
                    <div className="sm:hidden text-xs text-gray-500 mt-1">{inv.status}</div>
                    </td>
                    <td className="p-2 md:p-3 text-sm md:text-base hidden sm:table-cell">{inv.status}</td>
                    <td className="p-2 md:p-3 text-sm md:text-base">{String(inv.grandTotal)} {inv.currency}</td>
                    <td className="p-2 md:p-3 text-sm md:text-base hidden md:table-cell">{String(inv.balanceDue)} {inv.currency}</td>
                    <td className="p-2 md:p-3 text-sm md:text-base">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                        <a href={`/invoices/${inv.id}`} className="text-blue-600 underline text-xs md:text-sm">View</a>
                        <a href={`/invoices/${inv.id}/edit`} className="text-indigo-600 underline text-xs md:text-sm">Edit</a>
                    </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
