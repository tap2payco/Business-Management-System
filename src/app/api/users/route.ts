import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { canManageUsers } from '@/lib/permissions';
import { hash } from 'bcrypt';

export const dynamic = 'force-dynamic';

// GET /api/users - List all users in the business
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: {
        businessId: session.user.businessId
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/users - Invite a new user
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user has permission to manage users
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, businessId: true }
    });

    if (!currentUser || !canManageUsers(currentUser)) {
      return NextResponse.json(
        { error: 'Only business owners can invite users' },
        { status: 403 }
      );
    }

    const { phone, name, role, password, email } = await req.json();

    // Validate input
    if (!phone || !name || !role || !password) {
      return NextResponse.json(
        { error: 'Phone, name, role, and password are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Only admin and member roles can be invited' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this phone number already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        phone,
        name,
        email: email || null,
        role,
        password: hashedPassword,
        businessId: session.user.businessId
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // TODO: Send email notification if email provided
    // You can integrate with Resend, SendGrid, or any email service
    // Example:
    // if (email) {
    //   await sendInvitationEmail({
    //     to: email,
    //     userName: name,
    //     businessName: session.user.businessName,
    //     phone,
    //     temporaryPassword: password
    //   });
    // }

    return NextResponse.json({
      message: 'User invited successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    return NextResponse.json({ error: 'Failed to invite user' }, { status: 500 });
  }
}
