"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Quote {
  id: string;
  number: string;
  status: string;
  issueDate: string;
  expiryDate: string | null;
  validUntil: string | null;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  notes: string | null;
  terms: string | null;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    taxRate: number;
    lineTotal: number;
  }>;
}

export default function ViewQuotePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadQuote();
    }
  }, [id]);

  async function loadQuote() {
    try {
      const res = await fetch(`/api/quotes/${id}`);
      if (!res.ok) throw new Error('Failed to fetch quote');
      const data = await res.json();
      setQuote(data);
    } catch (error) {
      console.error('Failed to load quote:', error);
      setError('Failed to load quote');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(status: string) {
    if (!id) return;
    if (!confirm(`Are you sure you want to mark this quote as ${status}?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      
      await loadQuote();
      router.refresh();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  }

  async function convertToInvoice() {
    if (!id) return;
    if (!confirm('Convert this quote to an invoice? This action cannot be undone.')) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${id}/convert`, {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to convert quote');
      }

      const invoice = await res.json();
      router.push(`/invoices/${invoice.id}`);
      router.refresh();
    } catch (error: any) {
      console.error('Failed to convert quote:', error);
      alert(error.message || 'Failed to convert quote');
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteQuote() {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this quote? This action cannot be undone.')) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete quote');
      }

      router.push('/quotes');
      router.refresh();
    } catch (error: any) {
      console.error('Failed to delete quote:', error);
      alert(error.message || 'Failed to delete quote');
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteQuote() {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this quote? This action cannot be undone.')) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete quote');
      }

      router.push('/quotes');
      router.refresh();
    } catch (error: any) {
      console.error('Failed to delete quote:', error);
      alert(error.message || 'Failed to delete quote');
    } finally {
      setActionLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-orange-100 text-orange-800',
      CONVERTED: 'bg-purple-100 text-purple-800',
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  }

  if (loading) {
    return <div className="p-8">Loading quote...</div>;
  }

  if (error || !quote) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Quote not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{quote.number}</h1>
          <div className="flex items-center gap-3">
            {getStatusBadge(quote.status)}
            <span className="text-sm text-gray-500">
              Issued: {new Date(quote.issueDate).toLocaleDateString()}
            </span>
            {quote.expiryDate && (
              <span className="text-sm text-gray-500">
                Expires: {new Date(quote.expiryDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => router.push('/quotes')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Back to Quotes
          </button>
          {(quote.status === 'DRAFT' || quote.status === 'SENT') && (
            <button
              onClick={() => router.push(`/quotes/${id}/edit`)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer</h2>
        <div className="space-y-1">
          <p className="font-medium text-gray-900">{quote.customer.name}</p>
          {quote.customer.email && <p className="text-sm text-gray-600">{quote.customer.email}</p>}
          {quote.customer.phone && <p className="text-sm text-gray-600">{quote.customer.phone}</p>}
          {quote.customer.address && <p className="text-sm text-gray-600">{quote.customer.address}</p>}
        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tax Rate</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {quote.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">
                  {item.quantity} {item.unit}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">
                  TZS {item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">
                  {(item.taxRate * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                  TZS {item.lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="mt-6 border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">TZS {quote.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax:</span>
            <span className="font-medium">TZS {quote.taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Grand Total:</span>
            <span>TZS {quote.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      {(quote.notes || quote.terms || quote.validUntil) && (
        <div className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          {quote.validUntil && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Validity</h3>
              <p className="text-sm text-gray-600">{quote.validUntil}</p>
            </div>
          )}
          {quote.notes && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Notes</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}
          {quote.terms && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Terms & Conditions</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{quote.terms}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quote.status === 'DRAFT' && (
            <>
              <button
                onClick={() => updateStatus('SENT')}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Mark as Sent
              </button>
              <button
                onClick={deleteQuote}
                disabled={actionLoading}
                className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                title="Delete Draft Quote"
              >
                Delete Quote
              </button>
            </>
          )}
          
          <a
            href={`/api/pdf/quote/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <span>Download PDF</span>
          </a>

          {(quote.status === 'SENT' || quote.status === 'DRAFT') && (
            <>
              <button
                onClick={() => updateStatus('ACCEPTED')}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Accept Quote
              </button>
              <button
                onClick={() => updateStatus('REJECTED')}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Reject Quote
              </button>
            </>
          )}
          {quote.status === 'ACCEPTED' && (
            <button
              onClick={convertToInvoice}
              disabled={actionLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Convert to Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
