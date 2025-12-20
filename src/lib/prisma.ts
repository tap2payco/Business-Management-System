
import { PrismaClient } from '@prisma/client';
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Automatic workaround: Append pgbouncer=true for Transaction Mode poolers if missing
const prismaClientSingleton = () => {
    let url = process.env.DATABASE_URL;
    if (url && url.includes('6543') && !url.includes('pgbouncer=true')) {
        url += url.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true';
    }
    return new PrismaClient({
        datasources: {
            db: {
                url,
            },
        },
    });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
