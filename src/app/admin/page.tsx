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

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
            <Link href="/admin/businesses" className="text-blue-600 hover:underline">Manage Businesses &rarr;</Link>
            <Link href="/admin/users" className="text-blue-600 hover:underline">View All Users &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
