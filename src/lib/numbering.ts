
import { prisma } from './prisma';

export async function getNextNumber(kind: 'invoice' | 'receipt' | 'quote') {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const seq = await prisma.$transaction(async (tx) => {
    let s = await tx.sequence.findUnique({ where: { kind_year: { kind, year } } });
    if (!s) s = await tx.sequence.create({ data: { kind, year, next: 1 } });
    const current = s.next;
    await tx.sequence.update({ where: { kind_year: { kind, year } }, data: { next: current + 1 } });
    return current;
  });

  const pad = (n: number) => n.toString().padStart(3, '0');
  let prefix = '';
  if (kind === 'invoice') prefix = 'INV';
  else if (kind === 'receipt') prefix = 'RCT';
  else if (kind === 'quote') prefix = 'QT';

  return `${prefix}-${dateStr}-${pad(seq)}`;
}
