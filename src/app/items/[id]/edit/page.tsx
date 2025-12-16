"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const COMMON_UNITS = [
    'pcs', 'kg', 'g', 'm', 'cm', 'l', 'ml', 'hrs', 'days', 'service', 'box', 'pack'
  ];

interface Item {
  id: string;
  name: string;
  description: string | null;
  unitPrice: number;
  taxRate: number;
  unit: string;
}

export default function EditItemPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unitPrice: '',
    taxRate: '',
    unit: 'pcs'
  });
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [customUnit, setCustomUnit] = useState('');

  useEffect(() => {
    fetchItem();
  }, [params.id]);

  async function fetchItem() {
    try {
      const res = await fetch(`/api/items/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch item');
      const item: Item = await res.json();
      
      const isCommon = COMMON_UNITS.includes(item.unit || 'pcs');
      setFormData({
        name: item.name,
        description: item.description || '',
        unitPrice: String(item.unitPrice),
        taxRate: String(item.taxRate),
        unit: item.unit || 'pcs'
      });
      
      if (!isCommon && item.unit) {
          setIsCustomUnit(true);
          setCustomUnit(item.unit);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
        const finalUnit = isCustomUnit ? customUnit : formData.unit;
        if (isCustomUnit && !finalUnit.trim()) {
            throw new Error('Please specify the custom unit');
        }

      const res = await fetch(`/api/items/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          unitPrice: Number(formData.unitPrice),
          taxRate: Number(formData.taxRate),
          unit: finalUnit
        })
      });

      if (!res.ok) throw new Error('Failed to update item');
      router.push('/items');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const res = await fetch(`/api/items/${params.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete item');
      router.push('/items');
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Item</h1>
        <button 
          onClick={handleDelete}
          className="text-red-600 text-sm hover:underline"
          type="button"
        >
          Delete Item
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="item-name" className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input
            id="item-name"
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            required
            />
        </div>

        <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
            id="description"
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="unit-price" className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                <input
                id="unit-price"
                className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
                type="number"
                value={formData.unitPrice}
                onChange={e => setFormData({...formData, unitPrice: e.target.value})}
                required
                />
            </div>
             <div>
                <label htmlFor="tax-rate" className="block text-sm font-medium text-gray-700 mb-1">Tax Rate</label>
                <input
                id="tax-rate"
                className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
                type="number"
                step="0.01"
                value={formData.taxRate}
                onChange={e => setFormData({...formData, taxRate: e.target.value})}
                />
            </div>
        </div>

        <div>
            <label htmlFor="unit-select" className="block text-sm font-medium text-gray-700 mb-1">Unit of Measurement</label>
            <div className="flex gap-2">
                <select
                    id="unit-select"
                    className="border p-2 rounded w-full bg-white focus:ring-2 focus:ring-blue-500"
                    value={isCustomUnit ? 'custom' : formData.unit}
                    onChange={(e) => {
                        if (e.target.value === 'custom') {
                            setIsCustomUnit(true);
                            setCustomUnit('');
                        } else {
                            setIsCustomUnit(false);
                            setFormData({ ...formData, unit: e.target.value });
                        }
                    }}
                >
                    {COMMON_UNITS.map(u => (
                        <option key={u} value={u}>{u}</option>
                    ))}
                    <option value="custom">Other (Custom)...</option>
                </select>
                {isCustomUnit && (
                    <input
                        aria-label="Custom Unit"
                        className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. bundles"
                        value={customUnit}
                        onChange={e => setCustomUnit(e.target.value)}
                        autoFocus
                    />
                )}
            </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Update Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
