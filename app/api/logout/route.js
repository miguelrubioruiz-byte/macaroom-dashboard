import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('macaroom_session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0, // borra la cookie
  });
  return response;
}