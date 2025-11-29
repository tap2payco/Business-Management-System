const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function testLogoPath() {
  const business = await prisma.business.findFirst();
  console.log('Business logo URL:', business?.logo);
  
  if (business?.logo) {
    const logoPath = business.logo;
    if (logoPath.startsWith('/')) {
      const fullPath = path.join(process.cwd(), 'public', logoPath);
      console.log('Full path:', fullPath);
      console.log('File exists:', fs.existsSync(fullPath));
      
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        console.log('File size:', stats.size, 'bytes');
        
        // Try to read and convert to base64
        const buffer = fs.readFileSync(fullPath);
        const ext = path.extname(fullPath).toLowerCase().slice(1);
        const mimeType = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
        const base64 = buffer.toString('base64');
        console.log('MIME type:', mimeType);
        console.log('Base64 length:', base64.length);
        console.log('Base64 preview:', base64.substring(0, 100) + '...');
      }
    }
  }
  
  await prisma.$disconnect();
}

testLogoPath();
