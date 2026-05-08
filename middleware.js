// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const session = request.cookies.get('macaroom_session');

  // Si no hay cookie válida, redirige al login
  if (!session || session.value !== 'true') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Protege solo la ruta del dashboard
export const config = {
  matcher: ['/'],
};