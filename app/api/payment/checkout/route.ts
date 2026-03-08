import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Payment from '@/lib/models/Payment';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      amount,
      description,
      paymentMethod,
      cardFirstName,
      cardLastName,
      cardNumber,
      securityCode,
      expirationMonth,
      expirationYear,
      streetAddress,
      streetAddress2,
      city,
      state,
      postalCode,
      country,
    } = body;

    // Validate required fields
    if (
      !email ||
      !firstName ||
      !lastName ||
      !amount ||
      !paymentMethod
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate card fields if payment method is credit-card
    if (
      paymentMethod === 'credit-card' &&
      (!cardFirstName ||
        !cardLastName ||
        !cardNumber ||
        !securityCode ||
        !expirationMonth ||
        !expirationYear ||
        !streetAddress ||
        !city ||
        !state ||
        !postalCode ||
        !country)
    ) {
      return NextResponse.json(
        { success: false, message: 'Missing required card fields' },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = new Payment({
      email: email.toLowerCase().trim(),
      firstName,
      lastName,
      amount,
      description,
      paymentMethod,
      cardFirstName,
      cardLastName,
      cardNumber,
      securityCode,
      expirationMonth,
      expirationYear,
      streetAddress,
      streetAddress2,
      city,
      state,
      postalCode,
      country,
      timestamp: new Date(),
    });

    await payment.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Payment submitted successfully',
        paymentId: payment._id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Payment submission error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '200', 10);
    const skip = parseInt(searchParams.get('skip') || '0', 10);

    let query: any = {};
    if (email) {
      query.email = email.toLowerCase().trim();
    }

    const payments = await Payment.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const totalCount = await Payment.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        data: payments,
        totalCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Payment retrieval error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    let query: any = {};
    if (email) {
      query.email = email.toLowerCase().trim();
    }

    const result = await Payment.deleteMany(query);

    return NextResponse.json(
      {
        success: true,
        message: `Deleted ${result.deletedCount} payment record(s)`,
        deletedCount: result.deletedCount,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Payment deletion error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
