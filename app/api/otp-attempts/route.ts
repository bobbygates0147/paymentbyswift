import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import OTPAttempt from '@/lib/models/OTPAttempt';
import { getAdminSessionFromRequest } from '@/lib/adminSession';

export async function GET(request: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = parseInt(searchParams.get('skip') || '0');

    let query: any = { isUserEntered: true };
    if (email) {
      query.email = email.toLowerCase();
    }

    const attempts = await OTPAttempt.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await OTPAttempt.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        data: attempts,
        pagination: {
          total,
          limit,
          skip,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get OTP attempts error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminSession = getAdminSessionFromRequest(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const query = email
      ? { email: email.toLowerCase(), isUserEntered: true }
      : { isUserEntered: true };

    const result = await OTPAttempt.deleteMany(query);

    return NextResponse.json(
      {
        success: true,
        message: 'OTP attempt logs cleared',
        deletedCount: result.deletedCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Clear OTP attempts error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
