"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Customer {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  unitPrice: number;
  taxRate: number;
  unit: string;
}

interface LineItem {
  itemId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  taxRate: number;
}

export default function NewQuotePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    customerId: '',
    expiryDate: '',
    validUntil: 'Valid for 30 days',
    notes: '',
    terms: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit: 'pcs', unitPrice: 0, taxRate: 0 },
  ]);

  useEffect(() => {
    loadCustomers();
    loadItems();
  }, []);

  async function loadCustomers() {
    try {
      const res = await fetch('/api/customers');
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  }

  async function loadItems() {
    try {
      const res = await fetch('/api/items');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  }

  function addLineItem() {
    setLineItems([
      ...lineItems,
      { description: '', quantity: 1, unit: 'pcs', unitPrice: 0, taxRate: 0 },
    ]);
  }

  function removeLineItem(index: number) {
    setLineItems(lineItems.filter((_, i) => i !== index));
  }

  function updateLineItem(index: number, field: keyof LineItem, value: any) {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  }

  function selectItem(index: number, itemId: string) {
    const item = items.find(i => i.id === itemId);
    if (item) {
      updateLineItem(index, 'itemId', itemId);
      updateLineItem(index, 'description', item.name);
      updateLineItem(index, 'unitPrice', item.unitPrice);
      updateLineItem(index, 'taxRate', item.taxRate);
      updateLineItem(index, 'unit', item.unit);
    }
  }

  function calculateTotals() {
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxTotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice * item.taxRate,
      0
    );
    const grandTotal = subtotal + taxTotal;
    return { subtotal, taxTotal, grandTotal };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!form.customerId) {
        throw new Error('Please select a customer');
      }

      if (lineItems.length === 0 || !lineItems[0].description) {
        throw new Error('Please add at least one line item');
      }

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          expiryDate: form.expiryDate || undefined,
          items: lineItems,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create quote');
      }

      const quote = await res.json();
      
      // Redirect to quotes list instead of detail page (safer)
      router.push('/quotes');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const { subtotal, taxTotal, grandTotal } = calculateTotals();

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Quote</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Dates */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Quote Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customer" className="block text-sm font-medium text-gray-700 mb-1">
                Customer *
              </label>
              <select
                id="customer"
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                id="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700 mb-1">
              Valid Until Text
            </label>
            <input
              id="validUntil"
              type="text"
              value={form.validUntil}
              onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
              placeholder="e.g., Valid for 30 days"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
            <button
              type="button"
              onClick={addLineItem}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Item (Optional)
                      </label>
                      <select
                        onChange={(e) => selectItem(index, e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      >
                        <option value="">-- Or enter custom description below --</option>
                        {items.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.name} - TZS {it.unitPrice.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                        min="0.01"
                        step="0.01"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => updateLineItem(index, 'unit', e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Price *
                      </label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(index, 'unitPrice', Number(e.target.value))}
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tax Rate (0-1)
                      </label>
                      <input
                        type="number"
                        value={item.taxRate}
                        onChange={(e) => updateLineItem(index, 'taxRate', Number(e.target.value))}
                        min="0"
                        max="1"
                        step="0.01"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="ml-4 text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="text-right text-sm font-medium text-gray-900">
                  Line Total: TZS {(item.quantity * item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">TZS {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="font-medium">TZS {taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Grand Total:</span>
              <span>TZS {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Notes & Terms */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes for the customer..."
            />
          </div>

          <div>
            <label htmlFor="terms" className="block text-sm font-medium text-gray-700 mb-1">
              Terms & Conditions
            </label>
            <textarea
              id="terms"
              value={form.terms}
              onChange={(e) => setForm({ ...form, terms: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Payment terms, delivery terms, etc..."
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Quote'}
          </button>
        </div>
      </form>
    </div>
  );
}
