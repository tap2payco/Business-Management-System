"use client";
import { useState } from 'react';

export default function NewExpensePage() {
  const [form, setForm] = useState({ date: '', amount: '', description: '', category: '', reference: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: form.date,
          amount: Number(form.amount),
          description: form.description,
          category: form.category,
          reference: form.reference,
          notes: form.notes
        })
      });
      if (!res.ok) throw new Error('Failed to add expense');
      window.location.href = '/expenses';
    } catch (err: any) {
      setError(err.message || 'Error adding expense');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Add New Expense</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="border p-2 rounded w-full"
          type="date"
          value={form.date}
          onChange={e => setForm({ ...form, date: e.target.value })}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
             className="border p-2 rounded w-full"
             placeholder="Description"
             value={form.description}
             onChange={e => setForm({ ...form, description: e.target.value })}
             required
           />
           <select
             className="border p-2 rounded w-full bg-white"
             value={form.category}
             onChange={e => setForm({ ...form, category: e.target.value })}
             required
           >
             <option value="">Select Category</option>
             <option value="SALARY">Salary</option>
             <option value="RENT">Rent</option>
             <option value="ADVERTISING">Advertising</option>
             <option value="FUEL">Fuel</option>
             <option value="ALLOWANCE">Allowance</option>
             <option value="STATIONARY">Stationary</option>
             <option value="UTILITIES">Utilities</option>
             <option value="COMMUNICATION">Communication</option>
             <option value="COGS">COGS (Cost of Goods)</option>
             <option value="TRANSPORT">Transport</option>
             <option value="MISCELLANEOUS">Miscellaneous</option>
           </select>
        </div>
        <input
          className="border p-2 rounded w-full"
          placeholder="Reference (optional)"
          value={form.reference}
          onChange={e => setForm({ ...form, reference: e.target.value })}
        />
        <input
          className="border p-2 rounded w-full"
          placeholder="Notes (optional)"
          value={form.notes}
          onChange={e => setForm({ ...form, notes: e.target.value })}
        />
        {error && <div className="text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-gray-900 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Expense'}
        </button>
      </form>
    </div>
  );
}
