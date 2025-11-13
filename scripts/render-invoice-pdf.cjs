const { PrismaClient } = require('@prisma/client');
const React = require('react');
const { Document, Page, Text, View, StyleSheet, renderToStream, renderToBuffer } = require('@react-pdf/renderer');
const fs = require('fs');

const prisma = new PrismaClient();

async function main(id){
  const inv = await prisma.invoice.findUnique({ where: { id }, include: { items: true, customer: true, business: true, payments: true } });
  if(!inv){
    console.error('invoice not found');
    process.exit(1);
  }
  const items = inv.items.map(it=>({ description: it.description, quantity: Number(it.quantity), unitPrice: Number(it.unitPrice), lineTotal: Number(it.lineTotal) }));
  const subtotal = items.reduce((s,i)=>s + i.lineTotal, 0);
  const doc = React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: { padding: 40 } },
      React.createElement(View, null,
        React.createElement(Text, null, `Invoice ${inv.number}`),
        React.createElement(Text, null, `To: ${inv.customer.name}`)
      ),
      ...items.map(item => React.createElement(View, { key: item.description }, React.createElement(Text, null, item.description), React.createElement(Text, null, String(item.lineTotal))))
    )
  );

  try{
    const buffer = await renderToBuffer(doc);
    const outPath = process.argv[3] || '/tmp/invoice_isolated.pdf';
    fs.writeFileSync(outPath, buffer);
    console.log(outPath);
  }catch(e){
    console.error('Render error', e);
    process.exit(1);
  } finally{
    await prisma.$disconnect();
  }
}

if(require.main === module){
  const id = process.argv[2];
  if(!id){ console.error('usage: node render-invoice-pdf.cjs <invoiceId>'); process.exit(1); }
  main(id).catch(e=>{ console.error(e); process.exit(1); });
}
