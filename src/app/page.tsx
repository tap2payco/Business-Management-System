'use client';

import { useEffect, useState } from 'react';
import { Users, TrendingUp, TrendingDown, DollarSign, Wallet, FileText, Clock } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  totalReceivable: number;
  customerCount: number;
  netIncome: number;
  revenueChange: number;
  expenseChange: number;
  trends: Array<{ month: string; revenue: number; expenses: number }>;
  paymentStatus: Array<{ name: string; value: number; count: number }>;
  recentActivity: Array<{
    id: string;
    type: 'invoice' | 'payment' | 'expense';
    description: string;
    amount: number;
    date: string;
  }>;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const res = await fetch('/api/dashboard/analytics');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Failed to load dashboard data
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `TZS ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview for {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
          <div className="flex items-center mt-2">
            {stats.revenueChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
            )}
            <span className={`text-xs font-medium ${stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(stats.revenueChange)}% from last month
            </span>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
            <div className="p-2 bg-red-50 rounded-lg">
              <Wallet className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalExpenses)}</p>
          <div className="flex items-center mt-2">
            {stats.expenseChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-red-600 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
            )}
            <span className={`text-xs font-medium ${stats.expenseChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {Math.abs(stats.expenseChange)}% from last month
            </span>
          </div>
        </div>

        {/* Receivables */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Receivables</h3>
            <div className="p-2 bg-orange-50 rounded-lg">
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalReceivable)}</p>
          <p className="text-xs text-orange-600 mt-2">Pending payments</p>
        </div>

        {/* Customers */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Active Customers</h3>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.customerCount}</p>
          <p className="text-xs text-gray-500 mt-2">Total registered</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expenses Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue vs Expenses (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.paymentStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name: string, percent?: number }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.paymentStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Net Income & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Net Income */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Net Income</h3>
          <div className="flex items-end gap-2">
            <span className={`text-4xl font-bold ${stats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.netIncome)}
            </span>
            <span className="text-gray-500 mb-2">profit margin</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'invoice' ? 'bg-blue-50' :
                    activity.type === 'payment' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {activity.type === 'invoice' ? <FileText className="w-4 h-4 text-blue-600" /> :
                     activity.type === 'payment' ? <DollarSign className="w-4 h-4 text-green-600" /> :
                     <Wallet className="w-4 h-4 text-red-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(activity.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
