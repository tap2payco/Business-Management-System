import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const phone = '0747619168'; // Creotix Technologies
  console.log(`👑 Promoting user with phone ${phone} to Super Admin...`);

  try {
    const user = await prisma.user.update({
      where: { phone },
      data: { isSuperAdmin: true },
      select: { name: true, phone: true, isSuperAdmin: true }
    });

    console.log('✅ Success! User updated:');
    console.table(user);
  } catch (error) {
    console.error('❌ Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
