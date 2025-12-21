
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Fix potential quote issue in DATABASE_URL
if (process.env.DATABASE_URL) {
  let url = process.env.DATABASE_URL;
  if (url.startsWith("'") || url.startsWith('"')) {
    url = url.slice(1, -1);
  }
  // Force correct database name if it seems wrong
  process.env.DATABASE_URL = url;
}

const prisma = new PrismaClient();

async function main() {
  const business = await prisma.business.findFirst();
  if (!business) {
    console.log('No business found');
    return;
  }
  console.log(`Checking Business: ${business.name} (${business.id})`);

  // 1. Check Expenses
  const expenses = await prisma.expense.findMany({ where: { businessId: business.id } });
  console.log(`\nTotal Expenses Count: ${expenses.length}`);
  if (expenses.length > 0) {
      const totalExp = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      console.log(`Calculated Total Expense Amount: ${totalExp}`);
      console.log('Sample Expense:', expenses[0]);
  } else {
      console.log('No expenses found in DB.');
  }

  // 2. Check Invoices
  const invoices = await prisma.invoice.findMany({ where: { businessId: business.id } });
  console.log(`\nTotal Invoices Count: ${invoices.length}`);
  
  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.amountPaid), 0);
  const totalReceivable = invoices.reduce((sum, inv) => {
    if (inv.status !== 'DRAFT') return sum + Number(inv.balanceDue);
    return sum;
  }, 0);

  console.log(`Calculated Revenue (amountPaid): ${totalRevenue}`);
  console.log(`Calculated Receivables (balanceDue): ${totalReceivable}`);

  if (invoices.length > 0) {
      console.log('Sample Invoice:', JSON.stringify(invoices[0], null, 2));
  } else {
      console.log('No invoices found in DB.');
  }

  // 3. Check Payments (Independent Check)
  const payments = await prisma.payment.findMany({
      where: { invoice: { businessId: business.id } }
  });
  console.log(`\nTotal Payments Count: ${payments.length}`);
  const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  console.log(`Total Payments Amount: ${totalPayments}`);

}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
