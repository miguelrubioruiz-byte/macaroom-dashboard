import { NextResponse } from 'next/server';

export async function POST(request) {
  const { password } = await request.json();
  
  if (password === process.env.DASHBOARD_PASSWORD || password === process.env.ADMIN_PASSWORD) {
    const response = NextResponse.json({ ok: true });
    
    response.cookies.set('macaroom_session', 'true', {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 8, // 8 horas
    });

    return response;
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
