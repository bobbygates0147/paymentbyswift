import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import OTPAttempt from '@/lib/models/OTPAttempt';

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    const otp = generateOTP();

    const otpAttempt = new OTPAttempt({
      email: normalizedEmail,
      otpCode: otp,
      status: 'incorrect',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      isSystemGenerated: true, // Internal record for verification only
      isUserEntered: false,
    });

    await otpAttempt.save();

    // In a real application, you would send this OTP via email
    // For now, we'll return it (only in development)
    console.log(`OTP for ${normalizedEmail}: ${otp}`);

    return NextResponse.json(
      {
        success: true,
        message: 'OTP generated and sent',
        // Only return OTP in development
        ...(process.env.NODE_ENV === 'development' && { otp }),
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
