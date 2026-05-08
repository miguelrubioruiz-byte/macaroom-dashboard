// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const session = request.cookies.get('macaroom_session');

 // En middleware.js
if (!session || !session.value) { // Solo verifica que la cookie exista
    return NextResponse.redirect(new URL('/login', request.url));
}

  return NextResponse.next();
}

export const config = {
  // Esto protege TODO excepto: 
  // api, archivos estáticos (_next), imágenes y el propio login
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};