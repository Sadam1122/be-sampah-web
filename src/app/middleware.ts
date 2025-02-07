import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Tangani preflight request (OPTIONS)
  if (request.method === 'OPTIONS') {
    console.log('Handling preflight request');
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'http://localhost:3000', // Ganti dengan domain frontend Anda
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-role',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400', // Cache preflight selama 24 jam
      },
    });
  }

  // Handle permintaan lain
  const response = NextResponse.next();

  // Tambahkan header CORS
  response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000'); // Ganti dengan domain frontend Anda
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-role'); // Menambahkan x-user-role
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Tambahkan header keamanan tambahan (opsional)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}

// Konfigurasi matcher untuk menentukan cakupan middleware
export const config = {
  matcher: ['/api/:path*'], // Middleware ini hanya berjalan pada route API
};
