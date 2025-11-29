const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLogo() {
  const business = await prisma.business.findFirst();
  console.log('Business:', {
    id: business?.id,
    name: business?.name,
    logo: business?.logo
  });
  await prisma.$disconnect();
}

checkLogo();
