'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

interface InvoiceData {
  id: string;
  businessId: string;
  currency: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: {
    id?: string;
    itemId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    unit?: string;
  }[];
}

export default function EditInvoiceClient({ invoice }: { invoice: InvoiceData }) {
  const router = useRouter();
  const [customer, setCustomer] = useState(invoice.customer);
  const [items, setItems] = useState(invoice.items.map(i => ({ ...i, unit: i.unit || 'pcs' })));
  const [notes, setNotes] = useState(invoice.notes);
  
  // Calculate default due days from dates
  const issue = new Date(invoice.issueDate);
  const due = new Date(invoice.dueDate);
  const diffTime = Math.abs(due.getTime() - issue.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const [dueInDays, setDueInDays] = useState(diffDays);

  // Initialize global tax from first item with tax, assuming items share rate or defaulting to 0
  const initialTaxRate = invoice.items.find(i => (i.taxRate || 0) > 0)?.taxRate || 0;
  // Convert from decimal (0.18) to percent (18) if needed? 
  // Wait, schema says Decimal. Usually stored as 18 for 18%? Or 0.18?
  // NewInvoiceClient used `globalTaxRate / 100` in payload, implying user inputs 18.
  // If DB stores 0.18, we multiply by 100. If DB stores 18, we keep 18.
  // Let's assume DB stores 0.18 based on `NewInvoiceClient` sending `rate / 100`.
  // So we init state with `initialTaxRate * 100`.
  const [globalTaxRate, setGlobalTaxRate] = useState(initialTaxRate * 100);

  const [saving, setSaving] = useState(false);
  const COMMON_UNITS = ['pcs', 'hrs', 'kg', 'box', 'service', 'm', 'ft'];
  
  // Autocomplete states
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
  
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);

  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [itemSearchTerm, setItemSearchTerm] = useState('');

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

  // Customer Autocomplete Logic
  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomer(prev => ({ ...prev, name: value }));
    
    if (value.length > 0) {
      const filtered = availableCustomers.filter(c => 
        c.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setShowCustomerSuggestions(true);
    } else {
      setShowCustomerSuggestions(false);
    }
  };

  const selectCustomer = (c: Customer) => {
    setCustomer({
      id: c.id,
      name: c.name,
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || ''
    });
    setShowCustomerSuggestions(false);
  };

  // Item Autocomplete Logic
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
      return { ...it, [key]: value };
    })); 
  }

  async function save() {
    setSaving(true);
    
    const issueDate = new Date(invoice.issueDate);
    const dueDate = new Date(issueDate.getTime() + (dueInDays ?? 14) * 864e5);

    const payload = { 
      customer, 
      items: items.map(i => ({ 
          ...i, 
          quantity: Number(i.quantity), 
          unitPrice: Number(i.unitPrice),
          unit: i.unit,
          taxRate: globalTaxRate / 100
      })), 
      issueDate: issueDate.toISOString(), 
      dueDate: dueDate.toISOString(), 
      currency: invoice.currency, 
      notes 
    };

    try {
      const res = await fetch(`/api/invoices/${invoice.id}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Unknown error');
      }

      const data = await res.json();
      router.push(`/invoices/${data.id}`);
      router.refresh();
    } catch (error) {
      alert('Failed to update invoice: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  }

  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  const totalTax = subtotal * (globalTaxRate / 100);
  const grandTotal = subtotal + totalTax;

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8 px-4">
      <datalist id="unit-options">
          {COMMON_UNITS.map(u => <option key={u} value={u} />)}
      </datalist>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Invoice #{invoice.id.slice(0, 8)}</h1>
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">Cancel</button>
      </div>

      <div className="bg-white p-4 rounded shadow space-y-4">
        <h2 className="font-semibold">Customer</h2>
        <div className="relative">
          <input 
            aria-label="Customer Name" 
            className="border p-2 rounded w-full" 
            placeholder="Name" 
            value={customer.name} 
            onChange={handleCustomerNameChange}
            onFocus={() => {
              if (customer.name) {
                setFilteredCustomers(availableCustomers.filter(c => c.name.toLowerCase().includes(customer.name.toLowerCase())));
                setShowCustomerSuggestions(true);
              }
            }}
            onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 200)}
          />
          {showCustomerSuggestions && filteredCustomers.length > 0 && (
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
             <div className="sm:col-span-5 relative">
              <input
                aria-label="Search Item"
                className="border p-2 rounded w-full"
                placeholder="Search Item"
                value={activeItemIndex === i ? itemSearchTerm : (availableItems.find(x => x.id === it.itemId)?.name || (it.itemId ? 'Unknown Item' : ''))}
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
                          {invoice.currency} {item.unitPrice}
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
              <input 
                aria-label="Item Unit" 
                className="border p-2 rounded w-full" 
                placeholder="Unit" 
                value={it.unit || ''} 
                onChange={e=>setItem(i, 'unit', e.target.value)} 
                list="unit-options"
              />
            </div>
            <div className="sm:col-span-1">
              <input aria-label="Item Quantity" className="border p-2 rounded w-full" placeholder="Qty" type="number" value={it.quantity} onChange={e=>setItem(i,'quantity', Number(e.target.value))} />
            </div>
            <div className="sm:col-span-1">
              <input aria-label="Item Price" className="border p-2 rounded w-full" placeholder="Price" type="number" value={it.unitPrice} onChange={e=>setItem(i,'unitPrice', Number(e.target.value))} />
            </div>
          </div>
        ))}
        <button onClick={()=>setItems([...items, { itemId: undefined, description:'', quantity:1, unitPrice:0, taxRate: undefined, unit: 'pcs' }])} className="px-3 py-1 border rounded">+ Add Item</button>

        <div className="mt-4 border-t pt-4 flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{invoice.currency} {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-gray-600">Global Tax (%):</span>
                <input 
                    type="number" 
                    className="border p-1 w-20 rounded text-right" 
                    value={globalTaxRate} 
                    onChange={(e) => setGlobalTaxRate(Number(e.target.value))} 
                />
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-gray-600">Tax Amount:</span>
                <span className="font-medium">{invoice.currency} {totalTax.toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2 text-lg font-bold border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span>{invoice.currency} {grandTotal.toLocaleString()}</span>
            </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow space-y-2">
        <h2 className="font-semibold">Other</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input aria-label="Due in Days" className="border p-2 rounded" placeholder="Due in days" type="number" value={dueInDays} onChange={e=>setDueInDays(Number(e.target.value))} />
          <input aria-label="Currency" className="border p-2 rounded" value={invoice.currency} disabled />
        </div>
        <textarea aria-label="Invoice Notes" className="w-full border p-2 rounded" rows={3} placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)} />
      </div>

      <button onClick={save} disabled={saving} className="px-4 py-2 bg-black text-white rounded w-full sm:w-auto">{saving ? 'Saving…' : 'Update Invoice'}</button>
    </div>
  );
}
