import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Get phone number from command line argument
  const phone = process.argv[2];

  if (!phone) {
    console.error('❌ Please provide a phone number as an argument');
    console.log('Usage: npx tsx scripts/promote-admin.ts <phone-number>');
    console.log('Example: npx tsx scripts/promote-admin.ts 0747619168');
    process.exit(1);
  }

  console.log(`👑 Promoting user with phone ${phone} to Super Admin...`);

  try {
    const user = await prisma.user.update({
      where: { phone },
      data: { isSuperAdmin: true },
      select: { 
        name: true, 
        phone: true, 
        isSuperAdmin: true,
        business: {
          select: { name: true }
        }
      }
    });

    console.log('✅ Success! User updated:');
    console.table({
      Name: user.name,
      Phone: user.phone,
      'Super Admin': user.isSuperAdmin,
      Business: user.business.name
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error(`❌ User with phone ${phone} not found`);
    } else {
      console.error('❌ Error updating user:', error.message);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
