import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const session = cookies().get('macaroom_session');
  return NextResponse.json({ role: session?.value ?? null });
}