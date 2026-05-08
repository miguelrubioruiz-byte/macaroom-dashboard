import { NextResponse } from 'next/server';

export async function POST(request) {
  const { password } = await request.json();

  const isAdmin = password === process.env.ADMIN_PASSWORD;
  const isUser  = password === process.env.DASHBOARD_PASSWORD;

  if (!isAdmin && !isUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set('macaroom_session', isAdmin ? 'admin' : 'user', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 8,
  });

  return response;
}
