const React = require('react');
const { PrismaClient } = require('@prisma/client');
const { Document, Page, Text, View, renderToBuffer } = require('@react-pdf/renderer');
const fs = require('fs');

const prisma = new PrismaClient();

async function main(id, outPath){
  const receipt = await prisma.receipt.findUnique({ where: { id }, include: { payment: { include: { invoice: { include: { business: true, customer: true } } } } } });
  if(!receipt){ console.error('receipt not found'); process.exit(1); }
  const payment = receipt.payment;
  const invoice = payment?.invoice;

  const doc = React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: { padding: 32 } },
      React.createElement(Text, null, `Receipt ${receipt.number}`),
      React.createElement(View, null,
        React.createElement(Text, null, `Business: ${invoice?.business?.name || ''}`),
        React.createElement(Text, null, `Received From: ${invoice?.customer?.name || ''}`),
        React.createElement(Text, null, `Invoice: ${invoice?.number || ''}`),
        React.createElement(Text, null, `Amount: ${Number(payment?.amount || 0).toFixed(2)} ${invoice?.currency || ''}`),
        React.createElement(Text, null, `Date: ${new Date(receipt.issuedAt).toLocaleString()}`)
      )
    )
  );

  try{
    const buffer = await renderToBuffer(doc);
    const out = outPath || `/tmp/receipt_${id}.pdf`;
    fs.writeFileSync(out, buffer);
    console.log(out);
  }catch(e){
    console.error('render error', e);
    process.exit(1);
  } finally{
    await prisma.$disconnect();
  }
}

if(require.main === module){
  const id = process.argv[2];
  const outPath = process.argv[3];
  if(!id){ console.error('usage: node render-receipt-pdf.cjs <receiptId> [outPath]'); process.exit(1); }
  main(id, outPath).catch(e=>{ console.error(e); process.exit(1); });
}
