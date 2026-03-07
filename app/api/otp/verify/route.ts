import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import OTPAttempt from '@/lib/models/OTPAttempt';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, otp } = await request.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const submittedOtp = typeof otp === 'string' ? otp.trim() : '';

    if (!normalizedEmail || !submittedOtp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Read latest internally generated OTP and compare with what user typed.
    const generatedOtpRecord = await OTPAttempt.findOne({
      email: normalizedEmail,
      isSystemGenerated: true,
      expiresAt: { $gt: new Date() },
    }).sort({ timestamp: -1 });

    const isValid = Boolean(generatedOtpRecord && generatedOtpRecord.otpCode === submittedOtp);

    // Always store only what user entered as an attempt log.
    await OTPAttempt.create({
      email: normalizedEmail,
      otpCode: submittedOtp,
      status: isValid ? 'correct' : 'incorrect',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      isSystemGenerated: false,
      isUserEntered: true,
    });

    if (isValid) {
      // Consume all generated OTPs for this user to keep them one-time.
      await OTPAttempt.deleteMany({
        email: normalizedEmail,
        isSystemGenerated: true,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'OTP verified successfully',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Invalid or expired OTP' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
