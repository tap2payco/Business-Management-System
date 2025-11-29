const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('Starting database cleanup...\n');
  
  // Delete all data in correct order (respecting foreign keys)
  await prisma.receipt.deleteMany({});
  console.log('✓ Deleted all receipts');
  
  await prisma.payment.deleteMany({});
  console.log('✓ Deleted all payments');
  
  await prisma.invoiceItem.deleteMany({});
  console.log('✓ Deleted all invoice items');
  
  await prisma.invoice.deleteMany({});
  console.log('✓ Deleted all invoices');
  
  await prisma.customer.deleteMany({});
  console.log('✓ Deleted all customers');
  
  await prisma.expense.deleteMany({});
  console.log('✓ Deleted all expenses');
  
  await prisma.item.deleteMany({});
  console.log('✓ Deleted all items');
  
  await prisma.sequence.deleteMany({});
  console.log('✓ Deleted all sequences');
  
  // Find the business with the logo
  const businessWithLogo = await prisma.business.findFirst({
    where: { logo: { not: null } }
  });
  
  if (businessWithLogo) {
    console.log(`\nFound business with logo: ${businessWithLogo.name}`);
    console.log(`Business ID: ${businessWithLogo.id}`);
    console.log(`Logo: ${businessWithLogo.logo}`);
    
    // Update all users to point to the business with logo
    const userUpdate = await prisma.user.updateMany({
      data: { businessId: businessWithLogo.id }
    });
    console.log(`✓ Updated ${userUpdate.count} users to use business with logo`);
    
    // Now delete all other businesses
    const deletedBusinesses = await prisma.business.deleteMany({
      where: { id: { not: businessWithLogo.id } }
    });
    console.log(`✓ Deleted ${deletedBusinesses.count} extra businesses`);
  } else {
    console.log('⚠ No business with logo found');
  }
  
  await prisma.$disconnect();
  console.log('\n✅ Database cleanup complete!');
  console.log('\nYou now have a clean database with:');
  console.log('- 1 business (with logo)');
  console.log('- Your user account(s)');
  console.log('- No invoices, customers, expenses, or items');
}

cleanDatabase().catch(console.error);
