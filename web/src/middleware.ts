import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const access = req.cookies.get('Authentication');
  const refresh = req.cookies.get('Refresh');

  if (!access && refresh) {
    await fetch(`${process.env.AUTH_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        cookie: req.headers.get('cookie') ?? '',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/protected/:path*',
}
