import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { renderPdfFromTemplate } from '@/lib/pdf-puppeteer';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const receipt = await prisma.receipt.findUnique({ where: { id }, include: { payment: { include: { invoice: { include: { business: true, customer: true } } } } } });
  if (!receipt) return new Response('Not found', { status: 404 });

  // Prepare logo as data URL (same logic as before)
  let logoDataUrl: string | undefined;
  if (receipt.payment?.invoice?.business?.logo) {
    try {
      const logPath = receipt.payment.invoice.business.logo;
      if (logPath.startsWith('http://') || logPath.startsWith('https://')) {
        logoDataUrl = logPath;
      } else if (logPath.startsWith('/')) {
        const fullPath = path.join(process.cwd(), 'public', logPath);
        if (fs.existsSync(fullPath)) {
          const buffer = fs.readFileSync(fullPath);
          const ext = path.extname(fullPath).toLowerCase().slice(1);
          const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
          logoDataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
        }
      }
    } catch (e) {
      console.warn('Failed to process receipt logo:', e);
    }
  }
  if (!logoDataUrl) {
    logoDataUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="50" viewBox="0 0 60 50"><rect width="60" height="50" fill="%232c3e50"/><text x="30" y="30" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">LOGO</text></svg>';
  }

  // Prepare data for template
  const pdfData = {
    number: receipt.number,
    issuedAt: receipt.issuedAt ? new Date(receipt.issuedAt).toISOString().slice(0,10) : undefined,
    amount: receipt.payment ? Number((receipt.payment as any).amount) : 0,
    currency: receipt.payment?.invoice?.currency || '',
    business: {
      name: receipt.payment?.invoice?.business?.name || '',
      address: receipt.payment?.invoice?.business?.address || '',
      logo: logoDataUrl
    },
    customer: {
      name: receipt.payment?.invoice?.customer?.name || '',
      address: receipt.payment?.invoice?.customer?.address || ''
    },
  // notes field removed: not present in schema
  };

  try {
    const pdfBuffer = await renderPdfFromTemplate('receipt', pdfData);
  return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="receipt-${receipt.number}.pdf"`
      }
    });
  } catch (e) {
    console.error('Puppeteer PDF render error', e);
    return new Response('PDF generation failed', { status: 500 });
  }
}
