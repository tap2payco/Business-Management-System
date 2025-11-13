
'use client';
import { useState } from 'react';
export default function NewInvoiceClient({ businessId, currency, defaultDueDays }: { businessId?: string; currency: string; defaultDueDays: number; }) {
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0, taxRate: undefined as number | undefined }]);
  const [notes, setNotes] = useState('');
  const [dueInDays, setDueInDays] = useState(defaultDueDays);
  const [aiNote, setAiNote] = useState('');
  const [saving, setSaving] = useState(false);

  function setItem(i: number, key: string, value: any) { setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [key]: value } : it)); }


  async function fetchExistingCustomer({ name, email, phone }: { name?: string; email?: string; phone?: string }) {
    try {
      const res = await fetch('/api/customers');
      if (!res.ok) return null;
      const customers = await res.json();
      return customers.find((c: any) =>
        (email && c.email === email) ||
        (phone && c.phone === phone) ||
        (name && c.name.toLowerCase() === name.toLowerCase())
      ) || null;
    } catch {
      return null;
    }
  }

  async function useAI() {
    try {
      const res = await fetch('/api/ai/draft', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ note: aiNote }) 
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to get AI draft');
      }
      
      const data = await res.json();
      if (!data.draft) {
        throw new Error('Invalid response from AI service');
      }
      
      const { draft } = data;
      if (draft.customer) {
        const existing = await fetchExistingCustomer(draft.customer);
        if (existing) {
          setCustomer({
            name: existing.name,
            email: existing.email ?? '',
            phone: existing.phone ?? '',
            address: existing.address ?? ''
          });
        } else {
          setCustomer(draft.customer);
        }
      }
      if (draft.items?.length > 0) setItems(draft.items);
      if (draft.notes) setNotes(draft.notes);
      if (draft.dueInDays) setDueInDays(draft.dueInDays);
      
    } catch (error) {
      console.error('AI draft error:', error);
      alert('Failed to generate draft: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async function save() {
    setSaving(true);
    const now = new Date();
    const due = new Date(now.getTime() + (dueInDays ?? 14) * 864e5);
    const payload = { businessId, customer, items: items.map(i => ({ ...i, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) })), issueDate: now.toISOString(), dueDate: due.toISOString(), currency, notes };
    const res = await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    setSaving(false);
    if (data?.id) window.location.href = `/invoices/${data.id}`;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow space-y-2">
        <label className="font-medium">Describe the invoice (AI)</label>
        <textarea value={aiNote} onChange={e=>setAiNote(e.target.value)} className="w-full border p-2 rounded" rows={4} placeholder='e.g. "Mchele Ltd, 5 steel pipes @ 12000 each, VAT 18%, due in 14 days"'></textarea>
        <button onClick={useAI} className="px-3 py-2 bg-indigo-600 text-white rounded">Draft with AI</button>
      </div>

      <div className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="font-semibold">Customer</h2>
        <input className="border p-2 rounded w-full" placeholder="Name" value={customer.name} onChange={e=>setCustomer({...customer, name: e.target.value})} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input className="border p-2 rounded" placeholder="Email" value={customer.email} onChange={e=>setCustomer({...customer, email: e.target.value})} />
          <input className="border p-2 rounded" placeholder="Phone" value={customer.phone} onChange={e=>setCustomer({...customer, phone: e.target.value})} />
          <input className="border p-2 rounded" placeholder="Address" value={customer.address} onChange={e=>setCustomer({...customer, address: e.target.value})} />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow space-y-2">
        <h2 className="font-semibold">Items</h2>
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <input className="border p-2 rounded col-span-2" placeholder="Description" value={it.description} onChange={e=>setItem(i,'description', e.target.value)} />
            <input className="border p-2 rounded" placeholder="Qty" type="number" value={it.quantity} onChange={e=>setItem(i,'quantity', Number(e.target.value))} />
            <input className="border p-2 rounded" placeholder="Unit Price" type="number" value={it.unitPrice} onChange={e=>setItem(i,'unitPrice', Number(e.target.value))} />
            <input className="border p-2 rounded" placeholder="Tax Rate (e.g. 0.18)" value={it.taxRate ?? ''} onChange={e=>setItem(i,'taxRate', e.target.value === '' ? undefined : Number(e.target.value))} />
          </div>
        ))}
        <button onClick={()=>setItems([...items, { description:'', quantity:1, unitPrice:0, taxRate: undefined }])} className="px-3 py-1 border rounded">+ Add Item</button>
      </div>

      <div className="bg-white p-4 rounded shadow space-y-2">
        <h2 className="font-semibold">Other</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input className="border p-2 rounded" placeholder="Due in days" type="number" value={dueInDays} onChange={e=>setDueInDays(Number(e.target.value))} />
          <input className="border p-2 rounded" value={currency} disabled />
        </div>
        <textarea className="w-full border p-2 rounded" rows={3} placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)} />
      </div>

      <button onClick={save} disabled={saving} className="px-4 py-2 bg-black text-white rounded">{saving ? 'Saving…' : 'Save Invoice'}</button>
    </div>
  );
}
