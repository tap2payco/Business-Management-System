"use client";
import { useState } from 'react';

export default function NewReceiptPage() {
  const [form, setForm] = useState({ paymentId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: form.paymentId })
      });
      if (!res.ok) throw new Error('Failed to create receipt');
      window.location.href = '/receipts';
    } catch (err: any) {
      setError(err.message || 'Error creating receipt');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Add New Receipt</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border p-2 rounded w-full"
          placeholder="Payment ID"
          value={form.paymentId}
          onChange={e => setForm({ ...form, paymentId: e.target.value })}
          required
        />
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-gray-900 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Receipt'}
        </button>
      </form>
    </div>
  );
}
