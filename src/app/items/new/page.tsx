"use client";
import { useState } from 'react';

export default function NewItemPage() {
  const [form, setForm] = useState({ name: '', description: '', unitPrice: '', taxRate: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          unitPrice: Number(form.unitPrice),
          taxRate: Number(form.taxRate)
        })
      });
      if (!res.ok) throw new Error('Failed to create item');
      window.location.href = '/items';
    } catch (err: any) {
      setError(err.message || 'Error creating item');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Add New Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border p-2 rounded w-full"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Unit Price"
          type="number"
          value={form.unitPrice}
          onChange={e => setForm({ ...form, unitPrice: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Tax Rate (e.g. 0.18)"
          type="number"
          step="0.01"
          value={form.taxRate}
          onChange={e => setForm({ ...form, taxRate: e.target.value })}
        />
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-gray-900 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Item'}
        </button>
      </form>
    </div>
  );
}
