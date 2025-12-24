import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = session.user.businessId;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // parallel fetch for basic stats
    const [
      customerCount,
      revenueCurrentMonth,
      revenueLastMonth,
      expenseCurrentMonth,
      expenseLastMonth,
      totalRevenueAgg,
      totalExpenseAgg,
      totalReceivableAgg,
      invoiceCount,
      paymentCount,
      expenseCount
    ] = await Promise.all([
      // 1. Customer Count
      prisma.customer.count({ where: { businessId } }),

      // 2. Revenue Current Month (Payments)
      prisma.payment.aggregate({
        where: {
          invoice: { businessId },
          date: { gte: startOfMonth }
        },
        _sum: { amount: true }
      }),

      // 3. Revenue Last Month
      prisma.payment.aggregate({
        where: {
          invoice: { businessId },
          date: { gte: lastMonthStart, lte: lastMonthEnd }
        },
        _sum: { amount: true }
      }),

      // 4. Expenses Current Month
      prisma.expense.aggregate({
        where: {
          businessId,
          date: { gte: startOfMonth }
        },
        _sum: { amount: true }
      }),

      // 5. Expenses Last Month
      prisma.expense.aggregate({
        where: {
          businessId,
          date: { gte: lastMonthStart, lte: lastMonthEnd }
        },
        _sum: { amount: true }
      }),

      // 6. Total All-time Revenue
      prisma.payment.aggregate({
        where: { invoice: { businessId } },
        _sum: { amount: true }
      }),

      // 7. Total All-time Expenses
      prisma.expense.aggregate({
        where: { businessId },
        _sum: { amount: true }
      }),

      // 8. Total Receivables (Balance Due on non-draft Invoices)
      prisma.invoice.aggregate({
        where: { 
            businessId,
            status: { not: 'DRAFT' } // Include SENT, PARTIALLY_PAID, OVERDUE
        },
        _sum: { balanceDue: true }
      }),
      
      // Counts for percentage calc or general stats
      prisma.invoice.count({ where: { businessId } }),
      prisma.payment.count({ where: { invoice: { businessId } } }),
      prisma.expense.count({ where: { businessId } })
    ]);

    const totalRevenue = Number(totalRevenueAgg._sum.amount || 0);
    const totalExpenses = Number(totalExpenseAgg._sum.amount || 0);
    const totalReceivable = Number(totalReceivableAgg._sum.balanceDue || 0);
    const netIncome = totalRevenue - totalExpenses;

    const currentRevenue = Number(revenueCurrentMonth._sum.amount || 0);
    const lastRevenue = Number(revenueLastMonth._sum.amount || 0);
    const revenueChange = lastRevenue === 0 ? 100 : Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100);

    const currentExpenses = Number(expenseCurrentMonth._sum.amount || 0);
    const lastExpenses = Number(expenseLastMonth._sum.amount || 0);
    const expenseChange = lastExpenses === 0 ? 100 : Math.round(((currentExpenses - lastExpenses) / lastExpenses) * 100);

    // --- Chart Data: Trends (Last 6 Months) ---
    const trends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      
      const monRev = await prisma.payment.aggregate({
        where: { invoice: { businessId }, date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true }
      });
      const monExp = await prisma.expense.aggregate({
        where: { businessId, date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true }
      });

      trends.push({
        month: d.toLocaleString('default', { month: 'short' }),
        revenue: Number(monRev._sum.amount || 0),
        expenses: Number(monExp._sum.amount || 0)
      });
    }

    // --- Chart Data: Payment Status ---
    const statusCounts = await prisma.invoice.groupBy({
      by: ['status'],
      where: { businessId },
      _count: { status: true },
      _sum: { total: true } // or balanceDue depending on what we want to show
    });

    const paymentStatus = statusCounts.map(s => ({
      name: s.status.replace('_', ' '),
      count: s._count.status,
      value: Number(s._sum.total || 0) 
    })).filter(s => s.value > 0);


    // --- Recent Activity ---
    // Fetch latest 5 invoices, 5 payments, 5 expenses and merge
    const [latestInvoices, latestPayments, latestExpenses] = await Promise.all([
      prisma.invoice.findMany({
        where: { businessId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { customer: true }
      }),
      prisma.payment.findMany({
        where: { invoice: { businessId } },
        take: 5,
        orderBy: { date: 'desc' },
        include: { invoice: { include: { customer: true } } }
      }),
      prisma.expense.findMany({
        where: { businessId },
        take: 5,
        orderBy: { date: 'desc' }
      })
    ]);

    const recentActivity = [
      ...latestInvoices.map(i => ({
        id: i.id,
        type: 'invoice',
        description: `Invoice #${i.number} for ${i.customer.name}`,
        amount: Number(i.total),
        date: i.createdAt
      })),
      ...latestPayments.map(p => ({
        id: p.id,
        type: 'payment',
        description: `Payment received from ${p.invoice.customer.name}`,
        amount: Number(p.amount),
        date: p.date
      })),
      ...latestExpenses.map(e => ({
        id: e.id,
        type: 'expense',
        description: `Expense: ${e.description}`,
        amount: Number(e.amount),
        date: e.date
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

    return NextResponse.json({
        totalRevenue,
        totalExpenses,
        totalReceivable,
        customerCount,
        netIncome,
        revenueChange,
        expenseChange,
        trends,
        paymentStatus,
        recentActivity
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
