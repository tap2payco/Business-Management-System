import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Starting complete database reset...');

  try {
    // Delete in correct order to respect foreign key constraints
    
    console.log('Deleting invoice items...');
    await prisma.invoiceItem.deleteMany({});

    console.log('Deleting receipts...');
    await prisma.receipt.deleteMany({});

    console.log('Deleting payments...');
    await prisma.payment.deleteMany({});

    console.log('Deleting invoices...');
    await prisma.invoice.deleteMany({});

    console.log('Deleting expenses...');
    await prisma.expense.deleteMany({});

    console.log('Deleting items...');
    await prisma.item.deleteMany({});

    console.log('Deleting customers...');
    await prisma.customer.deleteMany({});

    console.log('Deleting users...');
    await prisma.user.deleteMany({});

    console.log('Deleting businesses...');
    await prisma.business.deleteMany({});

    console.log('✅ All data deleted successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Go to /signup to create a new account');
    console.log('2. This will create your first business and owner user');
    console.log('3. Use Prisma Studio to manually set isSuperAdmin = true for that user');
  } catch (error) {
    console.error('❌ Error during reset:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
