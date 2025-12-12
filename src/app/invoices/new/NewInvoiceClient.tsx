
'use client';
import { useState, useEffect } from 'react';

interface Item {
  id: string;
  name: string;
  description: string | null;
  unitPrice: number;
  taxRate: number;
  unit?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export default function NewInvoiceClient({ businessId, currency, defaultDueDays }: { businessId?: string; currency: string; defaultDueDays: number; }) {
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '' });
  const [items, setItems] = useState([{ itemId: undefined as string | undefined, description: '', quantity: 1, unitPrice: 0, taxRate: undefined as number | undefined, unit: 'pcs' }]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Item autocomplete state
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [notes, setNotes] = useState('');
  const [dueInDays, setDueInDays] = useState(defaultDueDays);
  const [aiNote, setAiNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/items').then(res => res.json()),
      fetch('/api/customers').then(res => res.json())
    ])
      .then(([itemsData, customersData]) => {
        setAvailableItems(Array.isArray(itemsData) ? itemsData : []);
        setAvailableCustomers(Array.isArray(customersData) ? customersData : []);
      })
      .catch(err => console.error('Failed to fetch data:', err));
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomer(prev => ({ ...prev, name: value }));
    
    if (value.length > 0) {
      const filtered = availableCustomers.filter(c => 
        c.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCustomer = (c: Customer) => {
    setCustomer({
      name: c.name,
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || ''
    });
    setShowSuggestions(false);
  };

  const handleItemSearchChange = (index: number, value: string) => {
    setItemSearchTerm(value);
    setActiveItemIndex(index);
    
    if (value.length > 0) {
      const filtered = availableItems.filter(item => 
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(availableItems);
    }
  };

  const selectItem = (index: number, item: Item) => {
    setItems(prev => prev.map((it, idx) => {
      if (idx !== index) return it;
      return {
        ...it,
        itemId: item.id,
        description: item.name + (item.description ? ` - ${item.description}` : ''),
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        unit: item.unit || 'pcs'
      };
    }));
    setActiveItemIndex(null);
    setItemSearchTerm('');
  };

  function setItem(i: number, key: string, value: any) { 
    setItems(prev => prev.map((it, idx) => {
      if (idx !== i) return it;
      
      // If selecting an item from catalog
      if (key === 'itemId') {
        const selectedItem = availableItems.find(item => item.id === value);
        if (selectedItem) {
          return {
            ...it,
            itemId: value,
            description: selectedItem.name + (selectedItem.description ? ` - ${selectedItem.description}` : ''),
            unitPrice: selectedItem.unitPrice,
            taxRate: selectedItem.taxRate,
            unit: selectedItem.unit || 'pcs'
          };
        }
      }
      
      return { ...it, [key]: value };
    })); 
  }


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
      if (draft.items?.length > 0) setItems(draft.items.map((i: any) => ({ ...i, unit: i.unit || 'pcs' })));
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
    const payload = { businessId, customer, items: items.map(i => ({ ...i, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice), unit: i.unit })), issueDate: now.toISOString(), dueDate: due.toISOString(), currency, notes };
    const res = await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    
    if (!res.ok) {
      const err = await res.json();
      setSaving(false);
      alert('Failed to save invoice: ' + (err.error || 'Unknown error'));
      return;
    }

    const data = await res.json();
    setSaving(false);
    if (data?.id) {
      window.location.href = `/invoices/${data.id}`;
    } else {
      alert('Failed to save invoice: No ID returned');
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow space-y-2">
        <label htmlFor="ai-input" className="font-medium">Describe the invoice (AI)</label>
        <textarea id="ai-input" value={aiNote} onChange={e=>setAiNote(e.target.value)} className="w-full border p-2 rounded" rows={4} placeholder='e.g. "Mchele Ltd, 5 steel pipes @ 12000 each, VAT 18%, due in 14 days"'></textarea>
        <button onClick={useAI} className="px-3 py-2 bg-indigo-600 text-white rounded">Draft with AI</button>
      </div>

      <div className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="font-semibold">Customer</h2>
        <h2 className="font-semibold">Customer</h2>
        <div className="relative">
          <input 
            aria-label="Customer Name" 
            className="border p-2 rounded w-full" 
            placeholder="Name" 
            value={customer.name} 
            onChange={handleNameChange}
            onFocus={() => {
              if (customer.name) {
                setFilteredCustomers(availableCustomers.filter(c => c.name.toLowerCase().includes(customer.name.toLowerCase())));
                setShowSuggestions(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
          />
          {showSuggestions && filteredCustomers.length > 0 && (
            <div className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto mt-1">
              {filteredCustomers.map(c => (
                <div 
                  key={c.id} 
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => selectCustomer(c)}
                >
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">
                    {c.email && <span>{c.email} • </span>}
                    {c.phone}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input aria-label="Customer Email" className="border p-2 rounded" placeholder="Email" value={customer.email} onChange={e=>setCustomer({...customer, email: e.target.value})} />
          <input aria-label="Customer Phone" className="border p-2 rounded" placeholder="Phone" value={customer.phone} onChange={e=>setCustomer({...customer, phone: e.target.value})} />
          <input aria-label="Customer Address" className="border p-2 rounded" placeholder="Address" value={customer.address} onChange={e=>setCustomer({...customer, address: e.target.value})} />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow space-y-2">
        <h2 className="font-semibold">Items</h2>
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start">
             <div className="sm:col-span-3 relative">
              <input
                aria-label="Search Item"
                className="border p-2 rounded w-full"
                placeholder="Search Item"
                value={activeItemIndex === i ? itemSearchTerm : (availableItems.find(x => x.id === it.itemId)?.name || '')}
                onChange={e => handleItemSearchChange(i, e.target.value)}
                onFocus={() => {
                  setActiveItemIndex(i);
                  setItemSearchTerm(availableItems.find(x => x.id === it.itemId)?.name || '');
                  setFilteredItems(availableItems);
                }}
                onBlur={() => setTimeout(() => setActiveItemIndex(null), 200)}
              />
              {activeItemIndex === i && (
                <div className="absolute z-20 w-full bg-white border rounded shadow-lg max-h-60 overflow-auto mt-1">
                  {filteredItems.length === 0 ? (
                    <div className="p-2 text-gray-500 text-sm">No items found</div>
                  ) : (
                    filteredItems.map(item => (
                      <div 
                        key={item.id} 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectItem(i, item)}
                      >
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {currency} {item.unitPrice}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="sm:col-span-4">
              <input aria-label="Item Description" className="border p-2 rounded w-full" placeholder="Description" value={it.description} onChange={e=>setItem(i,'description', e.target.value)} />
            </div>
            <div className="sm:col-span-1">
              <input aria-label="Item Unit" className="border p-2 rounded w-full" placeholder="Unit" value={it.unit || ''} onChange={e=>setItem(i, 'unit', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <input aria-label="Item Quantity" className="border p-2 rounded w-full" placeholder="Qty" type="number" value={it.quantity} onChange={e=>setItem(i,'quantity', Number(e.target.value))} />
            </div>
            <div className="sm:col-span-2">
              <input aria-label="Item Price" className="border p-2 rounded w-full" placeholder="Price" type="number" value={it.unitPrice} onChange={e=>setItem(i,'unitPrice', Number(e.target.value))} />
            </div>
            <div className="sm:col-span-1">
              <input aria-label="Item Tax Rate" className="border p-2 rounded w-full" placeholder="Tax" value={it.taxRate ?? ''} onChange={e=>setItem(i,'taxRate', e.target.value === '' ? undefined : Number(e.target.value))} />
            </div>
          </div>
        ))}
        <button onClick={()=>setItems([...items, { itemId: undefined, description:'', quantity:1, unitPrice:0, taxRate: undefined, unit: 'pcs' }])} className="px-3 py-1 border rounded">+ Add Item</button>
      </div>

      <div className="bg-white p-4 rounded shadow space-y-2">
        <h2 className="font-semibold">Other</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input aria-label="Due in Days" className="border p-2 rounded" placeholder="Due in days" type="number" value={dueInDays} onChange={e=>setDueInDays(Number(e.target.value))} />
          <input aria-label="Currency" className="border p-2 rounded" value={currency} disabled />
        </div>
        <textarea aria-label="Invoice Notes" className="w-full border p-2 rounded" rows={3} placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)} />
      </div>

      <button onClick={save} disabled={saving} className="px-4 py-2 bg-black text-white rounded">{saving ? 'Saving…' : 'Save Invoice'}</button>
    </div>
  );
}

