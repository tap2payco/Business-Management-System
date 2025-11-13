import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { phone, password, name, businessName } = await req.json();

    // Validate input
    if (!phone || !password || !name || !businessName) {
      return NextResponse.json(
        { error: 'Phone, password, name and business name are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create business and user in a transaction
    const { business, user } = await prisma.$transaction(async (tx) => {
      const business = await tx.business.create({
        data: {
          name: businessName
        }
      });

      const user = await tx.user.create({
        data: {
          phone,
          password: hashedPassword,
          name,
          businessId: business.id
        },
        select: {
          id: true,
          phone: true,
          name: true,
          business: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      return { business, user };
    });

    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        business: {
          id: business.id,
          name: business.name
        }
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}