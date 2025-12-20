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
    const inv = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true, customer: true, business: true, payments: true }
    });

    if (!inv) return new Response('Not found', { status: 404 });

    // Security check: Ensure invoice belongs to user's business
    if (inv.businessId !== session.user.businessId && !session.user.isSuperAdmin) {
      return new Response('Forbidden', { status: 403 });
    }

    // Prepare logo as data URL (same logic as before)
    let logoDataUrl: string | undefined;
    console.log('Invoice business logo:', inv.business.logo);
    if (inv.business.logo) {
      try {
        const logPath = inv.business.logo;
        console.log('Processing logo path:', logPath);
        if (logPath.startsWith('http://') || logPath.startsWith('https://')) {
          logoDataUrl = logPath;
          console.log('Using external URL for logo');
        } else if (logPath.startsWith('/')) {
          const fullPath = path.join(process.cwd(), 'public', logPath);
          console.log('Full logo path:', fullPath);
          console.log('Logo file exists:', fs.existsSync(fullPath));
          if (fs.existsSync(fullPath)) {
            const buffer = fs.readFileSync(fullPath);
            const ext = path.extname(fullPath).toLowerCase().slice(1);
            const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
            logoDataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
            console.log('Logo converted to base64, mime:', mimeType, 'size:', buffer.length);
          }
        }
      } catch (e) {
        console.warn('Failed to process logo:', e);
      }
    }
    if (!logoDataUrl) {
      console.log('Using fallback logo');
      logoDataUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="50" viewBox="0 0 60 50"><rect width="60" height="50" fill="%232c3e50"/><text x="30" y="30" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">LOGO</text></svg>';
    }

    // Prepare data for template
    const items = inv.items.map((item: any) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unit: item.unit || '',
      unitPrice: Number(item.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      taxRate: Number(item.taxRate || 0),
      lineTotal: Number(item.lineTotal ?? (Number(item.quantity) * Number(item.unitPrice))).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }));
    const subtotal = items.reduce((s: number, it: any) => s + it.quantity * parseFloat(it.unitPrice.replace(/,/g, '')), 0);
    const taxTotal = items.reduce((s: number, it: any) => s + it.quantity * parseFloat(it.unitPrice.replace(/,/g, '')) * (it.taxRate || 0), 0);
    const grandTotal = subtotal + taxTotal;
    const amountPaid = inv.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const balanceDue = grandTotal - amountPaid;
    const pdfData = {
      number: inv.number,
      business: {
        name: inv.business.name,
        email: inv.business.email || undefined,
        phone: inv.business.phone || undefined,
        address: inv.business.address || undefined,
        currency: inv.business.currency,
        logo: logoDataUrl
      },
      customer: {
        name: inv.customer.name,
        address: inv.customer.address || undefined
      },
      items,
      issueDate: inv.issueDate ? new Date(inv.issueDate).toISOString().slice(0,10) : undefined,
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0,10) : undefined,
      subtotal: subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      taxTotal: taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      grandTotal: grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      amountPaid: amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      balanceDue: balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      currency: inv.business.currency,
      notes: inv.notes || undefined
    };

    // Use business template preference or query override
    const templateMap: Record<string, string> = {
      'modern': 'invoice-modern',
      'classic': 'invoice',
      'minimal': 'invoice-minimal'
    };
    
    // Check query param
    const { searchParams } = new URL(req.url);
    const queryTemplate = searchParams.get('template');
    
    const templateKey = (queryTemplate && templateMap[queryTemplate]) 
      ? queryTemplate 
      : inv.business.invoiceTemplate;
      
    const templateName = templateMap[templateKey] || 'invoice-modern';

    // Try Puppeteer/HTML template first
    try {
    const pdfBuffer = await renderPdfFromTemplate(templateName, pdfData);
  return new Response(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="invoice-${inv.number}.pdf"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    } catch (e) {
      console.error('Puppeteer PDF render error:', e);
      // Fallback: old child process or react-pdf
      return new Response(`PDF generation failed: ${e instanceof Error ? e.message : String(e)}`, { status: 500 });
    }
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate PDF', details: error instanceof Error ? error.message : String(error) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
