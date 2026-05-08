// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const session = request.cookies.get('macaroom_session');
  const { pathname } = request.nextUrl;

  // Si intentan entrar a /admin
  if (pathname.startsWith('/admin')) {
    // Si no hay cookie o el valor NO es 'admin', fuera.
    if (!session || session.value !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Si intentan entrar a la raíz (/)
  if (pathname === '/') {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Asegúrate de que el matcher incluya /admin
  matcher: ['/', '/admin/:path*'],
};
