"use client";
import { useState } from 'react';

export default function NewCustomerPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to create customer');
      window.location.href = '/customers';
    } catch (err: any) {
      setError(err.message || 'Error creating customer');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Add New Customer</h1>
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
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Phone"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Address"
          value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })}
        />
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-gray-900 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Customer'}
        </button>
      </form>
    </div>
  );
}
