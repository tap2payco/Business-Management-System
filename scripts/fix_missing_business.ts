
import { prisma } from '../src/lib/prisma';

async function main() {
  const phone = '0710375264';
  console.log(`Checking user: ${phone}`);
  
  const user = await prisma.user.findUnique({ 
    where: { phone } 
  });
  
  if (!user) {
      console.log('User not found.');
      return;
  }
  
  console.log(`Found user ${user.name} (${user.id}) with BusinessID: ${user.businessId}`);

  const businessId = user.businessId;

  // Check if business exists
  const business = await prisma.business.findUnique({ 
    where: { id: businessId } 
  });
  
  if (business) {
    console.log(`Business '${business.name}' already exists.`);
  } else {
    console.log(`Business with ID '${businessId}' is MISSING. Creating it now...`);
    
    try {
        await prisma.business.create({
            data: {
                id: businessId,
                name: 'My Business (Restored)',
                email: 'admin@example.com',
                phone: phone,
                address: 'Please update your address in Settings',
                currency: 'TZS',
                taxRate: 18.0,
                invoiceTemplate: 'modern',
                receiptTemplate: 'modern'
            }
        });
        console.log('✅ Business record restored successfully!');
    } catch (createError) {
        console.error('Failed to create business:', createError);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
