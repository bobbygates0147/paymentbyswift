import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_SESSION_COOKIE_NAME = 'admin_session';
const ADMIN_SESSION_TTL_SECONDS = 60 * 60; // 1 hour

interface AdminSessionPayload {
  email: string;
  role: 'admin';
  exp: number;
}

function getAdminSessionSecret(): string | null {
  const rawSecret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
    '';

  const secret = rawSecret.trim();
  return secret ? secret : null;
}

function signPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

export function createAdminSessionToken(email: string): string | null {
  const secret = getAdminSessionSecret();
  if (!secret) return null;

  const payload: AdminSessionPayload = {
    email,
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS,
  };

  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = signPayload(payloadEncoded, secret);
  return `${payloadEncoded}.${signature}`;
}

export function verifyAdminSessionToken(token?: string | null): AdminSessionPayload | null {
  if (!token) return null;

  const [payloadEncoded, signature] = token.split('.');
  if (!payloadEncoded || !signature) return null;

  const secret = getAdminSessionSecret();
  if (!secret) return null;

  const expectedSignature = signPayload(payloadEncoded, secret);
  if (!safeEqual(signature, expectedSignature)) return null;

  let payload: AdminSessionPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadEncoded, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (!payload?.email || payload.role !== 'admin') return null;
  if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;

  return payload;
}

export function setAdminSessionCookie(response: NextResponse, email: string): void {
  const token = createAdminSessionToken(email);
  if (!token) return;

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
}

export function clearAdminSessionCookie(response: NextResponse): void {
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function getAdminSessionFromRequest(request: NextRequest): AdminSessionPayload | null {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(token);
}
