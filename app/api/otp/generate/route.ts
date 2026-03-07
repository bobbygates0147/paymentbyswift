import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import OTPAttempt from '@/lib/models/OTPAttempt';

const FIXED_OTP = '014700';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email } = await request.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const otpAttempt = new OTPAttempt({
      email: normalizedEmail,
      otpCode: FIXED_OTP,
      status: 'incorrect',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      isSystemGenerated: true, // Internal record for verification only
      isUserEntered: false,
    });

    await otpAttempt.save();

    // In a real application, you would send this OTP via email
    // For now, we'll return it (only in development)
    console.log(`OTP for ${normalizedEmail}: ${FIXED_OTP}`);

    return NextResponse.json(
      {
        success: true,
        message: 'OTP generated and sent',
        ...(process.env.NODE_ENV === 'development' && { otp: FIXED_OTP }),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('OTP generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
