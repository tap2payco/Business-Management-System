
import { prisma } from './prisma';
export async function getNextNumber(kind: 'invoice' | 'receipt') {
  const year = new Date().getFullYear();
  const seq = await prisma.$transaction(async (tx) => {
    let s = await tx.sequence.findUnique({ where: { kind_year: { kind, year } } });
    if (!s) s = await tx.sequence.create({ data: { kind, year, next: 1 } });
    const current = s.next;
    await tx.sequence.update({ where: { kind_year: { kind, year } }, data: { next: current + 1 } });
    return current;
  });
  const pad = (n: number) => n.toString().padStart(4, '0');
  const prefix = kind === 'invoice' ? 'INV' : 'RCT';
  return `${prefix}-${year}-${pad(seq)}`;
}
