"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';

interface Item {
  id: string;
  name: string;
  description: string | null;
  unit: string | null;
  unitPrice: number;
  taxRate: number;
}

export default function EditItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [item, setItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '',
    unitPrice: 0,
    taxRate: 0
  });

  useEffect(() => {
    fetchItem();
  }, [id]);

  async function fetchItem() {
    try {
      const res = await fetch(`/api/items/${id}`);
      if (!res.ok) throw new Error('Failed to fetch item');
      const data = await res.json();
      setItem(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        unit: data.unit || '',
        unitPrice: data.unitPrice,
        taxRate: data.taxRate * 100 // Convert to percentage
      });
    } catch (error) {
      showError('Failed to load item');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          unit: formData.unit || undefined,
          unitPrice: formData.unitPrice,
          taxRate: formData.taxRate / 100 // Convert back to decimal
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update item');
      }

      showSuccess('Item updated successfully');
      router.push('/items');
    } catch (error: any) {
      showError(error.message || 'Failed to update item');
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);

    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete item');
      }

      showSuccess('Item deleted successfully');
      router.push('/items');
    } catch (error: any) {
      showError(error.message || 'Failed to delete item');
      console.error(error);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading item...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Item not found</p>
          <button
            onClick={() => router.push('/items')}
            className="mt-4 rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
          >
            Back to Items
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Item</h1>
          <p className="mt-2 text-gray-600">Update item information</p>
        </div>
        <button
          onClick={() => router.push('/items')}
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Item Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div>
             <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
               Unit (e.g. pcs, kg)
             </label>
             <input
               type="text"
               id="unit"
               value={formData.unit}
               onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
               className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
             />
           </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">
                Unit Price (TZS) *
              </label>
              <input
                type="number"
                id="unitPrice"
                required
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
                Tax Rate (%) *
              </label>
              <input
                type="number"
                id="taxRate"
                required
                min="0"
                max="100"
                step="0.1"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-between border-t pt-6">
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Delete Item
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        itemName={item.name}
        isLoading={deleting}
      />
    </div>
  );
}
