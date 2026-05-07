import { NextResponse } from 'next/server';

export async function POST(request) {
  const { password } = await request.json();
  
  // Comprueba que coincida con tu .env.local
  if (password === process.env.DASHBOARD_PASSWORD || password === process.env.ADMIN_PASSWORD) {
    const response = NextResponse.json({ ok: true });
    
    response.cookies.set('macaroom_session', 'true', {
      httpOnly: true,
      path: '/',
    });

    return response;
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
