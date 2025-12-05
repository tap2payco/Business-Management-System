import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking for Admin users...');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isSuperAdmin: true,
      business: {
        select: {
          name: true
        }
      }
    }
  });

  if (users.length === 0) {
    console.log('❌ No users found in the database.');
  } else {
    console.log(`✅ Found ${users.length} user(s):`);
    console.table(users);
    
    const superAdmins = users.filter(u => u.isSuperAdmin);
    if (superAdmins.length > 0) {
      console.log('\n👑 Super Admin(s):');
      superAdmins.forEach(admin => {
        console.log(`- ${admin.name} (${admin.phone}) - Business: ${admin.business.name}`);
      });
    } else {
      console.log('\n⚠️ No Super Admin found.');
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
