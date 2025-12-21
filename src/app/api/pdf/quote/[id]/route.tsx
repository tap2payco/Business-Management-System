import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { renderPdfFromTemplate } from '@/lib/pdf-puppeteer';
import { auth } from '@/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.businessId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { items: true, customer: true, business: true }
    });

    if (!quote) return new Response('Not found', { status: 404 });

    // Security check
    if (quote.businessId !== session.user.businessId && !session.user.isSuperAdmin) {
      return new Response('Forbidden', { status: 403 });
    }

    // Prepare logo - now stored as base64
    let logoDataUrl: string | undefined;
    if (quote.business.logo) {
      if (quote.business.logo.startsWith('data:')) {
        logoDataUrl = quote.business.logo;
      } else {
        logoDataUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="50" viewBox="0 0 60 50"><rect width="60" height="50" fill="%236366f1"/><text x="30" y="30" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">QUOTE</text></svg>';
      }
    } else {
      logoDataUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="50" viewBox="0 0 60 50"><rect width="60" height="50" fill="%236366f1"/><text x="30" y="30" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">QUOTE</text></svg>';
    }

    // Prepare items
    const items = quote.items.map((item: any) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unit: item.unit || 'pcs',
      unitPrice: Number(item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      lineTotal: Number(item.lineTotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }));

    const pdfData = {
      number: quote.number,
      business: {
        name: quote.business.name,
        email: quote.business.email || undefined,
        phone: quote.business.phone || undefined,
        address: quote.business.address || undefined,
        currency: quote.business.currency,
        logo: logoDataUrl,
        quoteTerms: quote.business.quoteTerms || undefined
      },
      customer: {
        name: quote.customer.name,
        address: quote.customer.address || undefined
      },
      items,
      issueDate: quote.issueDate ? new Date(quote.issueDate).toISOString().slice(0,10) : undefined,
      expiryDate: quote.expiryDate ? new Date(quote.expiryDate).toISOString().slice(0,10) : undefined,
      subtotal: Number(quote.subtotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      taxTotal: Number(quote.taxTotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      grandTotal: Number(quote.grandTotal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      currency: quote.business.currency,
      notes: quote.notes || undefined
    };

    const pdfBuffer = await renderPdfFromTemplate('quote', pdfData);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="quote-${quote.number}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generating Quote PDF:', error);
    return new Response('PDF generation failed', { status: 500 });
  }
}
