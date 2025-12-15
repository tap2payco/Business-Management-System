"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BusinessDetailPage({ params }: { params: { id: string } }) {
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchBusiness();
  }, [params.id]);

  async function fetchBusiness() {
    try {
      const res = await fetch(`/api/admin/businesses/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch business');
      const data = await res.json();
      setBusiness(data);
    } catch (err) {
      setError('Error loading business');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`CRITICAL WARNING: Are you sure you want to delete "${business.name}"?\n\nThis will PERMANENTLY DELETE:\n- The business account\n- All ${business.stats.users} users\n- All ${business.stats.invoices} invoices\n- All customers and data.\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/businesses/${params.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      
      router.push('/admin');
    } catch (err: any) {
      alert(err.message || 'Error deleting business');
    }
  }

  if (loading) return <div className="p-8">Loading business details...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!business) return null;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
          <div className="text-sm text-gray-500 mt-1">
            ID: {business.id} • Joined {new Date(business.createdAt).toLocaleDateString()}
          </div>
        </div>
        <button 
          onClick={handleDelete}
          className="bg-red-50 text-red-700 hover:bg-red-100 px-4 py-2 rounded-lg border border-red-200 font-medium transition-colors"
        >
          Delete Business
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500">Users</div>
                    <div className="text-2xl font-bold text-gray-900">{business.stats.users}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500">Invoices</div>
                    <div className="text-2xl font-bold text-gray-900">{business.stats.invoices}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500">Customers</div>
                    <div className="text-2xl font-bold text-gray-900">{business.stats.customers}</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <div className="text-sm text-gray-500">Items</div>
                    <div className="text-2xl font-bold text-gray-900">{business.stats.items}</div>
                </div>
            </div>

            {/* Owner Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="font-semibold text-gray-800">Owner Information</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wide font-medium">Name</label>
                        <div className="mt-1 text-gray-900">{business.owner.name || 'N/A'}</div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wide font-medium">Email</label>
                        <div className="mt-1 text-gray-900">{business.owner.email || 'N/A'}</div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wide font-medium">Phone</label>
                        <div className="mt-1 text-gray-900">{business.owner.phone}</div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wide font-medium">Role</label>
                        <div className="mt-1 text-gray-900 capitalize">{business.owner.role}</div>
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="font-semibold text-gray-800">Business Details</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wide font-medium">Email</label>
                        <div className="mt-1 text-gray-900">{business.email || 'N/A'}</div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wide font-medium">Phone</label>
                        <div className="mt-1 text-gray-900">{business.phone || 'N/A'}</div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs text-gray-500 uppercase tracking-wide font-medium">Address</label>
                        <div className="mt-1 text-gray-900">{business.address || 'N/A'}</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Sidebar / Configuration */}
        <div className="space-y-6">
             <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="font-semibold text-gray-800">Settings</h2>
                </div>
                <div className="p-6 space-y-4">
                     <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wide font-medium">Currency</label>
                        <div className="mt-1 text-gray-900 font-mono">{business.currency}</div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wide font-medium">Invoice Template</label>
                        <div className="mt-1 text-gray-900 capitalize">{business.invoiceTemplate}</div>
                    </div>
                     <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wide font-medium">Default Tax Rate</label>
                        <div className="mt-1 text-gray-900">{(Number(business.taxRate) * 100).toFixed(0)}%</div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
