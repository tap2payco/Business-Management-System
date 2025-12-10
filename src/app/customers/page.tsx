"use client";

import { useState, useEffect } from 'react';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch('/api/customers');
        if (!res.ok) throw new Error('Unauthorized or error fetching customers');
        const data = await res.json();
        setCustomers(data);
      } catch (error) {
        setCustomers([]);
        console.error('Failed to fetch customers:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Customers</h1>
          <p className="mt-2 text-sm md:text-base text-gray-600">Manage your customer information</p>
        </div>
        <button
          className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 min-h-[44px] w-full sm:w-auto"
          onClick={() => window.location.href = '/customers/new'}
        >
          Add Customer
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="rounded-lg border bg-white p-12 text-center">
          <p className="text-gray-600">No customers yet. Add your first customer to get started.</p>
          <button
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
            onClick={() => window.location.href = '/customers/new'}
          >
            Add Customer
          </button>
        </div>
      ) : (
        <div className="table-responsive rounded-lg border bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="hidden sm:table-cell px-3 md:px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Phone
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Address
                </th>
                <th className="px-3 md:px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-3 md:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {customer.name}
                    </div>
                    <div className="md:hidden text-xs text-gray-500 mt-1">
                      {customer.email || customer.phone || '-'}
                    </div>
                  </td>
                  <td className="hidden md:table-cell whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {customer.email || '-'}
                    </div>
                  </td>
                  <td className="hidden sm:table-cell whitespace-nowrap px-3 md:px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {customer.phone || '-'}
                    </div>
                  </td>
                  <td className="hidden lg:table-cell whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {customer.address || '-'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 md:px-6 py-4 text-right text-sm">
                    <button 
                      onClick={() => window.location.href = `/customers/${customer.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 min-h-[44px] px-2"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}