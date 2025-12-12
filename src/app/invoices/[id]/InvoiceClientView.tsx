"use client";
import { payInvoice } from '@/app/actions/invoice';
import { useState } from 'react';

export default function InvoiceClientView({ inv }: { inv: any }) {
  const [payError, setPayError] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [template, setTemplate] = useState(inv.business?.invoiceTemplate || 'modern');

  async function handlePay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPayError('');
    setPayLoading(true);
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount') || 0);
    const method = String(formData.get('method') || 'cash');
    try {
      await payInvoice(inv.id, amount, method);
      window.location.reload();
    } catch (err: any) {
      setPayError(err.message || 'Failed to record payment');
    } finally {
      setPayLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-semibold">{inv.number}</h1>
          <div className="text-sm text-gray-600">{inv.status}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold">{String(inv.balanceDue)} {inv.currency}</div>
          <div className="text-sm text-gray-600">Balance due</div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-2">Items</h2>
        <ul className="space-y-1">
          {inv.items.map((it: any) => (
            <li key={it.id} className="flex justify-between">
              <span>{it.description}</span>
              <span>{Number(it.quantity)} {it.unit || ''} x {Number(it.unitPrice)} = {Number(it.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-right space-y-1">
          <div>Subtotal: {String(inv.subtotal)}</div>
          <div>Tax: {String(inv.taxTotal)}</div>
          <div className="font-semibold">Total: {String(inv.grandTotal)}</div>
        </div>
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <select 
          className="border p-2 rounded"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          aria-label="Select invoice template"
          title="Select invoice template"
        >
          <option value="modern">Modern Template</option>
          <option value="classic">Classic Template</option>
          <option value="minimal">Minimal Template</option>
        </select>
        <a className="px-3 py-2 border rounded bg-blue-600 text-white hover:bg-blue-700" href={`/api/pdf/invoice/${inv.id}?template=${template}`} target="_blank">Download PDF</a>
        <a className="px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200 text-gray-800" href={`/invoices/${inv.id}/edit`}>Edit Invoice</a>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-2">Record Payment</h2>
        <form onSubmit={handlePay} className="flex gap-2">
          <input name="amount" placeholder="Amount" className="border p-2 rounded" aria-label="Payment amount" />
          <select name="method" className="border p-2 rounded" aria-label="Payment method" title="Payment method"><option>cash</option><option>bank</option><option>mobile</option><option>card</option></select>
          <button className="px-3 py-2 rounded bg-black text-white" disabled={payLoading}>{payLoading ? 'Saving...' : 'Save'}</button>
        </form>
        {payError && <div className="text-red-600 mt-2">{payError}</div>}
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-2">Payments</h2>
        <ul className="space-y-1">
          {inv.payments.map((p: any) => (
            <li key={p.id} className="flex justify-between">
              <span>{new Date(p.paidAt).toLocaleString()}</span>
              <span>{String(p.amount)} {inv.currency}</span>
              <span>{p.method}</span>
              <span>{p.receipt?.number ? <a className='underline' href={`/api/pdf/receipt/${p.receipt.id}`} target='_blank'>{p.receipt.number}</a> : '-'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
