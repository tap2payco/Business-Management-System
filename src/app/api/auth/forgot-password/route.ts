import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOTP, formatPhoneForBeem } from '@/lib/beem-otp';

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Find user by phone number
    const user = await prisma.user.findUnique({
      where: { phone: formatPhoneForBeem(phone) }
    });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If this phone number is registered, you will receive an OTP code'
      });
    }

    // Send OTP via BeemOTP
    const formattedPhone = formatPhoneForBeem(user.phone);
    const otpResult = await sendOTP(formattedPhone);

    if (!otpResult.success) {
      console.error('Failed to send OTP:', otpResult.error);
      return NextResponse.json(
        { error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    // Store pinId in database for verification
    await prisma.user.update({
      where: { id: user.id },
      data: {
        // We'll add these fields to the User model
        resetPinId: otpResult.pinId,
        resetPinExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }
    });

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully. Please check your phone.',
      // Return masked phone for UI display
      phone: user.phone.replace(/(\d{3})\d{6}(\d{3})/, '$1******$2')
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
