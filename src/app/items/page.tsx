"use client";

import { useState, useEffect } from 'react';

interface Item {
  id: string;
  name: string;
  description: string | null;
  unitPrice: number;
  taxRate: number;
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch('/api/items');
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Items</h1>
          <p className="mt-2 text-gray-600">Manage your products and services</p>
        </div>
        <button
          className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
          onClick={() => window.location.href = '/items/new'}
        >
          Add Item
        </button>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Tax Rate
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {item.description || '-'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="text-sm font-medium text-gray-900">
                      TZS {item.unitPrice.toLocaleString()}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="text-sm text-gray-900">
                      {(item.taxRate * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}