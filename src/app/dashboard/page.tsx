"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface DashboardStats {
  totalReceivable: number;
  totalRevenue: number;
  totalExpenses: number;
  activeCustomers: number;
  recentTransactions: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'invoice' | 'payment' | 'expense';
  }>;
  monthlySales: Array<{
    month: string;
    sales: number;
    expenses: number;
  }>;
  topExpenses: Array<{
    category: string;
    amount: number;
  }>;
  topSellingItems: Array<{
    name: string;
    quantity: number;
    amount: number;
  }>;
}

const summaryCards = (stats: DashboardStats) => [
  {
    title: 'Total Receivable',
    value: `TZS ${stats.totalReceivable.toLocaleString()}`,
    description: 'Outstanding payments',
    trend: null,
  },
  {
    title: 'Revenue',
    value: `TZS ${stats.totalRevenue.toLocaleString()}`,
    description: 'Total revenue this period',
    trend: 'up',
  },
  {
    title: 'Expenses',
    value: `TZS ${stats.totalExpenses.toLocaleString()}`,
    description: 'Total expenses this period',
    trend: 'down',
  },
  {
    title: 'Active Customers',
    value: stats.activeCustomers.toString(),
    description: 'Total customers',
    trend: null,
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <div className="h-24 w-24 animate-spin rounded-full border-b-2 border-gray-900"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );

  if (!stats) return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <p className="text-red-600">Error loading dashboard data</p>
        <button 
          onClick={fetchDashboardStats}
          className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Overview</h1>
          <p className="mt-2 text-gray-600">View your business performance at a glance</p>
        </div>
        <div>
          <Link href="/invoices/new" className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500">
            Quick Create Invoice
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards(stats).map((card, i) => (
          <div key={i} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
              {card.trend && (
                <span className={`rounded-full p-1 ${
                  card.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {card.trend === 'up' ? '↑' : '↓'}
                </span>
              )}
            </div>
            <p className="mt-2 text-3xl font-bold">{card.value}</p>
            {card.description && (
              <p className="mt-1 text-sm text-gray-500">{card.description}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b p-6">
            <h2 className="font-semibold">Recent Activity</h2>
            <p className="text-sm text-gray-500">Latest transactions and expenses</p>
          </div>
          <div className="divide-y">
            {stats.recentTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-6">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`font-medium ${
                  transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {transaction.type === 'expense' ? '-' : '+'}
                  TZS {transaction.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales vs Expenses */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Sales & Expenses</h2>
          <p className="text-sm text-gray-500">Monthly comparison</p>
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlySales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { 
                    month: 'short' 
                  })}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `TZS ${value.toLocaleString()}`}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#16a34a" 
                  name="Sales"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#dc2626" 
                  name="Expenses"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Expenses by Category */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="font-semibold">Top Expenses</h2>
          <p className="text-sm text-gray-500">By category</p>
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topExpenses} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={100} />
                <Tooltip formatter={(value: number) => `TZS ${value.toLocaleString()}`} />
                <Bar dataKey="amount" fill="#ef4444" name="Amount" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="border-b p-6">
            <h2 className="font-semibold">Top Selling Items</h2>
            <p className="text-sm text-gray-500">Best performing products/services</p>
          </div>
          <div className="divide-y">
            {stats.topSellingItems?.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-6">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.quantity} sold</p>
                </div>
                <span className="font-medium text-gray-900">
                  TZS {item.amount.toLocaleString()}
                </span>
              </div>
            ))}
            {(!stats.topSellingItems || stats.topSellingItems.length === 0) && (
              <div className="p-6 text-center text-gray-500">No sales data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
