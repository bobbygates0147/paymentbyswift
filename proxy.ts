import { NextRequest, NextResponse } from 'next/server';

function normalizeOrigin(origin?: string | null): string | null {
  const normalized = origin?.trim().replace(/\/+$/, '');
  return normalized || null;
}

function getAllowedOrigin(request: NextRequest): string | null {
  const requestOrigin = normalizeOrigin(request.headers.get('origin'));
  if (!requestOrigin) return null;

  const configuredOrigin = normalizeOrigin(process.env.CORS_ORIGIN);
  const sameOrigin = normalizeOrigin(request.nextUrl.origin);

  if (requestOrigin === sameOrigin) {
    return requestOrigin;
  }

  if (configuredOrigin && requestOrigin === configuredOrigin) {
    return requestOrigin;
  }

  if (!configuredOrigin) {
    return requestOrigin;
  }

  return null;
}

function getCorsHeaders(allowedOrigin: string | null): Headers {
  const headers = new Headers();

  if (allowedOrigin) {
    headers.set('Access-Control-Allow-Origin', allowedOrigin);
    headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    headers.set('Vary', 'Origin');
  }

  return headers;
}

export function proxy(request: NextRequest) {
  const requestOrigin = normalizeOrigin(request.headers.get('origin'));
  const allowedOrigin = getAllowedOrigin(request);

  if (requestOrigin && !allowedOrigin) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const headers = getCorsHeaders(allowedOrigin);

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers,
    });
  }

  const response = NextResponse.next();
  headers.forEach((value, key) => response.headers.set(key, value));
  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
