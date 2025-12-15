import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export async function GET() {
  try {
    const { auth } = await import('@/auth');
    const session = await auth();
    
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = session.user.businessId;

    // Get total receivable (unpaid invoices)
    const totalReceivable = await prisma.invoice.aggregate({
      _sum: {
        balanceDue: true
      },
      where: {
        businessId,
        status: 'PENDING'
      }
    });

    // Get total revenue (sum of all paid invoices)
    const totalRevenue = await prisma.invoice.aggregate({
      _sum: {
        grandTotal: true
      },
      where: {
        businessId,
        status: 'PAID'
      }
    });

    // Get total expenses
    const totalExpenses = await prisma.expense.aggregate({
      _sum: {
        amount: true
      },
      where: {
        businessId
      }
    });

    // Get count of active customers (customers with transactions in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeCustomers = await prisma.customer.count({
      where: {
        businessId,
        OR: [
          {
            invoices: {
              some: {
                createdAt: {
                  gte: thirtyDaysAgo
                }
              }
            }
          },
          {
            invoices: {
              some: {
                payments: {
                  some: {
                    paidAt: {
                      gte: thirtyDaysAgo
                    }
                  }
                }
              }
            }
          }
        ]
      }
    });

    // Get recent transactions (invoices, payments, expenses)
    const [recentInvoices, recentPayments, recentExpenses] = await Promise.all([
      prisma.invoice.findMany({
        where: { businessId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          number: true,
          createdAt: true,
          grandTotal: true,
          customer: {
            select: { name: true }
          }
        }
      }),
      prisma.payment.findMany({
        where: { invoice: { businessId } },
        take: 5,
        orderBy: { paidAt: 'desc' },
        select: {
          id: true,
          paidAt: true,
          amount: true,
          invoice: {
            select: {
              number: true,
              customer: {
                select: { name: true }
              }
            }
          }
        }
      }),
      prisma.expense.findMany({
        where: { businessId },
        take: 5,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          date: true,
          amount: true,
          description: true,
          category: true
        }
      })
    ]);

    // Transform transactions into unified format
    const recentTransactions = [
      ...recentInvoices.map((inv) => ({
        id: inv.id,
        date: inv.createdAt,
        description: `Invoice ${inv.number} - ${inv.customer.name}`,
        amount: Number(inv.grandTotal),
        type: 'invoice' as const
      })),
      ...recentPayments.map((pay) => ({
        id: pay.id,
        date: pay.paidAt,
        description: `Payment for Invoice ${pay.invoice.number} - ${pay.invoice.customer.name}`,
        amount: Number(pay.amount),
        type: 'payment' as const
      })),
      ...recentExpenses.map((exp) => ({
        id: exp.id,
        date: exp.date,
        description: exp.description,
        amount: Number(exp.amount),
        type: 'expense' as const
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
     .slice(0, 10);

    // Get monthly sales and expenses for the last 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        start: startOfMonth(date),
        end: endOfMonth(date),
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      };
    }).reverse();

    const monthlySales = await Promise.all(
      months.map(async ({ start, end, month }) => {
        const sales = await prisma.invoice.aggregate({
          _sum: { grandTotal: true },
          where: {
            businessId,
            createdAt: {
              gte: start,
              lte: end
            }
          }
        });

        const expenses = await prisma.expense.aggregate({
          _sum: { amount: true },
          where: {
            businessId,
            date: {
              gte: start,
              lte: end
            }
          }
        });

        return {
          month,
          sales: Number(sales._sum.grandTotal || 0),
          expenses: Number(expenses._sum.amount || 0)
        };
      })
    );

    // Get top expenses by category
    const topExpenses = await prisma.expense.groupBy({
      by: ['category'],
      where: { businessId },
      _sum: {
        amount: true
      },
      orderBy: {
        _sum: {
          amount: 'desc'
        }
      },
      take: 5
    });

    // Get top selling items
    const topSellingItems = await prisma.invoiceItem.groupBy({
      by: ['description'],
      where: { 
        invoice: {
          businessId
        }
      },
      _sum: {
        quantity: true,
        lineTotal: true
      },
      orderBy: {
        _sum: {
          lineTotal: 'desc'
        }
      },
      take: 5
    });

    return NextResponse.json({
      totalReceivable: Number(totalReceivable._sum.balanceDue || 0),
      totalRevenue: Number(totalRevenue._sum.grandTotal || 0),
      totalExpenses: Number(totalExpenses._sum.amount || 0),
      activeCustomers,
      recentTransactions,
      monthlySales,
      topExpenses: topExpenses.map((exp: any) => ({
        category: exp.category,
        amount: Number(exp._sum.amount)
      })),
      topSellingItems: topSellingItems.map((item: any) => ({
        name: item.description,
        quantity: Number(item._sum.quantity),
        amount: Number(item._sum.lineTotal)
      }))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}