
import { prisma } from '@/lib/prisma';
import { formatCurrency } from '@/lib/formatStats';
import { Users, TrendingUp, DollarSign, Wallet } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { auth } = await import('@/auth');
  const session = await auth();
  
  if (!session?.user?.businessId) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Welcome to Business Manager</h1>
                <p className="text-gray-600">Please sign in to view your dashboard.</p>
            </div>
        </div>
    );
  }

  const businessId = session.user.businessId;

  // Parallel data fetching
  const [
    customerCount,
    revenueData,
    expenseData,
    receivableData
  ] = await Promise.all([
    // Active Customers
    prisma.customer.count({ where: { businessId } }),
    
    // Revenue (Total Paid on Invoices)
    prisma.invoice.aggregate({
        where: { businessId, status: { in: ['PAID', 'PARTIALLY_PAID', 'SENT'] } }, // Consider calculating strictly from payments or amountPaid
        _sum: { amountPaid: true }
    }),

    // Expenses
    prisma.expense.aggregate({
        where: { businessId },
        _sum: { amount: true }
    }),

     // Receivables (Balance Due)
     prisma.invoice.aggregate({
        where: { businessId, status: { not: 'DRAFT' } },
        _sum: { balanceDue: true }
    })
  ]);

  const totalRevenue = Number(revenueData._sum.amountPaid || 0);
  const totalExpenses = Number(expenseData._sum.amount || 0);
  const totalReceivable = Number(receivableData._sum.balanceDue || 0);
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
         <span className="text-sm text-gray-500">Overview for {new Date().toLocaleDateString()}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            <p className="text-xs text-green-600 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Collected
            </p>
        </div>

        {/* Expenses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
                <div className="p-2 bg-red-50 rounded-lg">
                    <Wallet className="w-5 h-5 text-red-600" />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-gray-500 mt-1">Recorded expenses</p>
        </div>

        {/* Receivables */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Receivables</h3>
                <div className="p-2 bg-orange-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalReceivable)}</p>
             <p className="text-xs text-orange-600 mt-1">Pending payments</p>
        </div>

        {/* Customers */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">Active Customers</h3>
                <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{customerCount}</p>
             <p className="text-xs text-gray-500 mt-1">Total registered</p>
        </div>
      </div>

       {/* Recent Activity Section could go here, but omitted for brevity as per strict request for cards */}
       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Net Income</h3>
            <div className="flex items-end gap-2">
                <span className={`text-4xl font-bold ${netIncome >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                    {formatCurrency(netIncome)}
                </span>
                <span className="text-gray-500 mb-1">profit margin</span>
            </div>
       </div>
    </div>
  );
}
