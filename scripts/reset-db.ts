import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting database cleanup...');

  // 1. Identify Super Admins to preserve
  const superAdmins = await prisma.user.findMany({
    where: { isSuperAdmin: true },
    select: { id: true, businessId: true }
  });

  if (superAdmins.length === 0) {
    console.warn('⚠️ No Super Admin found! Aborting to prevent total data loss.');
    console.warn('   Please promote a user to Super Admin first.');
    return;
  }

  const superAdminIds = superAdmins.map(u => u.id);
  const superAdminBusinessIds = superAdmins.map(u => u.businessId);

  console.log(`ℹ️ Found ${superAdmins.length} Super Admin(s). Preserving them and their Business records.`);

  // 2. Delete transactional data (Global wipe - everyone starts clean)
  // Deleting in order of dependencies (child first)
  
  console.log('Deleting Receipts...');
  await prisma.receipt.deleteMany({});

  console.log('Deleting Payments...');
  await prisma.payment.deleteMany({});

  console.log('Deleting Invoice Items...');
  await prisma.invoiceItem.deleteMany({});

  console.log('Deleting Invoices...');
  await prisma.invoice.deleteMany({});

  console.log('Deleting Expenses...');
  await prisma.expense.deleteMany({});

  console.log('Deleting Items...');
  await prisma.item.deleteMany({});

  console.log('Deleting Customers...');
  await prisma.customer.deleteMany({});

  // 3. Delete Users (except Super Admins)
  console.log('Deleting non-Super Admin Users...');
  await prisma.user.deleteMany({
    where: {
      id: { notIn: superAdminIds }
    }
  });

  // 4. Delete Businesses (except Super Admin's Business)
  console.log('Deleting other Businesses...');
  await prisma.business.deleteMany({
    where: {
      id: { notIn: superAdminBusinessIds }
    }
  });

  console.log('✅ Database reset complete!');
  console.log('   - Super Admin account(s) preserved.');
  console.log('   - Super Admin business record(s) preserved.');
  console.log('   - All other data wiped.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
