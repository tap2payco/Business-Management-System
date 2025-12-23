import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyOTP, formatPhoneForBeem } from '@/lib/beem-otp';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, newPassword } = await req.json();

    if (!phone || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Phone number, OTP, and new password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone: formatPhoneForBeem(phone) }
    });

    if (!user || !user.resetPinId) {
      return NextResponse.json(
        { error: 'Invalid or expired reset request' },
        { status: 400 }
      );
    }

    // Check if PIN is expired
    if (user.resetPinExpiry && user.resetPinExpiry < new Date()) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP with BeemOTP
    const verifyResult = await verifyOTP(user.resetPinId, otp);

    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.error || 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPinId: null,
        resetPinExpiry: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
