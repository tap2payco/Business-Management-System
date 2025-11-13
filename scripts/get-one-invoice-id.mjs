import { prisma } from '../src/lib/prisma.js';

async function main(){
  const inv = await prisma.invoice.findFirst({ select: { id: true, number: true } });
  if(!inv){
    console.log('NO_INVOICE');
    process.exit(0);
  }
  console.log(inv.id + '|' + inv.number);
}

main().catch(e=>{console.error(e); process.exit(1)}).finally(()=>prisma.$disconnect());
