"use client";
import { useState } from 'react';

export default function NewPaymentPage() {
  const [form, setForm] = useState({ invoiceId: '', amount: '', method: 'cash', reference: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: form.invoiceId,
          amount: Number(form.amount),
          method: form.method,
          reference: form.reference
        })
      });
      if (!res.ok) throw new Error('Failed to record payment');
      window.location.href = '/payments';
    } catch (err: any) {
      setError(err.message || 'Error recording payment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Record Payment</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border p-2 rounded w-full"
          placeholder="Invoice ID"
          value={form.invoiceId}
          onChange={e => setForm({ ...form, invoiceId: e.target.value })}
          required
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Amount"
          type="number"
          value={form.amount}
          onChange={e => setForm({ ...form, amount: e.target.value })}
          required
        />
        <select
          className="border p-2 rounded w-full"
          value={form.method}
          onChange={e => setForm({ ...form, method: e.target.value })}
        >
          <option value="cash">Cash</option>
          <option value="bank">Bank Transfer</option>
          <option value="mobile">Mobile Money</option>
          <option value="card">Card Payment</option>
        </select>
        <input
          className="border p-2 rounded w-full"
          placeholder="Reference (optional)"
          value={form.reference}
          onChange={e => setForm({ ...form, reference: e.target.value })}
        />
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-gray-900 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Payment'}
        </button>
      </form>
    </div>
  );
}
