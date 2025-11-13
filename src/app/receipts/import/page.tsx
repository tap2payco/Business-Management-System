
'use client';
import { useState } from 'react';
export default function ImportReceiptPage(){
  const [imageUrl, setImageUrl] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [parsed, setParsed] = useState<any>(null);
  async function parse(){ const res = await fetch('/api/ai/receipt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageUrl }) }); const data = await res.json(); setParsed(data); }
  async function postPayment(){ if (!parsed?.total || !invoiceId) return; await fetch(`/invoices/${invoiceId}/pay`, { method: 'POST', body: JSON.stringify({ amount: parsed.total, method: 'receipt-ocr' }) }); window.location.href = `/invoices/${invoiceId}`; }
  return (
    <div className='space-y-4'>
      <h1 className='text-xl font-semibold'>Import Receipt (OCR)</h1>
      <input className='border p-2 rounded w-full' placeholder='Public image URL' value={imageUrl} onChange={e=>setImageUrl(e.target.value)} />
      <button onClick={parse} className='px-3 py-2 bg-indigo-600 text-white rounded'>Parse with AI</button>
      {parsed && (
        <div className='bg-white p-4 rounded shadow space-y-2'>
          <div><b>Vendor:</b> {parsed.vendor}</div>
          <div><b>Date:</b> {parsed.date}</div>
          <div><b>Total:</b> {parsed.total} {parsed.currency}</div>
          <div className='pt-2'>
            <input className='border p-2 rounded' placeholder='Invoice ID to credit' value={invoiceId} onChange={e=>setInvoiceId(e.target.value)} />
            <button onClick={postPayment} className='ml-2 px-3 py-2 bg-black text-white rounded'>Post as Payment</button>
          </div>
        </div>
      )}
    </div>
  );
}
