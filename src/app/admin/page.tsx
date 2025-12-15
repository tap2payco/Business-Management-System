"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Business {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: string;
  stats: {
    users: number;
    invoices: number;
    customers: number;
  };
  owner: {
    name: string | null;
    phone: string;
  };
}

export default function AdminDashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  async function fetchBusinesses() {
    try {
      const res = await fetch('/api/admin/businesses');
      if (!res.ok) throw new Error('Failed to fetch businesses');
      const data = await res.json();
      setBusinesses(data);
    } catch (err) {
      setError('Error loading data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action CANNOT be undone and will delete all users and data associated with this business.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete business');
      }

      setBusinesses(businesses.filter(b => b.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting business');
    }
  }

  const filteredBusinesses = businesses.filter(business => {
    const query = searchQuery.toLowerCase();
    return (
      business.name.toLowerCase().includes(query) ||
      (business.email && business.email.toLowerCase().includes(query)) ||
      (business.phone && business.phone.toLowerCase().includes(query)) ||
      (business.owner.name && business.owner.name.toLowerCase().includes(query))
    );
  });

  if (loading) return <div className="p-8">Loading admin dashboard...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">System Overview</h1>
        <div className="text-sm text-gray-500">
          Total Businesses: {businesses.length}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Businesses</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{businesses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {businesses.reduce((sum, b) => sum + b.stats.users, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Invoices Generated</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {businesses.reduce((sum, b) => sum + b.stats.invoices, 0)}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Registered Businesses</h2>
        <div className="relative">
            <input
                type="text"
                placeholder="Search businesses..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
             <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBusinesses.length === 0 ? (
                  <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No businesses found matching "{searchQuery}"
                      </td>
                  </tr>
              ) : (
                filteredBusinesses.map((business) => (
                    <tr key={business.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{business.name}</div>
                        <div className="text-sm text-gray-500">{business.email || business.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{business.owner.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{business.owner.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-500">
                        <div>Users: {business.stats.users}</div>
                        <div>Invoices: {business.stats.invoices}</div>
                        <div>Customers: {business.stats.customers}</div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(business.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link 
                            href={`/admin/businesses/${business.id}`}
                            className="text-blue-600 hover:text-blue-900 mr-4 inline-block"
                        >
                            View
                        </Link>
                        <button 
                            onClick={() => handleDelete(business.id, business.name)}
                            className="text-red-600 hover:text-red-900"
                        >
                            Delete
                        </button>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
