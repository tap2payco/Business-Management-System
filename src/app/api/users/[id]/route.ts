import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { prisma } from '@/lib/prisma';
import { canManageUsers } from '@/lib/permissions';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT /api/users/[id] - Update user role
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user has permission
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, businessId: true }
    });

    if (!currentUser || !canManageUsers(currentUser)) {
      return NextResponse.json(
        { error: 'Only business owners can modify users' },
        { status: 403 }
      );
    }

    const { role } = await req.json();

    // Validate role
    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user belongs to same business
    if (targetUser.businessId !== session.user.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Prevent changing owner role
    if (targetUser.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot change the role of the business owner' },
        { status: 400 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true
      }
    });

    return NextResponse.json({
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Remove user from business
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user has permission
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, businessId: true }
    });

    if (!currentUser || !canManageUsers(currentUser)) {
      return NextResponse.json(
        { error: 'Only business owners can remove users' },
        { status: 403 }
      );
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user belongs to same business
    if (targetUser.businessId !== session.user.businessId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Prevent removing owner
    if (targetUser.role === 'owner') {
      return NextResponse.json(
        { error: 'Cannot remove the business owner' },
        { status: 400 }
      );
    }

    // Prevent removing self
    if (targetUser.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot remove yourself' },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'User removed successfully'
    });
  } catch (error) {
    console.error('Error removing user:', error);
    return NextResponse.json({ error: 'Failed to remove user' }, { status: 500 });
  }
}
