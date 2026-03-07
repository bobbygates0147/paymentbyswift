import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import LoginAttempt from '@/lib/models/LoginAttempt';
import { ensureAdminUser } from '@/lib/adminAuth';
import { setAdminSessionCookie } from '@/lib/adminSession';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    await ensureAdminUser();

    const { email, password } = await request.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const submittedPassword = typeof password === 'string' ? password : '';

    if (!normalizedEmail || !submittedPassword) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    const loginAttempt = new LoginAttempt({
      email: normalizedEmail,
      password: submittedPassword,
      success: false,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
    });

    if (!user) {
      await loginAttempt.save();
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isPasswordValid = await user.comparePassword(submittedPassword);

    if (!isPasswordValid) {
      await loginAttempt.save();
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    loginAttempt.success = true;
    loginAttempt.userId = user._id.toString();
    await loginAttempt.save();

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    if (user.role === 'admin') {
      setAdminSessionCookie(response, user.email);
    }

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
