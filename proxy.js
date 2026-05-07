import { NextResponse } from 'next/server';

export function proxy(request) {
  const session = request.cookies.get('macaroom_session');
  const { pathname } = request.nextUrl;

  // 1. SI EL USUARIO YA ESTÁ EN EL LOGIN O EN LA API, NO HACEMOS NADA
  // Esto evita el bucle infinito
  if (pathname === '/login' || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // 2. SI NO HAY SESIÓN Y NO ESTÁ EN EL LOGIN, MANDAR AL LOGIN
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. SI HAY SESIÓN, DEJAR PASAR
  return NextResponse.next();
}

// Esto es vital para que el middleware no vigile archivos internos de Next.js
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

