import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';

export async function GET() {
  const start = Date.now();

  try {
    await connectDB();
    await mongoose.connection.db?.admin().ping();

    return NextResponse.json(
      {
        status: 'ok',
        service: 'pnc-bank-backend',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        responseTimeMs: Date.now() - start,
        checks: {
          api: 'up',
          database: 'up',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'degraded',
        service: 'pnc-bank-backend',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime()),
        responseTimeMs: Date.now() - start,
        checks: {
          api: 'up',
          database: 'down',
        },
        error: error instanceof Error ? error.message : 'Database health check failed',
      },
      { status: 503 }
    );
  }
}
