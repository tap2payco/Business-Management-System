
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('--- LISTING ALL TABLES ---');
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.table(tables);
  } catch (e) {
    console.error('Failed to list tables:', e);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
