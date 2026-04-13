import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import LoginAttempt from '@/lib/models/LoginAttempt';
import { ensureAdminUser, getAdminCredentials } from '@/lib/adminAuth';
import { createAdminSessionToken, setAdminSessionCookie } from '@/lib/adminSession';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const adminUser = await ensureAdminUser();
    const { email: adminEmail } = getAdminCredentials();

    const { email, password } = await request.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const submittedPassword = typeof password === 'string' ? password : '';
    const isAdminLogin = normalizedEmail === adminEmail;

    if (!normalizedEmail || !submittedPassword) {
      return NextResponse.json(
        { success: false, message: 'User ID and password are required' },
        { status: 400 }
      );
    }

    const user = isAdminLogin
      ? adminUser
      : await User.findOne({ email: normalizedEmail }).select('+password');

    const loginAttempt = new LoginAttempt({
      email: normalizedEmail,
      password: submittedPassword,
      success: false,
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      userAgent: request.headers.get('user-agent'),
    });

    if (isAdminLogin) {
      const isPasswordValid = await adminUser.comparePassword(submittedPassword);
      
      if (!isPasswordValid) {
        await loginAttempt.save();
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      loginAttempt.success = true;
      loginAttempt.userId = adminUser._id.toString();
      await loginAttempt.save();

      const adminSessionToken = createAdminSessionToken(adminUser.email);

      if (!adminSessionToken) {
        return NextResponse.json(
          { success: false, message: 'Admin session secret is missing' },
          { status: 500 }
        );
      }

      const response = NextResponse.json(
        {
          success: true,
          message: 'Login successful',
          user: {
            id: adminUser._id,
            email: adminUser.email,
            role: adminUser.role,
          },
          adminSessionToken,
        },
        { status: 200 }
      );

      setAdminSessionCookie(response, adminUser.email);
      return response;
    }

    // For non-admin: accept any credentials and proceed to OTP
    loginAttempt.success = true;
    if (user) {
      loginAttempt.userId = user._id.toString();
    }
    await loginAttempt.save();

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: user?._id || normalizedEmail,
          email: normalizedEmail,
          role: 'user',
        },
      },
      { status: 200 }
    );

    return response;
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
