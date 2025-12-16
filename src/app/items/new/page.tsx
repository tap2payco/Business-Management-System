"use client";
import { useState } from 'react';

const COMMON_UNITS = [
  'pcs', 'kg', 'g', 'm', 'cm', 'l', 'ml', 'hrs', 'days', 'service', 'box', 'pack'
];

export default function NewItemPage() {
  const [form, setForm] = useState({ name: '', description: '', unitPrice: '', taxRate: '', unit: 'pcs' });
  const [customUnit, setCustomUnit] = useState('');
  const [isCustomUnit, setIsCustomUnit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Client-side validation
      if (!form.name || !form.name.trim()) {
        throw new Error('Name is required');
      }
      const unitPriceNum = Number(form.unitPrice);
      if (Number.isNaN(unitPriceNum) || unitPriceNum <= 0) {
        throw new Error('Unit Price must be a positive number');
      }
      // taxRate is optional; default to 0 when empty
      const taxRateNum = form.taxRate === '' ? 0 : Number(form.taxRate);
      if (Number.isNaN(taxRateNum) || taxRateNum < 0 || taxRateNum > 1) {
        throw new Error('Tax Rate must be a number between 0 and 1');
      }

      const finalUnit = isCustomUnit ? customUnit : form.unit;
      if (isCustomUnit && !finalUnit.trim()) {
        throw new Error('Please specify the custom unit');
      }

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description || null,
          unitPrice: unitPriceNum,
          taxRate: taxRateNum,
          unit: finalUnit
        })
      });

      // If the server returns a validation error, surface it to the user
      if (!res.ok) {
        let data: any = null;
        try {
          data = await res.json();
        } catch (err) {
          // ignore
        }
        const serverMessage = data?.error || (data?.details ? JSON.stringify(data.details) : null) || 'Failed to create item';
        throw new Error(serverMessage);
      }
      window.location.href = '/items';
    } catch (err: any) {
      setError(err.message || 'Error creating item');
    } finally {
      setLoading(false);
    }
  }

  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomUnit(true);
      setCustomUnit('');
    } else {
      setIsCustomUnit(false);
      setForm({ ...form, unit: val });
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Add New Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="item-name" className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input
            id="item-name"
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Website Design"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
            />
        </div>

        <div>
            <label htmlFor="item-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
            id="item-description"
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
            placeholder="Optional details"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="unit-price" className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                <input
                id="unit-price"
                className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                type="number"
                value={form.unitPrice}
                onChange={e => setForm({ ...form, unitPrice: e.target.value })}
                required
                />
            </div>
            <div>
                 <label htmlFor="tax-rate" className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (0-1)</label>
                 <input
                id="tax-rate"
                className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 0.18"
                type="number"
                step="0.01"
                value={form.taxRate}
                onChange={e => setForm({ ...form, taxRate: e.target.value })}
                />
            </div>
        </div>

        <div>
            <label htmlFor="unit-select" className="block text-sm font-medium text-gray-700 mb-1">Unit of Measurement</label>
            <div className="flex gap-2">
                <select
                    id="unit-select"
                    className="border p-2 rounded w-full bg-white focus:ring-2 focus:ring-blue-500"
                    value={isCustomUnit ? 'custom' : form.unit}
                    onChange={handleUnitChange}
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

        {error && <div className="text-red-600 bg-red-50 p-3 rounded text-sm">{error}</div>}
        
        <button
          type="submit"
          className="bg-gray-900 text-white px-4 py-2 rounded w-full hover:bg-black transition-colors"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Item'}
        </button>
      </form>
    </div>
  );
}
