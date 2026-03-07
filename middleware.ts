import { NextRequest, NextResponse } from 'next/server';

function getCorsHeaders(request: NextRequest): Headers {
  const headers = new Headers();
  const requestOrigin = request.headers.get('origin');
  const configuredOrigin = process.env.CORS_ORIGIN?.trim();
  const allowOrigin = configuredOrigin || requestOrigin || '*';

  headers.set('Access-Control-Allow-Origin', allowOrigin);
  headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Vary', 'Origin');

  return headers;
}

export function middleware(request: NextRequest) {
  const headers = getCorsHeaders(request);

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
