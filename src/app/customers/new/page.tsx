"use client";
import { useState } from 'react';

export default function NewCustomerPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', type: 'INDIVIDUAL', taxId: '' });
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
        {/* Customer Type Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-lg w-max mb-2">
            <button
                type="button"
                onClick={() => setForm({ ...form, type: 'INDIVIDUAL' })}
                className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    (form as any).type === 'INDIVIDUAL' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-900'
                }`}
            >
                Individual
            </button>
            <button
                type="button"
                onClick={() => setForm({ ...form, type: 'COMPANY' })}
                className={`flex-1 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    (form as any).type === 'COMPANY' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-900'
                }`}
            >
                Company
            </button>
        </div>

        <input
          className="border p-2 rounded w-full"
          placeholder={(form as any).type === 'COMPANY' ? "Company Name" : "Full Name"}
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />

        {(form as any).type === 'COMPANY' && (
            <input
                className="border p-2 rounded w-full"
                placeholder="Tax ID / VRN / TIN"
                value={(form as any).taxId}
                onChange={e => setForm({ ...form, taxId: e.target.value } as any)}
            />
        )}
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
